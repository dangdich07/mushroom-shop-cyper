import type { SupabaseClient } from "@supabase/supabase-js";
import type { BlogPost } from "./blog.types";

interface BlogRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  author_name: string;
  author_role: string;
  tags: string[] | null;
  read_time_minutes: number;
  view_count: number;
  published_at: string;
}

const BLOG_COLUMNS = "id, slug, title, excerpt, content, cover_image, author_name, author_role, tags, read_time_minutes, view_count, published_at";

function mapBlog(row: BlogRow): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    coverImage: row.cover_image,
    author: { name: row.author_name, role: row.author_role },
    tags: row.tags ?? [],
    readTimeMinutes: row.read_time_minutes,
    viewCount: row.view_count,
    publishedAt: new Date(row.published_at).toLocaleDateString("vi-VN"),
  };
}

export async function getBlogPosts(client: SupabaseClient): Promise<BlogPost[]> {
  const { data, error } = await client.from("blogs").select(BLOG_COLUMNS).order("published_at", { ascending: false });
  if (error) throw new Error("BLOG_LIST_QUERY_FAILED");
  return ((data ?? []) as BlogRow[]).map(mapBlog);
}

export async function getBlogPost(client: SupabaseClient, slug: string): Promise<BlogPost | null> {
  const { error: viewError } = await client.rpc("increment_blog_views", { blog_slug: slug });
  if (viewError) throw new Error("BLOG_VIEW_INCREMENT_FAILED");

  const { data, error } = await client.from("blogs").select(BLOG_COLUMNS).eq("slug", slug).maybeSingle();
  if (error) throw new Error("BLOG_DETAIL_QUERY_FAILED");
  return data ? mapBlog(data as BlogRow) : null;
}

