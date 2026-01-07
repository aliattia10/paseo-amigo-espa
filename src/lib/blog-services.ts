import { supabase } from '@/integrations/supabase/client';
import type { Blog } from '@/types';

export const getPublishedBlogs = async (): Promise<Blog[]> => {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }

  return (data || []).map(mapBlog);
};

export const getAllBlogs = async (): Promise<Blog[]> => {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all blogs:', error);
    return [];
  }

  return (data || []).map(mapBlog);
};

export const getBlogBySlug = async (slug: string): Promise<Blog | null> => {
  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching blog by slug:', error);
    return null;
  }

  return data ? mapBlog(data) : null;
};

export const createBlog = async (blogData: Omit<Blog, 'id' | 'createdAt' | 'updatedAt'>) => {
  const { data, error } = await supabase
    .from('blogs')
    .insert({
      title: blogData.title,
      slug: blogData.slug,
      content: blogData.content,
      excerpt: blogData.excerpt,
      author_id: blogData.authorId,
      cover_image: blogData.coverImage,
      published: blogData.published,
    })
    .select()
    .single();

  if (error) throw error;
  return mapBlog(data);
};

export const updateBlog = async (blogId: string, blogData: Partial<Blog>) => {
  const updateData: any = {};
  if (blogData.title) updateData.title = blogData.title;
  if (blogData.slug) updateData.slug = blogData.slug;
  if (blogData.content) updateData.content = blogData.content;
  if (blogData.excerpt) updateData.excerpt = blogData.excerpt;
  if (blogData.coverImage !== undefined) updateData.cover_image = blogData.coverImage;
  if (blogData.published !== undefined) updateData.published = blogData.published;
  
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('blogs')
    .update(updateData)
    .eq('id', blogId)
    .select()
    .single();

  if (error) throw error;
  return mapBlog(data);
};

export const deleteBlog = async (blogId: string) => {
  const { error } = await supabase
    .from('blogs')
    .delete()
    .eq('id', blogId);

  if (error) throw error;
};

const mapBlog = (data: any): Blog => ({
  id: data.id,
  title: data.title,
  slug: data.slug,
  content: data.content,
  excerpt: data.excerpt,
  authorId: data.author_id,
  coverImage: data.cover_image,
  published: data.published,
  createdAt: new Date(data.created_at),
  updatedAt: new Date(data.updated_at),
});

