import { useState } from "react";
import { 
  Box, 
  Tabs, 
  Textarea, 
  Button, 
  Group, 
  Title, 
  Text, 
  Paper,
  FileInput,
  Divider,
  CopyButton,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { 
  IconArrowDown,
  IconFileUpload, 
  IconLink, 
  IconCode, 
  IconLetterCase, 
  IconHtml, 
  IconCopy,
  IconCheck,
  IconClearAll,
} from "@tabler/icons-react";
import { invoke } from "@tauri-apps/api/core";

// 编解码类型
type EncoderDecoderTab = "url" | "unicode" | "base64" | "html";

// 编解码器界面
function EncoderDecoder() {
  const [activeTab, setActiveTab] = useState<EncoderDecoderTab>("url");
  
  // URL编码状态
  const [urlInput, setUrlInput] = useState("");
  const [urlOutput, setUrlOutput] = useState("");
  
  // Unicode编码状态
  const [unicodeInput, setUnicodeInput] = useState("");
  const [unicodeOutput, setUnicodeOutput] = useState("");
  
  // Base64编码状态
  const [base64Input, setBase64Input] = useState("");
  const [base64Output, setBase64Output] = useState("");
  const [base64File, setBase64File] = useState<File | null>(null);
  const [base64FileOutput, setBase64FileOutput] = useState("");
  
  // HTML编码状态
  const [htmlInput, setHtmlInput] = useState("");
  const [htmlOutput, setHtmlOutput] = useState("");
  
  // 错误处理状态
  const [errorMsg, setErrorMsg] = useState("");
  
  // 显示成功通知的函数
  const showSuccess = () => {
    // 在实际应用中可以使用通知组件
    console.log("操作成功");
  };

  // URL编解码
  const handleUrlEncode = async () => {
    if (!urlInput.trim()) return;
    
    try {
      setErrorMsg("");
      const result = await invoke("encode_url", { text: urlInput });
      setUrlOutput(result as string);
      showSuccess();
    } catch (error) {
      console.error("URL编码失败:", error);
      setErrorMsg(`URL编码失败: ${error}`);
    }
  };
  
  const handleUrlDecode = async () => {
    if (!urlInput.trim()) return;
    
    try {
      setErrorMsg("");
      const result = await invoke("decode_url", { text: urlInput });
      setUrlOutput(result as string);
      showSuccess();
    } catch (error) {
      console.error("URL解码失败:", error);
      setErrorMsg(`URL解码失败: ${error}`);
    }
  };

  // Unicode编解码
  const handleUnicodeEncode = async () => {
    if (!unicodeInput.trim()) return;
    
    try {
      setErrorMsg("");
      const result = await invoke("encode_unicode", { text: unicodeInput });
      setUnicodeOutput(result as string);
      showSuccess();
    } catch (error) {
      console.error("Unicode编码失败:", error);
      setErrorMsg(`Unicode编码失败: ${error}`);
    }
  };
  
  const handleUnicodeDecode = async () => {
    if (!unicodeInput.trim()) return;
    
    try {
      setErrorMsg("");
      const result = await invoke("decode_unicode", { text: unicodeInput });
      setUnicodeOutput(result as string);
      showSuccess();
    } catch (error) {
      console.error("Unicode解码失败:", error);
      setErrorMsg(`Unicode解码失败: ${error}`);
    }
  };

  // Base64编解码
  const handleBase64Encode = async () => {
    if (!base64Input.trim()) return;
    
    try {
      setErrorMsg("");
      const result = await invoke("encode_base64", { text: base64Input });
      setBase64Output(result as string);
      showSuccess();
    } catch (error) {
      console.error("Base64编码失败:", error);
      setErrorMsg(`Base64编码失败: ${error}`);
    }
  };
  
  const handleBase64Decode = async () => {
    if (!base64Input.trim()) return;
    
    try {
      setErrorMsg("");
      const result = await invoke("decode_base64", { text: base64Input });
      setBase64Output(result as string);
      showSuccess();
    } catch (error) {
      console.error("Base64解码失败:", error);
      setErrorMsg(`Base64解码失败: ${error}`);
    }
  };
  
  // 处理文件Base64编码
  const handleFileEncode = () => {
    if (!base64File) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === "string") {
        // 去除Data URI部分
        const base64 = event.target.result.split(",")[1];
        setBase64FileOutput(base64);
      }
    };
    reader.readAsDataURL(base64File);
  };

  // HTML编解码
  const handleHtmlEncode = async () => {
    if (!htmlInput.trim()) return;
    
    try {
      setErrorMsg("");
      const result = await invoke("encode_html", { text: htmlInput });
      setHtmlOutput(result as string);
      showSuccess();
    } catch (error) {
      console.error("HTML编码失败:", error);
      setErrorMsg(`HTML编码失败: ${error}`);
    }
  };
  
  const handleHtmlDecode = async () => {
    if (!htmlInput.trim()) return;
    
    try {
      setErrorMsg("");
      const result = await invoke("decode_html", { text: htmlInput });
      setHtmlOutput(result as string);
      showSuccess();
    } catch (error) {
      console.error("HTML解码失败:", error);
      setErrorMsg(`HTML解码失败: ${error}`);
    }
  };
  
  // 清空输入输出
  const handleClear = (type: EncoderDecoderTab) => {
    switch (type) {
      case "url":
        setUrlInput("");
        setUrlOutput("");
        break;
      case "unicode":
        setUnicodeInput("");
        setUnicodeOutput("");
        break;
      case "base64":
        setBase64Input("");
        setBase64Output("");
        setBase64File(null);
        setBase64FileOutput("");
        break;
      case "html":
        setHtmlInput("");
        setHtmlOutput("");
        break;
    }
    setErrorMsg("");
  };
  
  // 输入输出互换
  const swapInputOutput = (type: EncoderDecoderTab) => {
    switch (type) {
      case "url":
        setUrlInput(urlOutput);
        setUrlOutput("");
        break;
      case "unicode":
        setUnicodeInput(unicodeOutput);
        setUnicodeOutput("");
        break;
      case "base64":
        setBase64Input(base64Output);
        setBase64Output("");
        break;
      case "html":
        setHtmlInput(htmlOutput);
        setHtmlOutput("");
        break;
    }
  };

  // 渲染编解码工具界面
  return (
    <Box p="md">
      <Title order={2} mb="lg">编解码工具</Title>
      
      <Tabs value={activeTab} onChange={(value) => setActiveTab(value as EncoderDecoderTab)}>
        <Tabs.List>
          <Tabs.Tab value="url" leftSection={<IconLink size={16} />}>URL编码</Tabs.Tab>
          <Tabs.Tab value="unicode" leftSection={<IconLetterCase size={16} />}>Unicode编码</Tabs.Tab>
          <Tabs.Tab value="base64" leftSection={<IconCode size={16} />}>Base64编码</Tabs.Tab>
          <Tabs.Tab value="html" leftSection={<IconHtml size={16} />}>HTML编码</Tabs.Tab>
        </Tabs.List>

        {/* URL编解码面板 */}
        <Tabs.Panel value="url" pt="md">
          <Paper withBorder p="md" radius="md">
            <Group justify="apart" mb="sm">
              <Text fw={500}>输入文本</Text>
              <Group>
                <ActionIcon variant="subtle" onClick={() => handleClear("url")} title="清空">
                  <IconClearAll size={16} />
                </ActionIcon>
              </Group>
            </Group>
            <Textarea
              value={urlInput}
              onChange={(e) => setUrlInput(e.currentTarget.value)}
              minRows={6}
              placeholder="请输入要编码或解码的URL文本..."
              mb="md"
            />
            
            <Group justify="center" mb="md">
              <Button onClick={handleUrlEncode} leftSection={<IconArrowDown size={16} />}>
                URL编码
              </Button>
              <Button onClick={handleUrlDecode} variant="outline" leftSection={<IconArrowDown size={16} />}>
                URL解码
              </Button>
              <Button 
                variant="subtle" 
                onClick={() => swapInputOutput("url")}
                disabled={!urlOutput}
              >
                交换输入输出
              </Button>
            </Group>
            
            <Divider my="sm" label="结果" labelPosition="center" />
            
            <Group justify="apart" mb="sm">
              <Text fw={500}>输出结果</Text>
              <CopyButton value={urlOutput} timeout={2000}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? "已复制" : "复制到剪贴板"} withArrow>
                    <ActionIcon color={copied ? "teal" : "gray"} onClick={copy}>
                      {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
            
            <Textarea
              value={urlOutput}
              readOnly
              minRows={6}
              placeholder="编码或解码结果将显示在这里..."
            />
          </Paper>
        </Tabs.Panel>

        {/* Unicode编解码面板 */}
        <Tabs.Panel value="unicode" pt="md">
          <Paper withBorder p="md" radius="md">
            <Group justify="apart" mb="sm">
              <Text fw={500}>输入文本</Text>
              <Group>
                <ActionIcon variant="subtle" onClick={() => handleClear("unicode")} title="清空">
                  <IconClearAll size={16} />
                </ActionIcon>
              </Group>
            </Group>
            <Textarea
              value={unicodeInput}
              onChange={(e) => setUnicodeInput(e.currentTarget.value)}
              minRows={6}
              placeholder="请输入要编码或解码的Unicode文本..."
              mb="md"
            />
            
            <Group justify="center" mb="md">
              <Button onClick={handleUnicodeEncode} leftSection={<IconArrowDown size={16} />}>
                Unicode编码
              </Button>
              <Button onClick={handleUnicodeDecode} variant="outline" leftSection={<IconArrowDown size={16} />}>
                Unicode解码
              </Button>
              <Button 
                variant="subtle" 
                onClick={() => swapInputOutput("unicode")}
                disabled={!unicodeOutput}
              >
                交换输入输出
              </Button>
            </Group>
            
            <Divider my="sm" label="结果" labelPosition="center" />
            
            <Group justify="apart" mb="sm">
              <Text fw={500}>输出结果</Text>
              <CopyButton value={unicodeOutput} timeout={2000}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? "已复制" : "复制到剪贴板"} withArrow>
                    <ActionIcon color={copied ? "teal" : "gray"} onClick={copy}>
                      {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
            
            <Textarea
              value={unicodeOutput}
              readOnly
              minRows={6}
              placeholder="编码或解码结果将显示在这里..."
            />
          </Paper>
        </Tabs.Panel>

        {/* Base64编解码面板 */}
        <Tabs.Panel value="base64" pt="md">
          <Paper withBorder p="md" radius="md">
            <Group justify="apart" mb="sm">
              <Text fw={500}>文本编解码</Text>
              <Group>
                <ActionIcon variant="subtle" onClick={() => handleClear("base64")} title="清空">
                  <IconClearAll size={16} />
                </ActionIcon>
              </Group>
            </Group>
            <Textarea
              value={base64Input}
              onChange={(e) => setBase64Input(e.currentTarget.value)}
              minRows={6}
              placeholder="请输入要编码或解码的Base64文本..."
              mb="md"
            />
            
            <Group justify="center" mb="md">
              <Button onClick={handleBase64Encode} leftSection={<IconArrowDown size={16} />}>
                Base64编码
              </Button>
              <Button onClick={handleBase64Decode} variant="outline" leftSection={<IconArrowDown size={16} />}>
                Base64解码
              </Button>
              <Button 
                variant="subtle" 
                onClick={() => swapInputOutput("base64")}
                disabled={!base64Output}
              >
                交换输入输出
              </Button>
            </Group>
            
            <Divider my="sm" label="文本结果" labelPosition="center" />
            
            <Group justify="apart" mb="sm">
              <Text fw={500}>输出结果</Text>
              <CopyButton value={base64Output} timeout={2000}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? "已复制" : "复制到剪贴板"} withArrow>
                    <ActionIcon color={copied ? "teal" : "gray"} onClick={copy}>
                      {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
            
            <Textarea
              value={base64Output}
              readOnly
              minRows={6}
              placeholder="编码或解码结果将显示在这里..."
              mb="xl"
            />
            
            <Divider my="md" label="文件编码" labelPosition="center" />
            
            <FileInput
              value={base64File}
              onChange={setBase64File}
              placeholder="选择要编码的文件"
              mb="md"
              leftSection={<IconFileUpload size={16} />}
              clearable
            />
            
            <Group mb="md">
              <Button onClick={handleFileEncode} disabled={!base64File}>
                编码文件
              </Button>
            </Group>
            
            {base64FileOutput && (
              <>
                <Group justify="apart" mb="sm">
                  <Text fw={500}>文件Base64编码结果</Text>
                  <CopyButton value={base64FileOutput} timeout={2000}>
                    {({ copied, copy }) => (
                      <Tooltip label={copied ? "已复制" : "复制到剪贴板"} withArrow>
                        <ActionIcon color={copied ? "teal" : "gray"} onClick={copy}>
                          {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </CopyButton>
                </Group>
                <Textarea
                  value={base64FileOutput}
                  readOnly
                  minRows={4}
                  maxRows={8}
                  styles={{
                    input: { 
                      fontFamily: 'monospace',
                      fontSize: '0.9em'
                    }
                  }}
                />
              </>
            )}
          </Paper>
        </Tabs.Panel>

        {/* HTML编解码面板 */}
        <Tabs.Panel value="html" pt="md">
          <Paper withBorder p="md" radius="md">
            <Group justify="apart" mb="sm">
              <Text fw={500}>输入文本</Text>
              <Group>
                <ActionIcon variant="subtle" onClick={() => handleClear("html")} title="清空">
                  <IconClearAll size={16} />
                </ActionIcon>
              </Group>
            </Group>
            <Textarea
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.currentTarget.value)}
              minRows={6}
              placeholder="请输入要编码或解码的HTML文本..."
              mb="md"
            />
            
            <Group justify="center" mb="md">
              <Button onClick={handleHtmlEncode} leftSection={<IconArrowDown size={16} />}>
                HTML编码
              </Button>
              <Button onClick={handleHtmlDecode} variant="outline" leftSection={<IconArrowDown size={16} />}>
                HTML解码
              </Button>
              <Button 
                variant="subtle" 
                onClick={() => swapInputOutput("html")}
                disabled={!htmlOutput}
              >
                交换输入输出
              </Button>
            </Group>
            
            <Divider my="sm" label="结果" labelPosition="center" />
            
            <Group justify="apart" mb="sm">
              <Text fw={500}>输出结果</Text>
              <CopyButton value={htmlOutput} timeout={2000}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? "已复制" : "复制到剪贴板"} withArrow>
                    <ActionIcon color={copied ? "teal" : "gray"} onClick={copy}>
                      {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
            
            <Textarea
              value={htmlOutput}
              readOnly
              minRows={6}
              placeholder="编码或解码结果将显示在这里..."
            />
          </Paper>
        </Tabs.Panel>
      </Tabs>
      
      {/* 错误消息显示 */}
      {errorMsg && (
        <Paper 
          withBorder 
          p="sm" 
          mt="md" 
          radius="md" 
          style={{ backgroundColor: '#FFF4F4' }}
        >
          <Text color="red" size="sm">{errorMsg}</Text>
        </Paper>
      )}
    </Box>
  );
}

export default EncoderDecoder;
