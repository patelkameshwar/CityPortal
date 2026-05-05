import React, { useState, useEffect } from "react";
import api, { blogAPI } from "../services/api.js";
import { toast } from "react-toastify";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
      console.error("Failed to fetch blogs:", err);
      setError("Failed to load blogs");
      toast.error("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading blogs...</p>
        </div>
      </div>
    );
  }

  const toggleExpand = (blogId) => {
    setExpandedBlog(expandedBlog === blogId ? null : blogId);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-8 lg:py-10 px-3 sm:px-6 lg:px-8">
      <style>{`
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
      `}</style>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
            Our Blogs
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base max-w-2xl mx-auto">
            Latest news, tips, and guides for your city adventures
          </p>
        </div>

        {error ? (
          <div className="bg-white rounded-xl shadow-sm text-center py-10 px-4">
            <p className="text-red-600 mb-4 text-sm sm:text-base">{error}</p>
            <button
              onClick={fetchBlogs}
              className="bg-blue-600 text-white px-5 sm:px-6 py-2 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
            >
              Try Again
            </button>
          </div>

        ) : blogs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm text-center py-10 px-4">
            <p className="text-gray-500 mb-2 text-sm sm:text-base">No blogs available yet.</p>
            <p className="text-xs sm:text-sm text-gray-400">
              Check back soon for updates!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 ${expandedBlog === blog._id ? "shadow-xl" : "hover:shadow-lg"
                }`}
              >
                <div className="p-4 sm:p-6 lg:p-7">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <span className="w-fit px-3 py-1 bg-blue-100 text-blue-600 text-xs sm:text-sm rounded-full">
                      {blog.category}
                    </span>
                    <span className="text-gray-500 text-xs sm:text-sm">
                      {blog.date
                        ? new Date(blog.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : new Date(blog.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                    </span>
                  </div>
                  <h2
                    className={`text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-3 leading-snug ${expandedBlog === blog._id ? "" : "line-clamp-2"}`}
                  >
                    {blog.title}
                  </h2>
                  
                  {expandedBlog === blog._id ? (
                    <div className="prose prose-sm sm:prose-base max-w-none break-words">
                      <ReactMarkdown
                        remarkPlugins={[remarkBreaks, remarkGfm]}
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-xl sm:text-2xl font-semibold mt-5 mb-3 text-gray-900">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-lg sm:text-xl font-semibold mt-4 mb-2 text-gray-800">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-base sm:text-lg font-semibold mt-3 mb-2 text-gray-700">
                              {children}
                            </h3>
                          ),
                          p: ({ children }) => (
                            <p className="text-gray-600 mb-4 leading-relaxed text-sm sm:text-[15px]">
                              {children}
                            </p>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc pl-5 mb-4 space-y-1 text-gray-600 text-sm sm:text-base">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal pl-5 mb-4 space-y-1 text-gray-600 text-sm sm:text-base">
                              {children}
                            </ol>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-500 my-4 text-sm sm:text-base">
                              {children}
                            </blockquote>
                          ),
                          a: ({ href, children }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline break-words"
                            >
                              {children}
                            </a>
                          ),
                          code: ({ inline, children }) =>
                            inline ? (
                              <code className="bg-gray-100 px-1 py-0.5 rounded text-xs sm:text-sm break-words">
                                {children}
                              </code>
                            ) : (
                              <pre className="bg-gray-900 text-white p-3 rounded-lg overflow-x-auto my-4 text-xs sm:text-sm">
                                <code>{children}</code>
                              </pre>
                            ),
                        }}
                      >
                        {blog.content || blog.excerpt}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-gray-600 mb-4 line-clamp-3 text-sm sm:text-base leading-relaxed">
                      {blog.excerpt}
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-gray-100">
                    <span className="text-xs sm:text-sm text-gray-500">
                      By {blog.author}
                    </span>
                    <button
                      className="w-full sm:w-auto text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center sm:justify-start transition-all text-sm sm:text-base border sm:border-0 border-blue-100 rounded-lg py-2 sm:py-0"
                      onClick={() => toggleExpand(blog._id)}
                    >
                      {expandedBlog === blog._id ? (
                        <>
                          Show Less <span className="ml-1">↑</span>
                        </>
                      ) : (
                        <>
                          Read More <span className="ml-1">→</span>
                        </>
                      )}
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
