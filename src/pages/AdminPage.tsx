import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getAllBlogs, deleteBlog, updateBlog } from '@/lib/blog-services';
import type { Blog } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Eye, EyeOff, LayoutDashboard, FileText, Settings } from 'lucide-react';

const AdminPage: React.FC = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/home');
      return;
    }

    if (isAdmin) {
      fetchBlogs();
    }
  }, [isAdmin, authLoading, navigate]);

  const fetchBlogs = async () => {
    setLoading(true);
    const data = await getAllBlogs();
    setBlogs(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await deleteBlog(id);
        toast({ title: 'Success', description: 'Blog post deleted successfully' });
        fetchBlogs();
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete blog post', variant: 'destructive' });
      }
    }
  };

  const togglePublished = async (blog: Blog) => {
    try {
      await updateBlog(blog.id, { published: !blog.published });
      toast({ title: 'Success', description: `Blog ${blog.published ? 'unpublished' : 'published'} successfully` });
      fetchBlogs();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update blog status', variant: 'destructive' });
    }
  };

  if (authLoading || loading) return <div className="flex items-center justify-center min-h-screen">Loading Admin Portal...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-2 px-2">
          <img src="/app-logo.png" alt="Petflik" className="h-8 w-auto" />
          <span className="font-bold text-xl dark:text-white">Admin</span>
        </div>
        
        <nav className="flex flex-col gap-2">
          <button className="flex items-center gap-3 px-4 py-2 rounded-lg bg-medium-jungle text-white font-medium">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
          <button 
            onClick={() => navigate('/blog')}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
          >
            <FileText className="w-5 h-5" />
            View Blog
          </button>
          <button className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
            <Settings className="w-5 h-5" />
            Settings
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold dark:text-white">Blog Management</h1>
            <Button 
              onClick={() => navigate('/admin/blog/new')}
              className="bg-medium-jungle hover:bg-medium-jungle/90 text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              New Blog Post
            </Button>
          </div>

          <div className="grid gap-6">
            {blogs.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">
                  No blog posts found. Create your first post to boost SEO!
                </CardContent>
              </Card>
            ) : (
              blogs.map((blog) => (
                <Card key={blog.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {blog.coverImage && (
                      <div className="md:w-48 h-32 md:h-auto">
                        <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-xl font-bold dark:text-white">{blog.title}</h2>
                            {blog.published ? (
                              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">Published</span>
                            ) : (
                              <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium">Draft</span>
                            )}
                          </div>
                          <p className="text-gray-500 text-sm mb-4">{blog.excerpt}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => togglePublished(blog)}
                            title={blog.published ? 'Unpublish' : 'Publish'}
                          >
                            {blog.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => navigate(`/admin/blog/edit/${blog.id}`)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(blog.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        Slug: {blog.slug} | Created: {new Date(blog.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;

