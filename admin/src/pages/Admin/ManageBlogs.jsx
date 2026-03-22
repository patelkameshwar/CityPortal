import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { blogAPI } from '../../services/api.js';
import { FaAlignLeft, FaEdit, FaTrash, FaSearch, FaEye, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ManageBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await blogAPI.getAll();
      setBlogs(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this blog?')) {
      try {
        const response = await blogAPI.delete(id);
        if (response.data.success) {
          toast.success('Blog deleted');
          fetchBlogs();
        }
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const filteredBlogs = blogs.filter(blog => 
    blog.title.toLowerCase().includes(search.toLowerCase()) ||
    blog.author.toLowerCase().includes(search.toLowerCase()) ||
    blog.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">Loading blogs...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Blogs</h1>
            <p className="text-gray-600 mt-1">View and manage all blog posts</p>
          </div>
          <Link to="/admin-dashboard" className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <FaSearch className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search blogs by title, author or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <Link to="/admin/add-blog" className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium shadow-sm">
              <FaPlus className="mr-2 h-4 w-4" />
              Add Blog
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publish Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBlogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 truncate max-w-md" title={blog.title}>{blog.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-md" title={blog.excerpt}>{blog.excerpt}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">
                        {blog.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{blog.author}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {blog.date ? new Intl.DateTimeFormat('en-GB', { 
                        day: 'numeric', month: 'short', year: 'numeric' 
                      }).format(new Date(blog.date)) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Intl.DateTimeFormat('en-GB', { 
                        day: 'numeric', month: 'long', year: 'numeric' 
                      }).format(new Date(blog.createdAt))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link to={`/admin/view/blog/${blog._id}`} className="text-blue-600 hover:text-blue-900">
                        <FaEye className="h-4 w-4 inline" />
                      </Link>
                      <Link to={`/admin/edit/blog/${blog._id}`} className="text-yellow-600 hover:text-yellow-900">
                        <FaEdit className="h-4 w-4 inline" />
                      </Link>
                      <button onClick={() => handleDelete(blog._id)} className="text-red-600 hover:text-red-900">
                        <FaTrash className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBlogs.length === 0 && (
            <div className="text-center py-12">
              <FaAlignLeft className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or add your first blog</p>
              <Link to="/admin/add-blog" className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium">
                <FaPlus className="mr-2 h-4 w-4" />
                Create First Blog
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageBlogs;

