const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, default: 'New Project' },
  chatHistory: { type: Array, default: [] },
  generatedCode: {
    jsx: { type: String, default: '' },
    css: { type: String, default: '' },
  },
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);