import React from 'react';

const Blogs = () => {
  const blogs = [
    {
      id: 1,
      title: "Top 10 Hotels in the City",
      excerpt: "Discover the best accommodations for your stay, from luxury resorts to budget-friendly options.",
      date: "January 15, 2025",
      author: "CityPortal Team",
      category: "Hotels"
    },
    {
      id: 2,
      title: "Upcoming Events You Can't Miss",
      excerpt: "Mark your calendars for these must-attend events happening this month.",
      date: "January 12, 2025",
      author: "Event Guide",
      category: "Events"
    },
    {
      id: 3,
      title: "Hidden Gems: Tourist Spots Off the Beaten Path",
      excerpt: "Explore these lesser-known but amazing attractions that most tourists miss.",
      date: "January 10, 2025",
      author: "Travel Explorer",
      category: "Tourism"
    },
    {
      id: 4,
      title: "City Guide: Best Places to Eat",
      excerpt: "From street food to fine dining, here's where to satisfy your culinary cravings.",
      date: "January 8, 2025",
      author: "Food Critic",
      category: "Guide"
    },
    {
      id: 5,
      title: "How to Plan the Perfect City Trip",
      excerpt: "Tips and tricks for making the most of your city adventure.",
      date: "January 5, 2025",
      author: "Travel Expert",
      category: "Guide"
    }
  ];

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-800 text-center mb-8">Our Blog</h1>
        <p className="text-gray-600 text-center mb-12">Latest news, tips, and guides for your city adventures</p>
        
        <div className="space-y-6">
          {blogs.map((blog) => (
            <div key={blog.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 text-sm rounded-full">
                    {blog.category}
                  </span>
                  <span className="text-gray-500 text-sm">{blog.date}</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{blog.title}</h2>
                <p className="text-gray-600 mb-4">{blog.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">By {blog.author}</span>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    Read More →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blogs;

