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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading blogs...</p>
        </div>
      </div>
    );
  }

  const toggleExpand = (blogId) => {
    setExpandedBlog(expandedBlog === blogId ? null : blogId);
  };

  return (
    <div className="py-12">
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
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-8">
          Our Blog
        </h1>
        <p className="text-gray-600 text-center mb-12">
          Latest news, tips, and guides for your city adventures
        </p>

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
            <p className="text-sm text-gray-400">
              Check back soon for updates!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${expandedBlog === blog._id ? "shadow-2xl" : "hover:shadow-lg max-h-96 overflow-hidden"}`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full">
                      {blog.category}
                    </span>
                    <span className="text-gray-500 text-sm">
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
                    className={`text-lg font-bold text-gray-800 mb-2 ${expandedBlog === blog._id ? "" : "line-clamp-2"}`}
                  >
                    {blog.title}
                  </h2>
                  {expandedBlog === blog._id ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkBreaks, remarkGfm]}
                      components={{
                        h1: ({ children }) => (
                          <h1 className="text-lg font-medium mt-4 mb-3 text-gray-900">
                            {children}
                          </h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="text-m font-semibold mt-4 mb-2 text-gray-800">
                            {children}
                          </h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="text-m font-semibold mt-3 mb-2 text-gray-700">
                            {children}
                          </h3>
                        ),
                        p: ({ children }) => (
                          <p className="text-gray-600 mb-4 leading-relaxed text-[15px]">
                            {children}
                          </p>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-gray-900">
                            {children}
                          </strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic text-gray-500">{children}</em>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-5 mb-4 space-y-1 text-gray-600">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-5 mb-4 space-y-1 text-gray-600">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => <li>{children}</li>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-500 my-4">
                            {children}
                          </blockquote>
                        ),
                        a: ({ href, children }) => (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {children}
                          </a>
                        ),
                        code: ({ inline, children }) =>
                          inline ? (
                            <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">
                              {children}
                            </code>
                          ) : (
                            <pre className="bg-gray-900 text-white p-3 rounded-lg overflow-x-auto my-4 text-sm">
                              <code>{children}</code>
                            </pre>
                          ),
                      }}
                    >
                      {blog.content || blog.excerpt}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {blog.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      By {blog.author}
                    </span>
                    <button
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center transition-all"
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
