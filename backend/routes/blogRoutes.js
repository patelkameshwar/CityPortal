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
const upload = require('../middleware/uploadMiddleware');

router
  .route('/')
  .get(getAllBlogs)
  .post(protect, roleMiddleware('admin'), upload('blogs').none(), createBlog);

router
  .route('/:id')
  .get(getBlogById)
  .put(protect, roleMiddleware('admin'), upload('blogs').none(), updateBlog)
  .delete(protect, roleMiddleware('admin'), deleteBlog);

module.exports = router;

