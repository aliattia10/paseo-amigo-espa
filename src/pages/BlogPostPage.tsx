import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBlogBySlug } from '@/lib/blog-services';
import type { Blog } from '@/types';
import { ArrowLeft, Calendar, Clock, Share2 } from 'lucide-react';
import SEO from '@/components/SEO';

const BlogPostPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  const fetchBlog = async () => {
    setLoading(true);
    const data = await getBlogBySlug(slug!);
    setBlog(data);
    setLoading(false);
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-20 animate-pulse">
      <div className="h-10 bg-gray-200 dark:bg-gray-800 w-3/4 mb-6 rounded"></div>
      <div className="h-64 bg-gray-200 dark:bg-gray-800 w-full mb-12 rounded-xl"></div>
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-800 w-full rounded"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-800 w-full rounded"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-800 w-2/3 rounded"></div>
      </div>
    </div>
  );

  if (!blog) return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold mb-4">Post not found</h1>
      <button 
        onClick={() => navigate('/blog')}
        className="text-medium-jungle hover:underline"
      >
        Return to Blog
      </button>
    </div>
  );

  return (
    <article className="min-h-screen bg-white dark:bg-gray-900 pb-20">
      <SEO 
        title={`${blog.title} - Petflik Blog`} 
        description={blog.excerpt}
      />

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 pt-12">
        <button
          onClick={() => navigate('/blog')}
          className="flex items-center gap-2 text-gray-500 hover:text-medium-jungle transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Articles
        </button>

        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
          {blog.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-12 border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date(blog.createdAt).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {Math.ceil(blog.content.split(' ').length / 200)} min read
          </div>
        </div>
      </div>

      {blog.coverImage && (
        <div className="max-w-5xl mx-auto px-4 mb-12">
          <img 
            src={blog.coverImage} 
            alt={blog.title} 
            className="w-full h-[400px] object-cover rounded-2xl shadow-2xl"
          />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {/* Content rendering - splitting by newlines for basic formatting */}
          {blog.content.split('\n').map((paragraph, i) => (
            paragraph.trim() ? <p key={i} className="mb-6 leading-relaxed text-gray-700 dark:text-gray-300">{paragraph}</p> : <br key={i} />
          ))}
        </div>

        <div className="mt-16 pt-12 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-sage-green/10 p-3 rounded-full">
              <Share2 className="w-5 h-5 text-medium-jungle" />
            </div>
            <span className="font-semibold dark:text-white">Share this article</span>
          </div>
          
          <button 
            onClick={() => navigate('/home')}
            className="bg-medium-jungle text-white px-6 py-2 rounded-full font-bold hover:shadow-lg transition-all"
          >
            Join Petflik Community
          </button>
        </div>
      </div>
    </article>
  );
};

export default BlogPostPage;

