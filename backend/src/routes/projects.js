const express = require('express');
const router = express.Router();
const {
  getProjects,
  createProject,
  getProject,
  updateProject,
  generateComponent,
  deleteProject
} = require('../controllers/projectController');
const auth = require('../middleware/authMiddleware');

router.route('/').get(auth, getProjects).post(auth, createProject);

router
  .route('/:id')
  .get(auth, getProject)
  .put(auth, updateProject)
  .delete(auth, deleteProject);

router.post('/:id/generate', auth, generateComponent);

module.exports = router;