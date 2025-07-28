const Project = require('../models/Project');
const { generateComponentCode } = require('../services/aiService');

/**
 * @desc    Get all projects for a user
 * @route   GET /api/projects
 */
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 */
exports.createProject = async (req, res) => {
  try {
    const newProject = new Project({
      user: req.user.id,
      name: req.body.name || 'Untitled Project',
      generatedCode: {
        jsx: 'const Component = () => {\n  return (\n    <div className="welcome-card">\n      <h1>Hello World</h1>\n      <p>This is your new component!</p>\n    </div>\n  );\n};',
        css: '.welcome-card {\n  background-color: #ffffff;\n  color: #333333;\n  padding: 40px;\n  border-radius: 12px;\n  text-align: center;\n  box-shadow: 0 10px 25px rgba(0,0,0,0.1);\n}'
      },
      chatHistory: [],
    });

    const project = await newProject.save();
    res.status(201).json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Get a single project by ID
 * @route   GET /api/projects/:id
 */
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Update a project
 * @route   PUT /api/projects/:id
 */
exports.updateProject = async (req, res) => {
  const { name, chatHistory, generatedCode } = req.body;

  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (chatHistory) fieldsToUpdate.chatHistory = chatHistory;
    if (generatedCode) fieldsToUpdate.generatedCode = generatedCode;

    project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: fieldsToUpdate },
      { new: true }
    );

    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Delete a project
 * @route   DELETE /api/projects/:id
 */
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await project.deleteOne();

    res.json({ msg: 'Project removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Generate or update a component using AI
 * @route   POST /api/projects/:id/generate
 */
exports.generateComponent = async (req, res) => {
  const { prompt, existingJsx, existingCss } = req.body;

  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    if (project.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const newCode = await generateComponentCode(prompt, existingJsx, existingCss);

    project.generatedCode = {
      jsx: newCode.jsx,
      css: newCode.css
    };
    project.chatHistory.push({ role: 'user', content: prompt });
    project.chatHistory.push({ role: 'assistant', content: `JSX:\n${newCode.jsx}\n\nCSS:\n${newCode.css}` });

    await project.save();

    res.json(project);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Error generating component', error: err.message });
  }
};