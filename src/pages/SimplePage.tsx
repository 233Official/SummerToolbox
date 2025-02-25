import { Text, Container, Title, Paper } from '@mantine/core';

function SimplePage({ title = "测试页面" }) {
  console.log(`SimplePage rendering: ${title}`);
  
  return (
    <Container size="md">
      <Title order={1} mb="md">{title}</Title>
      <Paper p="md" withBorder>
        <Text>这是一个简单的页面，当前页面：{title}</Text>
        <Text mt="md">如果您能看到这条消息，说明基本渲染功能正常。</Text>
      </Paper>
    </Container>
  );
}

export default SimplePage;
