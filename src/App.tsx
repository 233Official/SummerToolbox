import { Routes, Route, NavLink } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Title,
  Group,
} from "@mantine/core";

// 导入基本页面组件
import SimplePage from "./pages/SimplePage";
import HomePage from "./pages/HomePage";
import EncoderDecoder from "./pages/EncoderDecoder";
import JsonFormatter from "./pages/JsonFormatter";
import History from "./pages/History";

// 侧边栏链接组件 - 简化版
interface MainLinkProps {
  label: string;
  path: string;
  onClick: () => void;
}

function MainLink({ label, path, onClick }: MainLinkProps) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) =>
        isActive ? "main-link active-link" : "main-link"
      }
      onClick={onClick}
      style={{ 
        textDecoration: "none",
        display: "block",
        width: "100%",
      }}
    >
      <Box
        style={{
          padding: "14px 16px",
          borderRadius: "4px",
          color: "#333",
          transition: "all 0.2s ease",
          borderBottom: "1px solid #eaeaea",
          marginBottom: "4px",
          // 将之前 sx 中的样式移到这里
          "&:hover": {
            backgroundColor: "#f5f5f5",
          },
        }}
      >
        <Text size="md">{label}</Text>
      </Box>
    </NavLink>
  );
}

function App() {
  console.log("App with sidebar rendering");

  return (
    <Flex h="100vh" direction="column">
      {/* Header */}
      <Box
        p="xs"
        h={60}
        style={{
          borderBottom: "1px solid #ddd",
        }}
      >
        <Group style={{ height: "100%" }} px={20} justify="space-between">
          <Title order={3}>Summer Toolbox</Title>
        </Group>
      </Box>

      <Flex style={{ flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <Box
          w={250}
          p="md"
          style={{
            borderRight: "1px solid #ddd",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            width: "250px",
          }}
        >
          {/* 导航链接区域 */}
          <Box 
            style={{ 
              flex: 1,
              display: "flex",
              flexDirection: "column",
              width: "100%"
            }} 
            mt="xs"
          >
            {/* 简化为单一列表 */}
            <MainLink label="主页" path="/" onClick={() => {}} />
            <MainLink label="编解码工具" path="/encoder" onClick={() => {}} />
            <MainLink label="JSON 格式化" path="/json" onClick={() => {}} />
            <MainLink label="历史记录" path="/history" onClick={() => {}} />
          </Box>
          
          {/* 底部版本信息 */}
          <Box
            p="xs"
            style={{
              borderTop: "1px solid #ddd",
              marginTop: "auto",
            }}
          >
            <Text size="xs" c="dimmed" ta="center">
              Summer Toolbox v0.1.0
            </Text>
          </Box>
        </Box>

        {/* Main content */}
        <Box p="md" style={{ flex: 1, overflow: "auto" }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/encoder" element={<EncoderDecoder />} />
            <Route path="/json" element={<JsonFormatter />} />
            <Route path="/history" element={<History />} />
            <Route path="*" element={<SimplePage title="页面未找到" />} />
          </Routes>
        </Box>
      </Flex>
    </Flex>
  );
}

export default App;
