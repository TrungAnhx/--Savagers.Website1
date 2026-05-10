export interface Article {
  id: string;
  title: string;
  date: string;
  publishedAt?: string;
  readTime: string;
  excerpt: string;
  content?: string;
  tags: string[];
  link?: string;
  source?: 'spiderum' | 'txnam';
}
