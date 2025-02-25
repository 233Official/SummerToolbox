import { Text, Container, Title, Paper, Group, Button } from '@mantine/core';
import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

function HomePage() {
  const [greeting, setGreeting] = useState('');
  const [name, setName] = useState('');
  
  async function greet() {
    try {
      const message = await invoke('greet', { name });
      setGreeting(message);
    } catch (error) {
      console.error('Error invoking greet:', error);
      setGreeting('Error: Failed to call Rust function');
    }
  }
  
  return (
    <Container size="md">
      <Title order={1} mb="md">欢迎使用 Summer Toolbox</Title>
      <Paper p="md" withBorder mb="lg">
        <Text>这是一个多功能工具箱应用，提供编码解码、JSON格式化等功能。</Text>
        <Text mt="md">请从左侧菜单选择需要使用的工具。</Text>
      </Paper>
      
      <Paper p="md" withBorder>
        <Title order={3} mb="md">测试 Tauri 函数调用</Title>
        <Group mb="md">
          <input 
            placeholder="输入你的名字"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
          />
          <Button onClick={greet}>
            打招呼
          </Button>
        </Group>
        {greeting && (
          <Text mt="md" fw={500}>{greeting}</Text>
        )}
      </Paper>
    </Container>
  );
}

export default HomePage;
