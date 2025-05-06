// src/context/ProjectContext.jsx
import { createContext, useState, useEffect } from 'react';

export const ProjectContext = createContext();

export function ProjectProvider({ children }) {
    const [project, setProject] = useState(() => {
        // ✅ Load from localStorage on first render (synchronously)
        const stored = localStorage.getItem('selectedProject');
        return stored ? JSON.parse(stored) : null;
    });

    const selectProject = (project) => {
        localStorage.setItem('selectedProject', JSON.stringify(project));
        setProject(project);
    };

    return (
        <ProjectContext.Provider value={{ project, selectProject }}>
            {children}
        </ProjectContext.Provider>
    );
}

