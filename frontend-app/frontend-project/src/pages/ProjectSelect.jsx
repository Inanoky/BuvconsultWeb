import { useState, useEffect, useContext } from 'react';
import { ProjectContext } from '../utilities/ProjectContext.jsx';

export default function ProjectSelect() {
    const { selectProject } = useContext(ProjectContext);
    const [projects, setProjects] = useState([]);
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('projects')) || [];
        setProjects(stored);
    }, []);

    const createProject = () => {
        if (!name || !address) return;
        const newProject = { name, address, id: Date.now() };
        const updated = [...projects, newProject];
        localStorage.setItem('projects', JSON.stringify(updated));
        setProjects(updated);
        setName('');
        setAddress('');
    };

    const handleSelect = (proj) => {
        selectProject(proj);
        window.location.href = '/ProjectAdmin';
    };

    const deleteProject = (id) => {
        const updated = projects.filter(p => p.id !== id);
        localStorage.setItem('projects', JSON.stringify(updated));
        setProjects(updated);

        // If deleted project is selected, remove it from context/localStorage
        const selected = JSON.parse(localStorage.getItem('selectedProject'));
        if (selected && selected.id === id) {
            localStorage.removeItem('selectedProject');
            selectProject(null);
        }
    };

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Create New Project</h1>
            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Project name"
                className="w-full mb-2 p-2 border rounded"
            />
            <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Project address"
                className="w-full mb-4 p-2 border rounded"
            />
            <button onClick={createProject} className="bg-indigo-600 text-white px-4 py-2 rounded mb-6">
                Create Project
            </button>

            <h2 className="text-xl font-semibold mb-2">Select Existing Project</h2>
            <ul className="space-y-2">
                {projects.map((proj) => (
                    <li key={proj.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                        <div>
                            <span className="font-medium">{proj.name}</span> – <span className="text-sm">{proj.address}</span>
                        </div>
                        <div className="space-x-2">
                            <button onClick={() => handleSelect(proj)} className="text-indigo-600 underline">Select</button>
                            <button onClick={() => deleteProject(proj.id)} className="text-red-500 underline">Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
