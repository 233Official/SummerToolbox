import { useState, useRef } from "react";
import {
  Box,
  Button,
  Flex,
  Group,
  NumberInput,
  Radio,
  Title,
  Text,
  Card,
  Divider,
  Image,
  Stack,
  Paper,
  ActionIcon,
} from "@mantine/core";
import { open as dialogOpen, save, message, ask } from "@tauri-apps/plugin-dialog";
import { openPath } from "@tauri-apps/plugin-opener";
import { invoke } from "@tauri-apps/api/core";
import { writeFile } from "@tauri-apps/plugin-fs";
import { IconFolder, IconDownload, IconTrash } from "@tabler/icons-react";

export default function ImageConverter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [convertedImageData, setConvertedImageData] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [format, setFormat] = useState("png");
  const [width, setWidth] = useState<number | string>(128);
  const [height, setHeight] = useState<number | string>(128);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件选择
  const handleFileSelection = async () => {
    try {
      // 使用dialogOpen而不是dialog.open
      const selected = await dialogOpen({
        multiple: false,
        filters: [
          {
            name: "Images",
            extensions: ["png", "jpg", "jpeg", "gif", "bmp", "ico", "svg"],
          },
        ],
      });
      
      if (!selected) return;
      
      const filePath = Array.isArray(selected) ? selected[0] : selected;
      
      // 通过fetch获取文件内容（如果是本地文件）
      const response = await fetch(`file://${filePath}`);
      const blob = await response.blob();
      
      const fileName = filePath.split("/").pop() || filePath.split("\\").pop() || "image";
      
      // 创建File对象
      const file = new File([blob], fileName, { type: blob.type });
      
      setSelectedFile(file);
      setConvertedImageData(null);
      
      // 创建预览
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("选择文件出错:", error);
    }
  };

  // 清除选择
  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewImage(null);
    setConvertedImageData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 转换图像
  const convertImage = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const fileData = await selectedFile.arrayBuffer();
      const fileBytes = new Uint8Array(fileData);
      
      // 调用后端转换API
      const result = await invoke<number[]>("convert_image", {
        imageData: Array.from(fileBytes),
        format: format,
        width: Number(width),
        height: Number(height),
      });

      // 处理返回的二进制数据
      const resultBytes = new Uint8Array(result);
      let blob: Blob;
      let mimeType: string;
      
      switch (format) {
        case "svg":
          mimeType = "image/svg+xml";
          // 将Uint8Array转换回字符串，用于SVG
          const decoder = new TextDecoder("utf-8");
          const svgString = decoder.decode(resultBytes);
          blob = new Blob([svgString], { type: mimeType });
          break;
        case "ico":
          mimeType = "image/x-icon";
          blob = new Blob([resultBytes], { type: mimeType });
          break;
        case "jpeg":
        case "jpg":
          mimeType = "image/jpeg";
          blob = new Blob([resultBytes], { type: mimeType });
          break;
        default:
          mimeType = "image/png";
          blob = new Blob([resultBytes], { type: mimeType });
      }

      // 创建URL用于预览
      const url = URL.createObjectURL(blob);
      setConvertedImageData(url);
    } catch (error) {
      console.error("转换出错:", error);
    } finally {
      setLoading(false);
    }
  };

  // 保存转换后的图像
  const saveImage = async () => {
    if (!convertedImageData || !selectedFile) return;
    
    try {
      const originalFileName = selectedFile.name.split(".")[0] || "image";
      
      // 使用save而不是dialog.save
      const savePath = await save({
        defaultPath: `${originalFileName}.${format}`,
        filters: [
          {
            name: format.toUpperCase(),
            extensions: [format],
          },
        ],
      });
      
      if (!savePath) return;
      
      // 从预览URL获取数据
      const response = await fetch(convertedImageData);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // 将文件写入磁盘
      await writeFile(savePath, uint8Array);
      
      // 询问是否要打开文件
      // 使用ask而不是dialog.ask
      const shouldOpen = await ask("文件已保存。要打开它吗？", {
        title: "保存成功",
      });
      
      if (shouldOpen) {
        // 使用正确的 openPath 函数
        await openPath(savePath);
      }
    } catch (error: any) {
      console.error("保存文件出错:", error);
      // 仅使用 message 函数，不带 type 参数
      await message("保存文件失败。请检查权限并重试。", {
        title: "保存错误"
      });
    }
  };

  // 图像格式选项
  const formatOptions = [
    { value: "png", label: "PNG" },
    { value: "jpg", label: "JPEG/JPG" },
    { value: "ico", label: "ICO" },
    { value: "svg", label: "SVG" }
  ];

  return (
    <Box p="md">
      <Title order={3} mb={8}>图像格式转换器</Title>
      <Text c="dimmed" mb={16}>
        转换图像格式和调整尺寸
      </Text>

      <Flex direction={{ base: "column", md: "row" }} gap="md" align="stretch">
        {/* 左侧面板 - 上传和选项 */}
        <Card shadow="sm" padding="md" withBorder style={{ flex: 1 }}>
          <Stack gap="md">
            {/* 上传区域 */}
            <Paper
              withBorder
              p="md"
              style={{
                minHeight: 150,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
                position: "relative",
              }}
              onClick={handleFileSelection}
            >
              <IconFolder size={36} color="gray" />
              <Text size="sm" c="dimmed" mt={8} ta="center">
                {selectedFile ? selectedFile.name : "点击选择图片"}
              </Text>
              
              {selectedFile && (
                <ActionIcon
                  style={{ position: "absolute", top: 10, right: 10 }}
                  color="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearSelection();
                  }}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              )}
              
              {previewImage && (
                <Image
                  src={previewImage}
                  alt="预览"
                  fit="contain"
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    opacity: 0.2,
                    zIndex: 0,
                  }}
                />
              )}
            </Paper>

            <Divider my="sm" />

            {/* 转换选项 */}
            <Box>
              <Text size="sm" fw={500} mb={5}>
                输出格式
              </Text>
              <Radio.Group value={format} onChange={setFormat} mb="sm">
                <Group>
                  {formatOptions.map((option) => (
                    <Radio
                      key={option.value}
                      value={option.value}
                      label={option.label}
                    />
                  ))}
                </Group>
              </Radio.Group>
            </Box>

            <Flex gap="md">
              <NumberInput
                label="宽度"
                value={width}
                onChange={setWidth}
                min={1}
                max={2000}
                style={{ flex: 1 }}
              />
              <NumberInput
                label="高度"
                value={height}
                onChange={setHeight}
                min={1}
                max={2000}
                style={{ flex: 1 }}
              />
            </Flex>

            <Button
              onClick={convertImage}
              loading={loading}
              disabled={!selectedFile}
              fullWidth
            >
              {loading ? "转换中..." : "转换"}
            </Button>
          </Stack>
        </Card>

        {/* 右侧面板 - 预览和下载 */}
        <Card shadow="sm" padding="md" withBorder style={{ flex: 1 }}>
          <Stack gap="md">
            <Text size="sm" fw={500} mb={5}>
              转换结果
            </Text>
            <Paper
              withBorder
              p="md"
              style={{
                minHeight: 200,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
              }}
            >
              {convertedImageData ? (
                <>
                  <Image
                    src={convertedImageData}
                    alt="转换后的图像"
                    fit="contain"
                    style={{ maxHeight: 300 }}
                  />
                  <Button
                    leftSection={<IconDownload size={16} />}
                    style={{
                      position: "absolute",
                      bottom: 10,
                      right: 10,
                    }}
                    onClick={saveImage}
                    variant="light"
                  >
                    保存
                  </Button>
                </>
              ) : (
                <Text c="dimmed" size="sm">
                  转换后的图像将在这里显示
                </Text>
              )}
            </Paper>
          </Stack>
        </Card>
      </Flex>
    </Box>
  );
}
