// localStorage based storage implementation
// This is a fallback until the Tauri store plugin is properly configured

export interface HistoryItem {
  id: string;
  type: string;
  input: string;
  output: string;
  timestamp: number;
}

// 本地存储键
const HISTORY_KEY = 'summer_toolbox_history';

// 保存历史记录
export async function saveHistoryItem(type: string, input: string, output: string): Promise<void> {
  const history = await getHistory() || [];
  
  // 创建新的历史记录项
  const newItem: HistoryItem = {
    id: Date.now().toString(),
    type,
    input,
    output,
    timestamp: Date.now()
  };
  
  // 将新记录添加到历史记录的开头
  history.unshift(newItem);
  
  // 限制历史记录数量为50条
  const limitedHistory = history.slice(0, 50);
  
  // 保存到本地存储
  localStorage.setItem(HISTORY_KEY, JSON.stringify(limitedHistory));
}

// 获取历史记录
export async function getHistory(): Promise<HistoryItem[]> {
  const historyData = localStorage.getItem(HISTORY_KEY);
  return historyData ? JSON.parse(historyData) : [];
}

// 清除历史记录
export async function clearHistory(): Promise<void> {
  localStorage.removeItem(HISTORY_KEY);
}

// 删除指定的历史记录项
export async function deleteHistoryItem(id: string): Promise<void> {
  const history = await getHistory();
  const updatedHistory = history.filter(item => item.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
}
