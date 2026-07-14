"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Briefcase, FileSignature, Star, Search } from 'lucide-react';

export default function FreelancerDashboard() {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const email = localStorage.getItem('user_email');
    if (email) {
      setUserName(email.split('@')[0]);
    }
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-brand-dark mb-2">¡Hola, {userName || 'Freelancer'}! 👋</h1>
        <p className="text-slate-500 text-lg">Bienvenido a tu panel de control. Aquí tienes un resumen de tu actividad.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="h-12 w-12 bg-brand-teal/10 rounded-xl flex items-center justify-center mb-4 text-brand-teal">
              <Briefcase size={24} />
            </div>
            <h3 className="text-slate-500 font-medium mb-1">Postulaciones Activas</h3>
            <p className="text-3xl font-bold text-slate-800">3</p>
          </div>
          <Link href="/freelancer/ofertas" className="mt-4 flex items-center gap-1 text-sm text-brand-purple font-medium hover:underline">
            Ver ofertas <ArrowRight size={16} />
          </Link>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="h-12 w-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4 text-amber-600">
              <Star size={24} />
            </div>
            <h3 className="text-slate-500 font-bold mb-1">Evaluaciones Completadas</h3>
            <p className="text-3xl font-bold text-slate-800">2</p>
          </div>
          <Link href="/freelancer/evaluaciones" className="mt-4 flex items-center gap-1 text-sm text-brand-purple font-medium hover:underline">
            Rendir más pruebas <ArrowRight size={16} />
          </Link>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <div className="h-12 w-12 bg-brand-purple/10 rounded-xl flex items-center justify-center mb-4 text-brand-purple">
              <FileSignature size={24} />
            </div>
            <h3 className="text-slate-500 font-bold mb-1">Hitos Pendientes</h3>
            <p className="text-3xl font-bold text-slate-800">1</p>
          </div>
          <Link href="/freelancer/contratos" className="mt-4 flex items-center gap-1 text-sm text-brand-purple font-medium hover:underline">
            Ir a contratos <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="bg-gradient-to-r from-brand-purple to-purple-800 rounded-[2rem] p-10 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 md:w-2/3">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Descubre nuevas oportunidades</h2>
          <p className="mb-8 text-purple-100 text-lg">
            Las PYMEs están buscando profesionales con tus habilidades. Revisa las ofertas que hacen match perfecto con tu perfil.
          </p>
          <Link 
            href="/freelancer/ofertas" 
            className="inline-flex items-center gap-2 bg-white text-brand-purple px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-colors shadow-sm"
          >
            Explorar Marketplace <ArrowRight size={20} />
          </Link>
        </div>
        <div className="absolute -bottom-10 -right-10 opacity-20 pointer-events-none">
          <Search size={250} />
        </div>
      </div>
    </div>
  );
}
