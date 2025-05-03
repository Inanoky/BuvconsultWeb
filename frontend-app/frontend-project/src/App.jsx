import Navbar from "./Navbar.jsx"

import Program from "./pages/Program.jsx"
import {Route, Routes} from "react-router-dom"
import ProjectAdmin from "./pages/ProjectAdmin.jsx";
import ProjectSelect from "./pages/ProjectSelect.jsx";
import ClockInOut from "./pages/ClockInOut.jsx";
import Invoices from "./pages/Invoices.jsx";
import Analytics from "./pages/Analytics.jsx";
import SiteDiary from "./pages/SiteDiary.jsx";
function App() {

    return(
    <>
        <div className="min-h-screen flex flex-col">
        <Navbar/>
            <div className="flex-grow bg-gray-50 px-4 py-6">

                <Routes>
                    <Route path="/" element={<ProjectSelect/>}/>
                    <Route path="ProjectAdmin" element={<ProjectAdmin/>}/>
                    <Route path="ClockInOut" element={<ClockInOut/>}/>
                    <Route path="Program" element={<Program/>}/>
                    <Route path="Invoices" element={<Invoices/>}/>
                    <Route path="Analytics" element={<Analytics/>}/>
                    <Route path="SiteDiary" element={<SiteDiary/>}/>
                </Routes>
            </div>
        </div>
    </>
    )

}

export default App
