import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublishedBlogs } from '@/lib/blog-services';
import type { Blog } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, User } from 'lucide-react';
import SEO from '@/components/SEO';

const BlogListPage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    const data = await getPublishedBlogs();
    setBlogs(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEO 
        title="Petflik Blog - Pet Care Tips & Community Stories" 
        description="Stay updated with the latest pet care tips, dog walking advice, and heartwarming stories from the Petflik community."
      />

      {/* Header */}
      <div className="bg-medium-jungle text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Petflik Blog</h1>
          <p className="text-xl text-sage-green/10 max-w-2xl mx-auto">
            Everything you need to know about caring for your furry friends.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-xl"></div>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Coming Soon!</h2>
            <p className="text-gray-500">We're working on some great stories for you.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <Card key={blog.id} className="overflow-hidden flex flex-col hover:shadow-xl transition-all border-none">
                {blog.coverImage && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={blog.coverImage} 
                      alt={blog.title} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <CardHeader className="p-6 pb-2">
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold line-clamp-2 dark:text-white group-hover:text-medium-jungle transition-colors">
                    {blog.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0 flex-1">
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 line-clamp-3">
                    {blog.excerpt}
                  </p>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-medium-jungle font-bold group"
                    onClick={() => navigate(`/blog/${blog.slug}`)}
                  >
                    Read More
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogListPage;

