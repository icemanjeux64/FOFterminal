import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import './Layout.css';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="layout-container relative">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

            {/* Mobile Drawer Wrapper */}
            <div className={`sidebar-wrapper ${isSidebarOpen ? 'open' : ''}`}>
                <Sidebar onClose={closeSidebar} />
            </div>

            <div className="main-content">
                <Header onMenuClick={toggleSidebar} />
                <main className="page-content dashboard-container">
                    <div key={location.pathname} className="min-h-full animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
