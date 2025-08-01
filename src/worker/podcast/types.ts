// 播客节目类型定义
export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  content?: string; // 详细内容（可选）
  audioUrl: string;
  audioPath: string; // R2 中的文件路径
  duration?: number; // 音频时长（秒）
  fileSize?: number; // 文件大小（字节）
  publishDate: string; // ISO 日期字符串
  author?: string;
  keywords?: string[];
  imageUrl?: string; // 封面图片
  explicit?: boolean; // 是否包含成人内容
  season?: number;
  episode?: number;
  createdAt: string;
  updatedAt: string;
}

// 播客频道信息
export interface PodcastChannel {
  id: string;
  title: string;
  description: string;
  language: string; // 语言代码，如 'zh-CN'
  author: string;
  email: string;
  category: string; // 播客分类
  subcategory?: string;
  imageUrl: string; // 频道封面
  websiteUrl?: string;
  explicit: boolean;
  createdAt: string;
  updatedAt: string;
}

// XML Feed 生成选项
export interface PodcastFeedOptions {
  channel: PodcastChannel;
  episodes: PodcastEpisode[];
  baseUrl: string; // 你的 Worker 域名
} 