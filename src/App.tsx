/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { AiSoftwareEngineer } from "./pages/AiSoftwareEngineer";
import { AgentsOverview } from "./pages/AgentsOverview";
import { AgentDetail } from "./pages/AgentDetail";
import { Services } from "./pages/Services";
import { Pricing } from "./pages/Pricing";
import { Blog } from "./pages/Blog";
import { Contact } from "./pages/Contact";
import { AdminDashboard } from "./pages/AdminDashboard";
import { PagePlaceholder } from "./pages/PagePlaceholder";

function Layout() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500 selection:text-white flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="ai-engineer" element={<AiSoftwareEngineer />} />
          <Route path="agents" element={<AgentsOverview />} />
          <Route path="agent/:id" element={<AgentDetail />} />
          <Route path="services" element={<Services />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="blog" element={<Blog />} />
          <Route path="contact" element={<Contact />} />
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}



