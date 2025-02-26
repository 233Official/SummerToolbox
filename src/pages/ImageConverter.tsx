import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Title,
  Paper,
  Group,
  Text,
  Button,
  FileInput,
  SegmentedControl,
  NumberInput,
  Stack,
  Image,
  Select,
  Divider,
  ActionIcon,
  Tooltip,
  CopyButton,
  Badge,
  Alert,
  Progress,
  Grid,
} from '@mantine/core';
import {
  IconUpload,
  IconDownload,
  IconArrowRight,
  IconRefresh,
  IconCheck,
  IconX,
  IconPhoto,
  IconAspectRatio,
} from '@tabler/icons-react';
import { invoke } from '@tauri-apps/api/core';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';

// 预定义尺寸
const predefinedSizes = [
  { value: '16', label: '16x16' },
  { value: '32', label: '32x32' },
  { value: '48', label: '48x48' },
  { value: '64', label: '64x64' },
  { value: '128', label: '128x128' },
  { value: '256', label: '256x256' },
];

// 支持的输出格式
const outputFormats = [
  { value: 'svg', label: 'SVG' },
  { value: 'ico', label: 'ICO' },
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'jpg', label: 'JPG' },
];

const ImageConverter = () => {
  // 状态
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [outputFormat, setOutputFormat] = useState<string>('svg');
  const [sizeOption, setSizeOption] = useState<'predefined' | 'custom'>('predefined');
  const [selectedSize, setSelectedSize] = useState<string>('32');
  const [customWidth, setCustomWidth] = useState<number>(32);
  const [customHeight, setCustomHeight] = useState<number>(32);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [outputData, setOutputData] = useState<Uint8Array | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLButtonElement>(null);

  // 处理文件上传
  const handleFileChange = (uploadedFile: File | null) => {
    if (!uploadedFile) {
      setFile(null);
      setPreviewUrl('');
      setOutputImage(null);
      setOutputData(null);
      setAspectRatio(null);
      return;
    }

    // 检查文件类型
    if (!uploadedFile.type.startsWith('image/')) {
      setError('请上传有效的图片文件');
      return;
    }

    setFile(uploadedFile);
    setError('');
    
    // 创建预览URL
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === 'string') {
        setPreviewUrl(e.target.result);
      }
    };
    reader.readAsDataURL(uploadedFile);
  };
  
  // 当预览URL变化时，计算图像宽高比
  useEffect(() => {
    if (previewUrl) {
      const imgElement = new window.Image();
      imgElement.onload = () => {
        setAspectRatio(imgElement.width / imgElement.height);
      };
      imgElement.onerror = () => {
        setError('加载图片失败，无法计算宽高比');
      };
      imgElement.src = previewUrl;
    }
  }, [previewUrl]);
  
  // 处理尺寸选项变更
  const handleSizeOptionChange = (value: string) => {
    // 将 value 断言为特定类型，因为我们知道它只可能是这两个值之一
    setSizeOption(value as 'predefined' | 'custom');
    if (value === 'predefined') {
      setCustomWidth(parseInt(selectedSize));
      setCustomHeight(parseInt(selectedSize));
    }
  };

  // 处理预定义尺寸变更
  const handlePredefinedSizeChange = (value: string | null, _option: any) => {
    if (value === null) return;
    
    setSelectedSize(value);
    if (maintainAspectRatio) {
      setCustomWidth(parseInt(value));
      setCustomHeight(parseInt(value));
    }
  };
  
  // 处理宽度变更时保持宽高比
  const handleWidthChange = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseInt(value) || 0 : value;
    setCustomWidth(numValue);
    if (maintainAspectRatio && aspectRatio !== null) {
      setCustomHeight(Math.round(numValue / aspectRatio));
    }
  };

  // 处理高度变更时保持宽高比
  const handleHeightChange = (value: string | number) => {
    const numValue = typeof value === 'string' ? parseInt(value) || 0 : value;
    setCustomHeight(numValue);
    if (maintainAspectRatio && aspectRatio !== null) {
      setCustomWidth(Math.round(numValue * aspectRatio));
    }
  };

  // 转换图像
  const handleConvert = async () => {
    if (!file) {
      setError('请先上传一张图片');
      return;
    }

    setLoading(true);
    setError('');
    setOutputImage(null);
    setOutputData(null);

    try {
      // 读取文件内容为Base64
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      
      reader.onload = async (e) => {
        if (!e.target || !e.target.result) {
          setError('读取文件失败');
          setLoading(false);
          return;
        }
        
        const buffer = e.target.result as ArrayBuffer;
        const uint8Array = new Uint8Array(buffer);
        
        // 确定尺寸
        const width = sizeOption === 'predefined' ? parseInt(selectedSize) : customWidth;
        const height = sizeOption === 'predefined' ? parseInt(selectedSize) : customHeight;
        
        try {
          // 调用Rust函数进行转换
          const result: Uint8Array = await invoke('convert_image', {
            imageData: Array.from(uint8Array),
            format: outputFormat,
            width,
            height,
          });
          
          setOutputData(result);
          
          // 为显示创建数据URL
          const blob = new Blob([result], { 
            type: outputFormat === 'svg' 
              ? 'image/svg+xml' 
              : outputFormat === 'ico'
                ? 'image/x-icon'
                : outputFormat === 'jpeg' || outputFormat === 'jpg'
                  ? 'image/jpeg'
                  : 'image/png'
          });
          const url = URL.createObjectURL(blob);
          setOutputImage(url);
        } catch (error) {
          console.error('转换失败:', error);
          setError(`转换失败: ${error}`);
        } finally {
          setLoading(false);
        }
      };
      
      reader.onerror = () => {
        setError('读取文件失败');
        setLoading(false);
      };
    } catch (error) {
      setError(`处理文件失败: ${error}`);
      setLoading(false);
    }
  };

  // 保存转换后的文件
  const handleSave = async () => {
    if (!outputData || !file) return;
    
    try {
      const defaultName = file.name.split('.')[0] + '.' + outputFormat;
      
      // 弹出保存对话框
      const filePath = await save({
        defaultPath: defaultName,
        filters: [
          {
            name: outputFormat.toUpperCase(),
            extensions: [outputFormat],
          },
        ],
      });
      
      if (filePath) {
        // 写入文件，使用 writeFile 替代 writeBinaryFile
        await writeFile(filePath, outputData);
      }
    } catch (error) {
      console.error('保存文件失败:', error);
      setError(`保存文件失败: ${error}`);
    }
  };

  // 重置所有
  const handleReset = () => {
    setFile(null);
    setPreviewUrl('');
    setOutputImage(null);
    setOutputData(null);
    setError('');
    setSizeOption('predefined');
    setSelectedSize('32');
    setCustomWidth(32);
    setCustomHeight(32);
    setMaintainAspectRatio(true);
    setAspectRatio(null);
  };

  return (
    <Box p="md">
      <Title order={2} mb="lg">图像格式转换</Title>
      
      <Grid grow>
        <Grid.Col span={6}>
          <Paper withBorder p="md" radius="md">
            <Title order={4} mb="md">输入</Title>
            
            <FileInput
              ref={fileInputRef}
              value={file}
              onChange={handleFileChange}
              placeholder="选择PNG图片"
              accept="image/*"
              leftSection={<IconUpload size={16} />}
              clearable
              mb="md"
            />
            
            {previewUrl && (
              <Box mb="md" style={{ textAlign: 'center' }}>
                <Text mb="xs" size="sm" c="dimmed">原始图片预览</Text>
                <Box pos="relative">
                  <Image 
                    src={previewUrl} 
                    alt="预览"
                    style={{ maxWidth: 200, maxHeight: '200px', margin: '0 auto' }}
                    fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'%3E%3Cpath fill='%23cccccc' d='M2 6H0v5h.01L0 20c0 1.1.9 2 2 2h18v-2H2V6zm20-2h-8l-2-2H6c-1.1 0-1.99.9-1.99 2L4 16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM7 15l4.5-6l3.5 4.51l2.5-3.01L21 15H7z'%3E%3C/path%3E%3C/svg%3E"
                  />
                </Box>
                <Text mt={5} size="xs" c="dimmed">
                  {file?.name} ({file?.size ? (file.size / 1024).toFixed(1) + ' KB' : ''})
                </Text>
              </Box>
            )}
            
            <Divider my="md" />
            
            <Stack gap="md">
              <Box>
                <Text style={{ fontWeight: 500 }} size="sm" mb={5}>输出格式</Text>
                <SegmentedControl
                  value={outputFormat}
                  onChange={setOutputFormat}
                  data={outputFormats}
                  fullWidth
                />
              </Box>
              
              <Box>
                <Text style={{ fontWeight: 500 }} size="sm" mb={5}>尺寸选项</Text>
                <SegmentedControl
                  value={sizeOption}
                  onChange={handleSizeOptionChange}
                  data={[
                    { value: 'predefined', label: '预设尺寸' },
                    { value: 'custom', label: '自定义尺寸' },
                  ]}
                  fullWidth
                  mb="xs"
                />
                
                {sizeOption === 'predefined' ? (
                  <Select
                    data={predefinedSizes}
                    value={selectedSize}
                    onChange={handlePredefinedSizeChange}
                    placeholder="选择尺寸"
                  />
                ) : (
                  <Group align="flex-end">
                    <NumberInput
                      label="宽度"
                      value={customWidth}
                      onChange={(value) => handleWidthChange(value)}
                      min={1}
                      max={1024}
                    />
                    <Text size="lg" mb="sm">×</Text>
                    <NumberInput
                      label="高度"
                      value={customHeight}
                      onChange={(value) => handleHeightChange(value)}
                      min={1}
                      max={1024}
                    />
                    <Tooltip label="保持宽高比">
                      <ActionIcon 
                        color={maintainAspectRatio ? "blue" : "gray"}
                        onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}
                        variant={maintainAspectRatio ? "filled" : "subtle"}
                      >
                        <IconAspectRatio size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                )}
              </Box>
            </Stack>
            
            <Group justify="apart" mt="xl">
              <Button 
                variant="outline" 
                leftSection={<IconRefresh size={16} />}
                onClick={handleReset}
              >
                重置
              </Button>
              <Button 
                leftSection={<IconArrowRight size={16} />}
                onClick={handleConvert}
                loading={loading}
                disabled={!file}
              >
                转换
              </Button>
            </Group>
            
            {error && (
              <Alert icon={<IconX size={16} />} color="red" mt="md" title="错误">
                {error}
              </Alert>
            )}
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={6}>
          <Paper withBorder p="md" radius="md" h="100%">
            <Title order={4} mb="md">输出</Title>
            
            {loading ? (
              <Box py="lg">
                <Text style={{ textAlign: 'center' }} mb="md">正在处理中...</Text>
                <Progress value={100} animated={true} />
              </Box>
            ) : outputImage ? (
              <>
                <Box mb="md" style={{ textAlign: 'center' }}>
                  <Group justify="center" mb="xs">
                    <Text size="sm" c="dimmed">转换结果</Text>
                    <Badge>{outputFormat.toUpperCase()}</Badge>
                  </Group>
                  <Box
                    style={{ 
                      background: 'repeating-conic-gradient(#f5f5f5 0% 25%, transparent 0% 50%) 0% 0% / 20px 20px',
                      padding: '20px',
                      borderRadius: '4px'
                    }}
                  >
                    {outputFormat === 'svg' ? (
                      <div
                        style={{ maxHeight: '200px', height: '200px' }}
                        dangerouslySetInnerHTML={{ __html: new TextDecoder().decode(outputData as Uint8Array) }}
                      />
                    ) : (
                      <Image
                        src={outputImage}
                        alt="转换结果"
                        style={{ maxWidth: 200, maxHeight: '200px', margin: '0 auto' }}
                        fallbackSrc="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'%3E%3Cpath fill='%23cccccc' d='M2 6H0v5h.01L0 20c0 1.1.9 2 2 2h18v-2H2V6zm20-2h-8l-2-2H6c-1.1 0-1.99.9-1.99 2L4 16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM7 15l4.5-6l3.5 4.51l2.5-3.01L21 15H7z'%3E%3C/path%3E%3C/svg%3E"
                      />
                    )}
                  </Box>
                </Box>
                
                <Divider my="md" />
                
                <Group justify="center">
                  <Button 
                    onClick={handleSave} 
                    disabled={!outputData}
                    leftSection={<IconDownload size={16} />}
                  >
                    保存文件
                  </Button>
                </Group>
              </>
            ) : (
              <Box py="xl" style={{ textAlign: 'center' }}>
                <Text style={{ color: 'var(--mantine-color-dimmed)' }}>
                  {file ? '点击"转换"按钮开始处理图像' : '请先上传一张图片'}
                </Text>
              </Box>
            )}
          </Paper>
        </Grid.Col>
      </Grid>
    </Box>
  );
};

export default ImageConverter;
