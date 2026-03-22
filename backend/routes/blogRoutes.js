const express = require('express');
const {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog
} = require('../controllers/blogController');
const protect = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router
  .route('/')
  .get(getAllBlogs)
  .post(protect, roleMiddleware('admin'), createBlog);

router
  .route('/:id')
  .get(getBlogById)
  .put(protect, roleMiddleware('admin'), updateBlog)
  .delete(protect, roleMiddleware('admin'), deleteBlog);

module.exports = router;

