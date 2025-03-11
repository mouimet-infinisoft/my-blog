export interface Article {
  title: string;
  description: string;
  content: string;
  url: string;
  tags?: string[];
  publishedDate: Date;
}

export interface SocialMediaProvider {
  name: string;
  post(article: Article): Promise<{ success: boolean; postUrl?: string; error?: string }>;
}

export interface SocialMediaConfig {
  devTo?: {
    apiKey: string;
  };
  linkedin?: {
    accessToken: string;
    userId: string;
  };
}