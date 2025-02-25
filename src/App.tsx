import { useState } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import {
  Box,
  Flex,
  Text,
  Title,
  Group,
  Container,
  UnstyledButton,
  ThemeIcon,
} from "@mantine/core";
import {
  IconHome,
  IconCode,
  IconBraces,
  IconHistory,
} from "@tabler/icons-react";

// 导入基本页面组件
import SimplePage from "./pages/SimplePage";
import HomePage from "./pages/HomePage";

// 侧边栏链接组件
interface MainLinkProps {
  icon: React.ReactNode;
  color: string;
  label: string;
  path: string;
  onClick: () => void;
}

function MainLink({ icon, color, label, path, onClick }: MainLinkProps) {
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
        width: "100%",  // 确保 NavLink 占满宽度
      }}
    >
      <UnstyledButton
        sx={{
          display: "block",
          width: "100%",  // 已经设置了100%宽度
          padding: "10px",
          borderRadius: "4px",
          color: "#000",
          "&:hover": {
            backgroundColor: "#f0f0f0",
          },
        }}
      >
        <Group>
          <ThemeIcon color={color} variant="light">
            {icon}
          </ThemeIcon>
          <Text size="sm">{label}</Text>
        </Group>
      </UnstyledButton>
    </NavLink>
  );
}

function App() {
  const [opened, setOpened] = useState(false);
  
  console.log("App with sidebar rendering");

  // 导航数据
  const navigationLinks = [
    {
      icon: <IconHome size={16} />,
      color: "blue",
      label: "主页",
      path: "/",
    },
    {
      icon: <IconCode size={16} />,
      color: "teal",
      label: "编解码工具",
      path: "/encoder",
    },
    {
      icon: <IconBraces size={16} />,
      color: "violet",
      label: "JSON 格式化",
      path: "/json",
    },
    {
      icon: <IconHistory size={16} />,
      color: "orange",
      label: "历史记录",
      path: "/history",
    },
  ];

  const links = navigationLinks.map((link) => (
    <MainLink {...link} key={link.label} onClick={() => {}} />
  ));

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
          p="xs"
          style={{
            borderRight: "1px solid #ddd",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            width: "250px", // 明确设置宽度
          }}
        >
          <Box 
            style={{ 
              flex: 1,
              display: "flex",
              flexDirection: "column",
              width: "100%" // 确保子容器占满宽度
            }} 
            mt="xs"
          >
            {links}
          </Box>
          <Box
            p="xs"
            style={{
              borderTop: "1px solid #ddd",
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
            <Route path="/encoder" element={<SimplePage title="编解码工具" />} />
            <Route path="/json" element={<SimplePage title="JSON 格式化" />} />
            <Route path="/history" element={<SimplePage title="历史记录" />} />
            <Route path="*" element={<SimplePage title="页面未找到" />} />
          </Routes>
        </Box>
      </Flex>
    </Flex>
  );
}

export default App;
