import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Sparkles, User as UserIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';

export const SidebarLayout = ({ children, links }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      
      {/* Sidebar */}
      <aside 
        className={`${isCollapsed ? 'w-24' : 'w-72'} transition-all duration-300 ease-in-out bg-white border-r border-slate-200/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col relative z-20`}
      >
        
        {/* Logo Section */}
        <div 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`h-20 flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-8'} border-b border-slate-100 transition-all duration-300 cursor-pointer hover:bg-slate-50`}
        >
          <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20"
               style={{ marginRight: isCollapsed ? '0' : '12px' }}>
             <Sparkles className="h-5 w-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden whitespace-nowrap">
              <span className="font-extrabold text-xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent tracking-tight">AI BugTracker</span>
            </div>
          )}
        </div>
        
        {/* Navigation Links */}
        <div className={`flex-1 py-8 space-y-2 overflow-y-auto custom-scrollbar ${isCollapsed ? 'px-3' : 'px-5'}`}>
          {!isCollapsed && <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Workspace</p>}
          
          <div className="space-y-1.5 flex flex-col items-center w-full">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                title={isCollapsed ? link.label : ""}
                className={({ isActive }) => 
                  `group flex items-center w-full ${isCollapsed ? 'justify-center px-0 py-3' : 'px-4 py-3'} rounded-2xl text-sm font-semibold transition-all duration-300 ${
                    isActive 
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <link.icon className={`h-5 w-5 shrink-0 transition-colors duration-300 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'} ${isCollapsed ? '' : 'mr-3'}`} />
                    {!isCollapsed && (
                      <span className="truncate">{link.label}</span>
                    )}
                    {!isCollapsed && isActive && (
                      <div className="ml-auto w-1.5 h-1.5 shrink-0 rounded-full bg-indigo-600"></div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>

        {/* User Profile Section */}
        <div className={`p-4 border-t border-slate-100 bg-white transition-all duration-300 ${isCollapsed ? 'px-2' : 'p-5'}`}>
          <div className={`bg-slate-50 rounded-2xl ${isCollapsed ? 'p-2' : 'p-4'} flex flex-col space-y-4 border border-slate-100 shadow-sm transition-all duration-300 items-center`}>
            
            <div className={`flex items-center w-full ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white h-10 w-10 shrink-0 rounded-full flex items-center justify-center font-bold text-base shadow-md"
                   title={isCollapsed ? user?.name : ""}>
                {user?.name.charAt(0).toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="ml-3 overflow-hidden">
                  <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                  <div className="flex items-center mt-0.5">
                    <div className="w-2 h-2 shrink-0 rounded-full bg-green-500 mr-1.5"></div>
                    <p className="text-xs font-medium text-slate-500 truncate capitalize">{user?.role.replace('_', ' ').toLowerCase()}</p>
                  </div>
                </div>
              )}
            </div>
            
            <Button 
              variant="outline" 
              className={`w-full justify-center text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-xl transition-all shadow-sm ${isCollapsed ? 'h-10 px-0' : 'h-10'}`} 
              onClick={logout}
              title={isCollapsed ? "Sign Out" : ""}
            >
              <LogOut className={`h-4 w-4 ${isCollapsed ? '' : 'mr-2'}`} />
              {!isCollapsed && <span>Sign Out</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50/50 relative flex flex-col h-full min-w-0">
        {/* Subtle background decorative blob */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <header className="h-20 shrink-0 bg-white/60 backdrop-blur-xl border-b border-slate-200/50 flex items-center px-10 sticky top-0 z-10 shadow-[0_4px_30px_rgba(0,0,0,0.01)]">
          <div className="flex items-center space-x-3">
             <UserIcon className="h-5 w-5 text-indigo-400" />
             <h1 className="text-xl font-bold text-slate-800 capitalize tracking-tight">
               {user?.role.replace('_', ' ').toLowerCase()} Portal
             </h1>
          </div>
        </header>
        <div className="p-10 w-full max-w-7xl mx-auto flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};