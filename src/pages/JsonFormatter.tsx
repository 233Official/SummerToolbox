import { useState } from "react";
import {
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
  NumberInput,
  Switch,
} from "@mantine/core";
import { IconCopy, IconCheck, IconWand } from "@tabler/icons-react";

const JsonFormatter = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [formattedJson, setFormattedJson] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [indent, setIndent] = useState(2);
  const [sortKeys, setSortKeys] = useState(false);

  const formatJson = () => {
    try {
      setErrorMessage("");
      const parsedJson = JSON.parse(jsonInput);
      const formatted = JSON.stringify(
        parsedJson,
        sortKeys ? Object.keys(parsedJson).sort() : undefined,
        indent
      );
      setFormattedJson(formatted);
    } catch (error) {
      console.error("JSON格式化失败:", error);
      setErrorMessage(`格式化错误: ${(error as Error).message}`);
      setFormattedJson("");
    }
  };

  const minifyJson = () => {
    try {
      setErrorMessage("");
      const parsedJson = JSON.parse(jsonInput);
      const minified = JSON.stringify(parsedJson);
      setFormattedJson(minified);
    } catch (error) {
      console.error("JSON压缩失败:", error);
      setErrorMessage(`压缩错误: ${(error as Error).message}`);
      setFormattedJson("");
    }
  };

  return (
    <div className="json-formatter-container">
      <Title order={2} mb="md">JSON 格式化工具</Title>
      
      <Paper withBorder p="md" radius="md">
        <Text size="sm" fw={500} mb="md">JSON 编辑器</Text>
        <Textarea
          placeholder="在此粘贴JSON数据..."
          value={jsonInput}
          onChange={(e) => setJsonInput(e.currentTarget.value)}
          minRows={10}
          mb="md"
          styles={{
            input: {
              fontFamily: "monospace",
            }
          }}
        />
        
        <Group mb="md">
          <Button onClick={formatJson} leftSection={<IconWand size={14} />}>
            格式化
          </Button>
          <Button onClick={minifyJson} variant="outline">
            压缩
          </Button>
          <NumberInput
            value={indent}
            onChange={(value) => setIndent(Number(value))}
            min={0}
            max={8}
            label="缩进空格数"
            w={120}
          />
          <Switch
            label="按键名排序"
            checked={sortKeys}
            onChange={(e) => setSortKeys(e.currentTarget.checked)}
          />
        </Group>
        
        {errorMessage && (
          <Text color="red" size="sm" mb="md">
            {errorMessage}
          </Text>
        )}
        
        <Divider my="sm" label="结果" labelPosition="center" />
        
        <Group position="apart" mb="xs">
          <Text size="sm" fw={500}>格式化结果</Text>
          <CopyButton value={formattedJson} timeout={2000}>
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
          value={formattedJson}
          readOnly
          minRows={10}
          styles={{
            input: {
              fontFamily: "monospace",
            }
          }}
        />
      </Paper>
    </div>
  );
};

export default JsonFormatter;
