
import { useContext } from 'react';
import { ProjectContext } from "./utilities/ProjectContext.jsx";

export default function Navbar() {
    const { project } = useContext(ProjectContext);
    const path = window.location.pathname;

    return (
        <nav className="bg-indigo-600 shadow-md px-4 py-3">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex items-center justify-between">
                    <a href="/" className="text-xl font-bold text-white hover:text-indigo-200 transition duration-200">
                        {project ? project.name : "Select Project"}
                    </a>
                </div>

                <ul className="flex flex-col md:flex-row md:space-x-8 mt-4 md:mt-0">
                    <li>
                        <a href="ProjectAdmin"
                           className={`block py-2 px-3 rounded-md text-sm font-medium ${path === "/ProjectAdmin" ? "bg-indigo-700 text-white" : "text-indigo-100 hover:bg-indigo-700 hover:text-white"} transition duration-200`}>ProjectAdmin</a>
                    </li>
                    <li>
                        <a href="Program"
                           className={`block py-2 px-3 rounded-md text-sm font-medium ${path === "/Program" ? "bg-indigo-700 text-white" : "text-indigo-100 hover:bg-indigo-700 hover:text-white"} transition duration-200`}>Program</a>
                    </li>
                    <li>
                        <a href="ClockInOut"
                           className={`block py-2 px-3 rounded-md text-sm font-medium ${path === "/ClockInOut" ? "bg-indigo-700 text-white" : "text-indigo-100 hover:bg-indigo-700 hover:text-white"} transition duration-200`}>ClockInOut</a>
                    </li>
                    <li>
                        <a href="Invoices"
                           className={`block py-2 px-3 rounded-md text-sm font-medium ${path === "/Invoices" ? "bg-indigo-700 text-white" : "text-indigo-100 hover:bg-indigo-700 hover:text-white"} transition duration-200`}>Invoices</a>
                    </li>
                    <li>
                        <a href="SiteDiary"
                           className={`block py-2 px-3 rounded-md text-sm font-medium ${path === "/SiteDiary" ? "bg-indigo-700 text-white" : "text-indigo-100 hover:bg-indigo-700 hover:text-white"} transition duration-200`}>Site Diary</a>
                    </li>
                    <li>
                        <a href="Analytics"
                           className={`block py-2 px-3 rounded-md text-sm font-medium ${path === "/Analytics" ? "bg-indigo-700 text-white" : "text-indigo-100 hover:bg-indigo-700 hover:text-white"} transition duration-200`}>Analytics</a>
                    </li>
                </ul>
            </div>
        </nav>
    )
}