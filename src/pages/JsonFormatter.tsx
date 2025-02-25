import { useState } from 'react';
import {
  Box,
  Button,
  Textarea,
  Paper,
  Title,
  Group,
  SegmentedControl,
  ActionIcon,
  Tooltip,
  CopyButton,
  Text,
  Flex,
  Alert,
} from '@mantine/core';
import { 
  IconArrowsMinimize, 
  IconArrowsMaximize, 
  IconBraces, 
  IconCheck, 
  IconCopy, 
  IconX, 
  IconTrash
} from '@tabler/icons-react';

const JsonFormatter = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [jsonOutput, setJsonOutput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [indentSize, setIndentSize] = useState('2');

  // 格式化JSON
  const formatJson = () => {
    if (!jsonInput.trim()) {
      setErrorMessage('请输入要格式化的JSON');
      return;
    }

    try {
      // 解析JSON以验证格式
      const parsed = JSON.parse(jsonInput);
      // 格式化并输出
      const formatted = JSON.stringify(
        parsed, 
        null, 
        parseInt(indentSize)
      );
      setJsonOutput(formatted);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(`格式化失败: ${(error as Error).message}`);
    }
  };

  // 压缩JSON
  const compressJson = () => {
    if (!jsonInput.trim()) {
      setErrorMessage('请输入要压缩的JSON');
      return;
    }

    try {
      // 解析JSON以验证格式
      const parsed = JSON.parse(jsonInput);
      // 输出不带缩进的紧凑字符串
      const compressed = JSON.stringify(parsed);
      setJsonOutput(compressed);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(`压缩失败: ${(error as Error).message}`);
    }
  };

  // 清空输入输出
  const clearAll = () => {
    setJsonInput('');
    setJsonOutput('');
    setErrorMessage('');
  };

  return (
    <Box p="md">
      <Title order={2} mb="lg">JSON 格式化</Title>
      
      <Paper withBorder p="md" radius="md">
        <Group justify="apart" mb="xs">
          <Text fw={500}>JSON 输入</Text>
          <ActionIcon variant="subtle" onClick={clearAll} title="清空">
            <IconTrash size={16} />
          </ActionIcon>
        </Group>

        <Textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.currentTarget.value)}
          placeholder="在这里粘贴要格式化的JSON数据..."
          minRows={10}
          maxRows={15}
          styles={{
            input: {
              fontFamily: 'monospace',
            },
          }}
          mb="md"
        />

        <Group mb="md">
          <Button leftSection={<IconBraces size={16} />} onClick={formatJson}>
            格式化
          </Button>
          <Button 
            variant="outline" 
            leftSection={<IconArrowsMinimize size={16} />} 
            onClick={compressJson}
          >
            压缩
          </Button>
          <Group ml="md">
            <Text size="sm">缩进:</Text>
            <SegmentedControl
              value={indentSize}
              onChange={setIndentSize}
              data={[
                { label: '2空格', value: '2' },
                { label: '4空格', value: '4' },
                { label: 'Tab', value: '1' },
              ]}
              size="xs"
            />
          </Group>
        </Group>

        {errorMessage && (
          <Alert 
            icon={<IconX size={16} />} 
            title="错误" 
            color="red" 
            mb="md"
            withCloseButton
            onClose={() => setErrorMessage('')}
          >
            {errorMessage}
          </Alert>
        )}

        {jsonOutput && (
          <>
            <Group justify="apart" mb="xs">
              <Text fw={500}>格式化结果</Text>
              <CopyButton value={jsonOutput} timeout={2000}>
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
              value={jsonOutput}
              readOnly
              minRows={10}
              maxRows={15}
              styles={{
                input: {
                  fontFamily: 'monospace',
                  backgroundColor: '#f9f9f9',
                },
              }}
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default JsonFormatter;
