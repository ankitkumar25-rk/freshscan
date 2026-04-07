import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

// The main authenticated app shell — renders the active page via <Outlet />
export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="app-main">
        <TopBar onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
