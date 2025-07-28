import { create } from 'zustand';
import axios from 'axios';

const useStore = create((set, get) => ({
  // STATE
  projects: [],
  activeProject: null,
  isLoading: false,

  // ACTIONS
  setActiveProject: (project) => {
    set({ activeProject: project });
  },

  fetchProjects: async (token) => {
    set({ isLoading: true });
    try {
      const config = { headers: { 'x-auth-token': token } };
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/projects`, config);
      set({ projects: res.data });
      if (!get().activeProject && res.data.length > 0) {
        set({ activeProject: res.data[0] });
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      set({ projects: [] });
    }
    set({ isLoading: false });
  },
  
  createNewProject: async (token) => {
     try {
      const config = { headers: { 'x-auth-token': token } };
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/projects`, {}, config);
      const newProject = res.data;
      set((state) => ({ 
        projects: [newProject, ...state.projects],
        activeProject: newProject 
      }));
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  },
  
  updateProjectName: async (projectId, newName, token) => {
    try {
      const config = { headers: { 'x-auth-token': token } };
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/projects/${projectId}`, { name: newName }, config);
      const updatedProject = res.data;
      
      set((state) => ({
        projects: state.projects.map((p) =>
          p._id === projectId ? updatedProject : p
        ),
        activeProject: state.activeProject?._id === projectId ? updatedProject : state.activeProject,
      }));
    } catch (error) {
      console.error("Failed to update project name:", error);
    }
  },
createNewProject: async (newName, token) => { // 1. Accept `newName` as an argument
     try {
      const config = { headers: { 'x-auth-token': token } };
      // 2. Send the new name in the request body
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/projects`, { name: newName }, config);
      const newProject = res.data;
      set((state) => ({ 
        projects: [newProject, ...state.projects],
        activeProject: newProject 
      }));
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  },
    deleteProject: async (projectId, token) => {
    try {
      const config = { headers: { 'x-auth-token': token } };
      await axios.delete(`${import.meta.env.VITE_API_URL}/projects/${projectId}`, config);
      
      set((state) => {
        const remainingProjects = state.projects.filter((p) => p._id !== projectId);
        let newActiveProject = state.activeProject;
        
        // If the deleted project was the active one, select the first of the remaining projects
        if (state.activeProject?._id === projectId) {
          newActiveProject = remainingProjects.length > 0 ? remainingProjects[0] : null;
        }

        return {
          projects: remainingProjects,
          activeProject: newActiveProject,
        };
      });
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  },
  generateComponent: async (prompt, token) => {
    const project = get().activeProject;
    if (!project) return;
    
    set({ isLoading: true });
    try {
        const config = { headers: { 'x-auth-token': token } };
        const body = { 
          prompt,
          existingJsx: project.generatedCode.jsx,
          existingCss: project.generatedCode.css
        };
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/projects/${project._id}/generate`, body, config);
        
        const updatedProject = res.data;
        
        // This is the updated, more robust way to set the state
        set((state) => {
          const newProjects = state.projects.map(p =>
            p._id === updatedProject._id ? updatedProject : p
          );
          return {
            projects: newProjects,
            activeProject: updatedProject,
          };
        });

    } catch(error) {
        console.error("Error generating component:", error);
    }
    set({ isLoading: false });
  },
}));


export default useStore;