import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ErrorBoundary from '../components/ErrorBoundary';

export default function UserLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[var(--bg-base)] overflow-hidden transition-colors duration-300">
      <Sidebar role="user" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <Header setIsSidebarOpen={setIsSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar relative z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent-primary)] opacity-5 rounded-full blur-[100px] pointer-events-none -z-10" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--accent-secondary)] opacity-5 rounded-full blur-[100px] pointer-events-none -z-10" />
          
          <div className="relative z-10 w-full max-w-7xl mx-auto">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}
