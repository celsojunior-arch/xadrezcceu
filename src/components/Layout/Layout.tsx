import React, { useState } from 'react';
import { Users, Trophy, BarChart3, Settings, Menu, X, ChevronRight, FileText, Zap, LogIn, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginModal } from '../Auth/LoginModal';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'classificacao', label: 'Classificação', icon: Users },
  { id: 'players', label: 'Jogadores', icon: Users },
  { id: 'tournaments', label: 'Torneios', icon: Trophy },
  { id: 'desafio-quinzenal', label: 'Desafio Quinzenal', icon: Zap },
  { id: 'reports', label: 'Relatórios', icon: FileText },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { user, logout, isAdmin } = useAuth();

  // Filter menu items based on authentication
  const getVisibleMenuItems = () => {
    const publicItems = ['dashboard', 'classificacao', 'tournaments', 'desafio-quinzenal'];
    
    if (isAdmin) {
      return menuItems; // Admin sees all items
    }
    
    return menuItems.filter(item => publicItems.includes(item.id));
  };

  const visibleMenuItems = getVisibleMenuItems();

  return (
    <div className="min-h-screen bg-chess-gradient relative">
      {/* Chess background watermark */}
      <div className="chess-background"></div>
      
      {/* Header */}
      <header className="glass-card-dark shadow-lg border-b border-chess-blue-400/30 relative z-10">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md text-white/80 hover:bg-white/10 transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-xl font-bold text-white text-shadow-lg">
              Ranking Xadrez Chapadão do Céu/GO
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-white/90">
                  <Shield size={16} />
                  <span className="font-medium">{user.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 bg-red-500/20 text-red-200 px-3 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  <LogOut size={16} />
                  Sair
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-2 bg-blue-500/20 text-blue-200 px-3 py-2 rounded-lg hover:bg-blue-500/30 transition-colors"
              >
                <LogIn size={16} />
                Login Admin
              </button>
            )}
            <div className="text-sm text-white/70">
              <span className="text-white/90 font-medium">Versão 1.0 - Celso Braz (PO)</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 glass-card-dark shadow-2xl transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex flex-col h-full pt-16 lg:pt-0">
            <nav className="flex-1 px-4 py-6 space-y-2">
              {visibleMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onPageChange(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-300 group
                      ${isActive 
                        ? 'bg-chess-blue-500/20 text-chess-cyan-300 font-medium glow-blue border border-chess-blue-400/30' 
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight size={16} className="text-chess-cyan-300 animate-pulse" />}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0 relative z-10">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
      
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </div>
  );
};