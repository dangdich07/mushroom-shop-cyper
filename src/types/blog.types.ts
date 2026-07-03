export interface BlogAuthor {
  name: string;
  role: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: BlogAuthor;
  tags: string[];
  readTimeMinutes: number;
  publishedAt: string;
  viewCount: number;
}