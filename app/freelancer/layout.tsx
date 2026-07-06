"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User, Briefcase, Search, FileSignature, LogOut, Menu, X, BookOpen, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function FreelancerLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/freelancer', icon: LayoutDashboard },
    { name: 'Mi Perfil', href: '/freelancer/perfil', icon: User },
    { name: 'Portafolio', href: '/freelancer/portafolio', icon: Briefcase },
    { name: 'Explorar Ofertas', href: '/freelancer/ofertas', icon: Search },
    { name: 'Evaluaciones y Skills', href: '/freelancer/evaluaciones', icon: Target },
    { name: 'Rutas de Aprendizaje', href: '/freelancer/rutas', icon: BookOpen },
    { name: 'Contratos y Pagos', href: '/freelancer/contratos', icon: FileSignature },
  ];

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_role');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* Mobile Navbar */}
      <div className="md:hidden bg-brand-purple text-white p-4 flex justify-between items-center shadow-md">
        <span className="font-bold text-xl tracking-tight">GetaJob</span>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:sticky top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 z-50",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 border-b border-slate-100 hidden md:block">
          <Link href="/freelancer">
            <span className="font-extrabold text-2xl tracking-tighter text-brand-purple">
              Geta<span className="text-brand-teal">Job</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== '/freelancer');
            return (
              <Link key={item.name} href={item.href} onClick={() => setIsSidebarOpen(false)}>
                <span className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-brand-purple/10 text-brand-purple" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}>
                  <item.icon size={20} className={isActive ? "text-brand-purple" : "text-slate-400"} />
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden min-h-[calc(100vh-4rem)] md:min-h-screen">
        {children}
      </main>
    </div>
  );
}
