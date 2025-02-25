import { useState } from "react";
import {
  Tabs,
  TextInput,
  Textarea,
  Button,
  Group,
  Paper,
  Title,
  Text,
  Divider,
  CopyButton,
  ActionIcon,
  Tooltip,
  FileInput,
} from "@mantine/core";
import { IconLink, IconLetterCase, IconCode, IconCopy, IconCheck } from "@tabler/icons-react";
import { invoke } from "@tauri-apps/api/core";
import { saveHistoryItem } from "../utils/storage";

const EncoderDecoder = () => {
  const [urlText, setUrlText] = useState("");
  const [urlResult, setUrlResult] = useState("");

  const [unicodeText, setUnicodeText] = useState("");
  const [unicodeResult, setUnicodeResult] = useState("");

  const [base64Text, setBase64Text] = useState("");
  const [base64Result, setBase64Result] = useState("");
  const [base64File, setBase64File] = useState<File | null>(null);
  const [base64FileResult, setBase64FileResult] = useState("");

  // URL 编解码
  const encodeUrl = async () => {
    try {
      const encoded = await invoke("encode_url", { text: urlText });
      setUrlResult(encoded as string);
      // 保存到历史记录
      saveHistoryItem("url_encode", urlText, encoded as string);
    } catch (error) {
      console.error("URL编码失败:", error);
      setUrlResult("编码失败: " + String(error));
    }
  };

  const decodeUrl = async () => {
    try {
      const decoded = await invoke("decode_url", { text: urlText });
      setUrlResult(decoded as string);
      // 保存到历史记录
      saveHistoryItem("url_decode", urlText, decoded as string);
    } catch (error) {
      console.error("URL解码失败:", error);
      setUrlResult("解码失败: " + String(error));
    }
  };

  // Unicode 编解码
  const encodeUnicode = async () => {
    try {
      const encoded = await invoke("encode_unicode", { text: unicodeText });
      setUnicodeResult(encoded as string);
      // 保存到历史记录
      saveHistoryItem("unicode_encode", unicodeText, encoded as string);
    } catch (error) {
      console.error("Unicode编码失败:", error);
      setUnicodeResult("编码失败: " + String(error));
    }
  };

  const decodeUnicode = async () => {
    try {
      const decoded = await invoke("decode_unicode", { text: unicodeText });
      setUnicodeResult(decoded as string);
      // 保存到历史记录
      saveHistoryItem("unicode_decode", unicodeText, decoded as string);
    } catch (error) {
      console.error("Unicode解码失败:", error);
      setUnicodeResult("解码失败: " + String(error));
    }
  };

  // Base64 编解码
  const encodeBase64 = async () => {
    try {
      const encoded = await invoke("encode_base64", { text: base64Text });
      setBase64Result(encoded as string);
      // 保存到历史记录
      saveHistoryItem("base64_encode", base64Text, encoded as string);
    } catch (error) {
      console.error("Base64编码失败:", error);
      setBase64Result("编码失败: " + String(error));
    }
  };

  const decodeBase64 = async () => {
    try {
      const decoded = await invoke("decode_base64", { text: base64Text });
      setBase64Result(decoded as string);
      // 保存到历史记录
      saveHistoryItem("base64_decode", base64Text, decoded as string);
    } catch (error) {
      console.error("Base64解码失败:", error);
      setBase64Result("解码失败: " + String(error));
    }
  };

  // Base64 文件编码
  const encodeBase64File = async () => {
    if (!base64File) return;
    
    try {
      // 这里需要实现文件的Base64编码
      // 这是前端实现的方式，实际项目中可以发送到后端处理
      const reader = new FileReader();
      reader.readAsDataURL(base64File);
      reader.onload = () => {
        const base64 = reader.result as string;
        // 移除Data URL前缀 (如 "data:image/png;base64,")
        const base64Data = base64.substring(base64.indexOf(',') + 1);
        setBase64FileResult(base64Data);
        // 保存到历史记录
        saveHistoryItem("base64_file_encode", base64File.name, base64Data);
      };
    } catch (error) {
      console.error("文件Base64编码失败:", error);
      setBase64FileResult("编码失败: " + String(error));
    }
  };

  return (
    <div className="encoder-decoder-container">
      <Title order={2} mb="md">编解码工具</Title>
      <Tabs defaultValue="url" className="encoder-tab">
        <Tabs.List>
          <Tabs.Tab value="url" leftSection={<IconLink size={14} />}>URL编解码</Tabs.Tab>
          <Tabs.Tab value="unicode" leftSection={<IconLetterCase size={14} />}>Unicode编解码</Tabs.Tab>
          <Tabs.Tab value="base64" leftSection={<IconCode size={14} />}>Base64编解码</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="url" pt="xs">
          <Paper withBorder p="md" radius="md">
            <Text size="sm" fw={500} mb="md">URL 编解码</Text>
            <Textarea
              label="输入文本"
              placeholder="输入需要编解码的文本"
              value={urlText}
              onChange={(e) => setUrlText(e.currentTarget.value)}
              minRows={3}
              mb="md"
            />
            <Group mb="md">
              <Button onClick={encodeUrl}>编码</Button>
              <Button onClick={decodeUrl} variant="outline">解码</Button>
            </Group>
            <Divider my="sm" label="结果" labelPosition="center" />
            <Group position="apart" mb="xs">
              <Text size="sm" fw={500}>结果输出</Text>
              <CopyButton value={urlResult} timeout={2000}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? "已复制" : "复制到剪贴板"} withArrow position="right">
                    <ActionIcon color={copied ? "teal" : "gray"} onClick={copy}>
                      {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
            <Textarea
              value={urlResult}
              readOnly
              minRows={3}
            />
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="unicode" pt="xs">
          <Paper withBorder p="md" radius="md">
            <Text size="sm" fw={500} mb="md">Unicode 编解码</Text>
            <Textarea
              label="输入文本"
              placeholder="输入需要编解码的文本"
              value={unicodeText}
              onChange={(e) => setUnicodeText(e.currentTarget.value)}
              minRows={3}
              mb="md"
            />
            <Group mb="md">
              <Button onClick={encodeUnicode}>转换为Unicode</Button>
              <Button onClick={decodeUnicode} variant="outline">转换为文本</Button>
            </Group>
            <Divider my="sm" label="结果" labelPosition="center" />
            <Group position="apart" mb="xs">
              <Text size="sm" fw={500}>结果输出</Text>
              <CopyButton value={unicodeResult} timeout={2000}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? "已复制" : "复制到剪贴板"} withArrow position="right">
                    <ActionIcon color={copied ? "teal" : "gray"} onClick={copy}>
                      {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
            <Textarea
              value={unicodeResult}
              readOnly
              minRows={3}
            />
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="base64" pt="xs">
          <Paper withBorder p="md" radius="md">
            <Text size="sm" fw={500} mb="md">Base64 文本编解码</Text>
            <Textarea
              label="输入文本"
              placeholder="输入需要编解码的文本"
              value={base64Text}
              onChange={(e) => setBase64Text(e.currentTarget.value)}
              minRows={3}
              mb="md"
            />
            <Group mb="md">
              <Button onClick={encodeBase64}>编码</Button>
              <Button onClick={decodeBase64} variant="outline">解码</Button>
            </Group>
            <Divider my="sm" label="结果" labelPosition="center" />
            <Group position="apart" mb="xs">
              <Text size="sm" fw={500}>结果输出</Text>
              <CopyButton value={base64Result} timeout={2000}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? "已复制" : "复制到剪贴板"} withArrow position="right">
                    <ActionIcon color={copied ? "teal" : "gray"} onClick={copy}>
                      {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
            <Textarea
              value={base64Result}
              readOnly
              minRows={3}
            />
          </Paper>

          <Paper withBorder p="md" radius="md" mt="xl">
            <Text size="sm" fw={500} mb="md">Base64 文件编码</Text>
            <FileInput
              label="选择文件"
              placeholder="选择需要编码的文件"
              value={base64File}
              onChange={setBase64File}
              mb="md"
            />
            <Button onClick={encodeBase64File} disabled={!base64File}>编码文件</Button>
            <Divider my="sm" label="结果" labelPosition="center" />
            <Group position="apart" mb="xs">
              <Text size="sm" fw={500}>Base64 结果</Text>
              <CopyButton value={base64FileResult} timeout={2000}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? "已复制" : "复制到剪贴板"} withArrow position="right">
                    <ActionIcon color={copied ? "teal" : "gray"} onClick={copy}>
                      {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
            <Textarea
              value={base64FileResult}
              readOnly
              maxRows={10}
              autosize
              styles={{
                input: {
                  maxHeight: '250px',
                  overflowY: 'auto'
                }
              }}
            />
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default EncoderDecoder;
