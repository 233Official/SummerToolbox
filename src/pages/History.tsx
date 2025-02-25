import { useEffect, useState } from "react";
import {
  Paper,
  Title,
  Text,
  Table,
  Button,
  Group,
  Badge,
  Tooltip,
  ActionIcon,
  Modal,
  Card,
} from "@mantine/core";
import { IconTrash, IconEye, IconHistory } from "@tabler/icons-react";
import { getHistory, deleteHistoryItem, clearHistory, HistoryItem } from "../utils/storage";

const History = () => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  // 加载历史记录
  const loadHistory = async () => {
    setLoading(true);
    try {
      const items = await getHistory();
      setHistoryItems(items);
    } catch (error) {
      console.error("加载历史记录失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化时加载历史记录
  useEffect(() => {
    loadHistory();
  }, []);

  // 删除单条历史记录
  const handleDelete = async (id: string) => {
    try {
      await deleteHistoryItem(id);
      // 重新加载历史记录
      loadHistory();
    } catch (error) {
      console.error("删除历史记录失败:", error);
    }
  };

  // 清除所有历史记录
  const handleClearAll = async () => {
    try {
      await clearHistory();
      setHistoryItems([]);
      setConfirmClearOpen(false);
    } catch (error) {
      console.error("清除历史记录失败:", error);
    }
  };

  // 查看历史记录详情
  const handleViewDetails = (item: HistoryItem) => {
    setSelectedItem(item);
    setDetailsModalOpen(true);
  };

  // 格式化时间戳
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="history-container">
      <Group position="apart" mb="md">
        <Title order={2}>历史记录</Title>
        <Button 
          color="red" 
          variant="outline" 
          onClick={() => setConfirmClearOpen(true)}
          leftSection={<IconTrash size={14} />}
          disabled={historyItems.length === 0}
        >
          清除所有记录
        </Button>
      </Group>

      <Paper withBorder p="md" radius="md">
        {loading ? (
          <Text>加载中...</Text>
        ) : historyItems.length === 0 ? (
          <Text color="dimmed" align="center" py="xl">
            <IconHistory size={24} />
            <div>暂无历史记录</div>
          </Text>
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>类型</Table.Th>
                <Table.Th>输入预览</Table.Th>
                <Table.Th>输出预览</Table.Th>
                <Table.Th>时间</Table.Th>
                <Table.Th>操作</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {historyItems.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>
                    <Badge color={getTypeColor(item.type)}>{getTypeLabel(item.type)}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Tooltip label={item.input}>
                      <Text truncate maw={150}>
                        {item.input}
                      </Text>
                    </Tooltip>
                  </Table.Td>
                  <Table.Td>
                    <Tooltip label={item.output}>
                      <Text truncate maw={150}>
                        {item.output}
                      </Text>
                    </Tooltip>
                  </Table.Td>
                  <Table.Td>{formatTimestamp(item.timestamp)}</Table.Td>
                  <Table.Td>
                    <Group spacing={5}>
                      <ActionIcon onClick={() => handleViewDetails(item)} color="blue">
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon onClick={() => handleDelete(item.id)} color="red">
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>

      {/* 详情弹窗 */}
      <Modal
        opened={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="操作详情"
        size="lg"
      >
        {selectedItem && (
          <>
            <Group mb="xs">
              <Badge color={getTypeColor(selectedItem.type)}>
                {getTypeLabel(selectedItem.type)}
              </Badge>
              <Text size="sm">{formatTimestamp(selectedItem.timestamp)}</Text>
            </Group>

            <Card withBorder mb="md">
              <Text fw={500} size="sm" mb="xs">输入:</Text>
              <Text
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                  fontFamily: "monospace",
                  background: "#f8f9fa",
                  padding: "10px",
                  borderRadius: "4px",
                }}
              >
                {selectedItem.input}
              </Text>
            </Card>

            <Card withBorder>
              <Text fw={500} size="sm" mb="xs">输出:</Text>
              <Text
                style={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                  fontFamily: "monospace",
                  background: "#f8f9fa",
                  padding: "10px",
                  borderRadius: "4px",
                }}
              >
                {selectedItem.output}
              </Text>
            </Card>
          </>
        )}
      </Modal>

      {/* 确认清除弹窗 */}
      <Modal
        opened={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        title="确认清除"
        size="sm"
      >
        <Text mb="md">确定要清除所有历史记录吗？此操作无法撤销。</Text>
        <Group position="right">
          <Button variant="default" onClick={() => setConfirmClearOpen(false)}>
            取消
          </Button>
          <Button color="red" onClick={handleClearAll}>
            清除
          </Button>
        </Group>
      </Modal>
    </div>
  );
};

// 根据类型获取标签文本
function getTypeLabel(type: string): string {
  switch (type) {
    case 'url_encode': return 'URL编码';
    case 'url_decode': return 'URL解码';
    case 'base64_encode': return 'Base64编码';
    case 'base64_decode': return 'Base64解码';
    case 'unicode_encode': return 'Unicode编码';
    case 'unicode_decode': return 'Unicode解码';
    case 'json_format': return 'JSON格式化';
    default: return type;
  }
}

// 根据类型获取标签颜色
function getTypeColor(type: string): string {
  if (type.includes('encode')) return 'blue';
  if (type.includes('decode')) return 'green';
  if (type.includes('format')) return 'violet';
  return 'gray';
}

export default History;
