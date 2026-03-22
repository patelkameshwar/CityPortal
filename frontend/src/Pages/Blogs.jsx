import React, { useState, useEffect } from 'react';
import api, { blogAPI } from '../services/api.js';
import { toast } from 'react-toastify';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedBlog, setExpandedBlog] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogAPI.getAll();
      setBlogs(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
      setError('Failed to load blogs');
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading blogs...</p>
        </div>
      </div>
    );
  }

  const handleReadMore = (blog) => {
    const fullContent = blog.content || blog.excerpt + ' Read the full detailed article with more insights, tips, and information.';
    if (blog.content) {
      navigator.clipboard.writeText(blog.content);
      toast.success('Full content copied to clipboard!');
    } else {
      alert(fullContent);
    }
  };

  return (
    <div className="py-12">
      <style>
      {`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}
      </style>
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-8">Our Blog</h1>
        <p className="text-gray-600 text-center mb-12">Latest news, tips, and guides for your city adventures</p>
        
        {error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchBlogs}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No blogs available yet.</p>
            <p className="text-sm text-gray-400">Check back soon for updates!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {blogs.map((blog) => (
              <div key={blog._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full">
                      {blog.category}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {blog.date ? new Date(blog.date).toLocaleDateString('en-US', { 
                        year: 'numeric', month: 'short', day: 'numeric' 
                      }) : new Date(blog.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', month: 'short', day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">{blog.title}</h2>
                  <div className="mb-4">
                    <p className={`text-gray-600 ${expandedBlog === blog._id ? '' : 'line-clamp-3'}`}>
                      {blog.excerpt}
                    </p>
                    {expandedBlog === blog._id && blog.content && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-2">Full Content:</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{blog.content}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">By {blog.author}</span>
                    <button 
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
                      onClick={() => setExpandedBlog(blog._id === expandedBlog ? null : blog._id)}
                    >
                      {expandedBlog === blog._id ? 'Show Less' : 'Read More'} <span className="ml-1">{expandedBlog === blog._id ? '↑' : '→'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blogs;
