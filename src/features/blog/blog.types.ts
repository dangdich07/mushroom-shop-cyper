export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: {
    name: string;
    role: string;
  };
  tags: string[];
  readTimeMinutes: number;
  viewCount: number;
  publishedAt: string;
}

