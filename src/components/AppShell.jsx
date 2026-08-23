import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  Bell,
  Search,
  Package,
  Monitor,
  PieChart,
  Truck
} from 'lucide-react';

export function AppShell({ children, currentView, setCurrentView }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col`}
      >
        <div className="h-16 flex items-center justify-center border-b border-slate-800">
          <Package className="h-8 w-8 text-blue-500" />
          {sidebarOpen && (
            <span className="ml-3 text-xl font-bold text-white tracking-wider">
              PRODSYNC
            </span>
          )}
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-2 px-3">
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`flex items-center w-full px-3 py-2.5 rounded-lg transition-colors group ${
              currentView === 'dashboard' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className={`h-5 w-5 ${currentView !== 'dashboard' && 'group-hover:text-white'}`} />
            {sidebarOpen && <span className="ml-3 font-medium">Dashboard</span>}
          </button>
          <button
            onClick={() => setCurrentView('equipe')}
            className={`flex items-center w-full px-3 py-2.5 rounded-lg transition-colors group ${
              currentView === 'equipe' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800'
            }`}
          >
            <Users className={`h-5 w-5 ${currentView !== 'equipe' && 'group-hover:text-white'}`} />
            {sidebarOpen && <span className="ml-3 font-medium">Equipe</span>}
          </button>

          {/* Divisor BI */}
          <div className="mt-4 mb-2 px-3">
            {sidebarOpen && <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Business Intelligence</span>}
            {!sidebarOpen && <div className="h-px w-full bg-slate-800"></div>}
          </div>

          <button
            onClick={() => setCurrentView('financeiro')}
            className={`flex items-center w-full px-3 py-2.5 rounded-lg transition-colors group ${
              currentView === 'financeiro' ? 'bg-emerald-600 text-white' : 'hover:bg-slate-800'
            }`}
          >
            <PieChart className={`h-5 w-5 ${currentView !== 'financeiro' && 'group-hover:text-white'}`} />
            {sidebarOpen && <span className="ml-3 font-medium">Financeiro & ROI</span>}
          </button>

          <button
            onClick={() => setCurrentView('dossie')}
            className={`flex items-center w-full px-3 py-2.5 rounded-lg transition-colors group ${
              currentView === 'dossie' ? 'bg-orange-600 text-white' : 'hover:bg-slate-800'
            }`}
          >
            <Users className={`h-5 w-5 ${currentView !== 'dossie' && 'group-hover:text-white'}`} />
            {sidebarOpen && <span className="ml-3 font-medium">Dossiê Analítico</span>}
          </button>
          
          <button
            onClick={() => setCurrentView('operacao')}
            className={`flex items-center w-full px-3 py-2.5 rounded-lg transition-colors group ${
              currentView === 'operacao' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'
            }`}
          >
            <Truck className={`h-5 w-5 ${currentView !== 'operacao' && 'group-hover:text-white'}`} />
            {sidebarOpen && <span className="ml-3 font-medium">Terminal Live</span>}
          </button>

          <button
            onClick={() => setCurrentView('tv')}
            className="flex items-center w-full px-3 py-2.5 hover:bg-slate-800 rounded-lg transition-colors group text-purple-400 hover:text-purple-300 mt-2 border border-purple-900/30 bg-purple-900/10"
          >
            <Monitor className="h-5 w-5" />
            {sidebarOpen && <span className="ml-3 font-medium">Modo TV</span>}
          </button>
          <button
            className="flex items-center w-full px-3 py-2.5 hover:bg-slate-800 rounded-lg transition-colors group"
          >
            <Settings className="h-5 w-5 group-hover:text-white" />
            {sidebarOpen && (
              <span className="ml-3 font-medium">Configurações</span>
            )}
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center w-full px-3 py-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white">
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span className="ml-3 font-medium">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-slate-100 text-slate-600"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-md text-slate-500">
              <Search className="h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar..."
                className="bg-transparent border-none focus:outline-none text-sm w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-slate-100 text-slate-600 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium shadow-sm">
              E
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
