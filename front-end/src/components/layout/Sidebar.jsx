import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import useStore from '../../store/useStore';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const { logout, token } = useAuth();
  const navigate = useNavigate();
  
  // State for the search term
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for inline renaming
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingProjectName, setEditingProjectName] = useState('');

  const {
    activeProject,
    setActiveProject,
    projects,
    isLoading,
    fetchProjects,
    createNewProject,
    updateProjectName,
    deleteProject // Action to delete a project
  } = useStore();

  useEffect(() => {
    if (token) {
      fetchProjects(token);
    }
  }, [token, fetchProjects]);

  const handleCreateNewProject = () => {
    const newName = window.prompt("Enter the name for your new project:");
    if (newName && newName.trim()) {
      if (token) {
        createNewProject(newName, token);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const handleRenameStart = (project) => {
    setEditingProjectId(project._id);
    setEditingProjectName(project.name);
  };

  const handleRenameSubmit = (projectId) => {
    if (editingProjectName.trim()) {
      updateProjectName(projectId, editingProjectName, token);
    }
    setEditingProjectId(null);
  };

  const handleDeleteProject = (projectId) => {
    if (window.confirm('Are you sure you want to delete this project permanently?')) {
      deleteProject(projectId, token);
    }
  };
  
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const baseItemStyle = styles.item;
  const activeItemStyle = styles.activeItem;

  return (
    <div className={styles.sidebarContainer}>
      <div className={styles.userInfo}>
        <p className={styles.email}>Welcome!</p>
        <button onClick={handleLogout} className={styles.logoutButton}>
          Log Out
        </button>
      </div>

      <button onClick={handleCreateNewProject} className={styles.newProjectButton}>
        + New Project
      </button>

      <div className={styles.projectsList}>
        <h2 className={styles.projectsHeader}>My Projects</h2>

        <input
          type="search"
          placeholder="Search projects..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {isLoading && projects.length === 0 ? (
          <p>Loading...</p>
        ) : (
          filteredProjects.map((project) => (
            <div key={project._id} className={styles.projectItem}>
              {editingProjectId === project._id ? (
                <input
                  type="text"
                  className={styles.renameInput}
                  value={editingProjectName}
                  onChange={(e) => setEditingProjectName(e.target.value)}
                  onBlur={() => handleRenameSubmit(project._id)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(project._id)}
                  autoFocus
                />
              ) : (
                <div className={styles.projectItemRow}>
                  <button
                    onClick={() => setActiveProject(project)}
                    onDoubleClick={() => handleRenameStart(project)}
                    className={`${baseItemStyle} ${activeProject?._id === project._id ? activeItemStyle : ''}`}
                  >
                    {project.name}
                  </button>
                  <button 
                    onClick={() => handleDeleteProject(project._id)} 
                    className={styles.deleteButton}
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          ))
        )}
        {!isLoading && projects.length === 0 && (
          <p className={styles.noProjects}>No projects yet.</p>
        )}
      </div>
    </div>
  );
}