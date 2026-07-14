"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { PortfolioData } from '@/app/features/portafolio/components/FormularioPortafolio';

export default function Portafolio() {
  const [portafolios, setPortafolios] = useState<PortfolioData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioData | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openImageViewer = (p: PortfolioData, initialIndex = 0) => {
    setSelectedPortfolio(p);
    setCurrentImageIndex(initialIndex);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPortfolio && selectedPortfolio.imageUrl) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedPortfolio.imageUrl.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedPortfolio && selectedPortfolio.imageUrl) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedPortfolio.imageUrl.length) % selectedPortfolio.imageUrl.length);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este proyecto?')) return;
    const token = localStorage.getItem('jwt_token');
    try {
      const res = await fetch(`http://localhost:8080/api/portafolios/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setPortafolios(prev => prev.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error("Error eliminando", error);
    }
  };

  useEffect(() => {
    const fetchPortfolios = async () => {
      const token = localStorage.getItem('jwt_token');
      const userId = localStorage.getItem('user_id');

      if (!token || !userId) {
        console.error("No autenticado");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:8080/api/portafolios/freelancer/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setPortafolios(data);
        }
      } catch (error) {
        console.error("Error fetching portfolios", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Cargando portafolio...</div>;
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-dark">Mi Portafolio</h1>
          <p className="text-lg text-slate-500 mt-2">Gestiona los proyectos que muestran tus habilidades.</p>
        </div>
        <Link href="/freelancer/portafolio/crear" className="px-6 py-3 bg-brand-purple text-white rounded-2xl font-bold hover:bg-brand-purple/90 shadow-sm transition-all">
          Crear Proyecto
        </Link>
      </div>
      <div>
        <h2 className="text-xl font-extrabold text-slate-700 mb-6">Tus proyectos</h2>
        {portafolios.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 border-dashed">
            <p className="text-slate-500">No tienes proyectos en tu portafolio aún.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portafolios.map((p) => (
              <div key={p.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all">
                {p.imageUrl && p.imageUrl.length > 0 ? (
                  <div className="relative group w-full h-48 bg-slate-100">
                    <img 
                      src={p.imageUrl[0]} 
                      alt={p.title} 
                      className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                      onClick={() => openImageViewer(p, 0)}
                    />
                    {p.imageUrl.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md pointer-events-none">
                        1 / {p.imageUrl.length}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-48 bg-slate-100 flex items-center justify-center text-slate-400">Sin Imagen</div>
                )}
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="text-xl font-extrabold text-brand-dark mb-3">{p.title}</h3>
                  <p className="text-slate-600 text-sm line-clamp-2 mb-4 flex-1">{p.description}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                    <button 
                      onClick={() => p.id && handleDelete(p.id)}
                      className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                    >
                      Eliminar
                    </button>
                    <Link href={`/freelancer/portafolio/${p.id}`} className="px-4 py-2 bg-brand-light-teal text-brand-teal rounded-xl text-sm font-bold hover:bg-brand-teal hover:text-white transition-colors">
                      Editar
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visor de imágenes (Modal) con Carrusel */}
      {selectedPortfolio && selectedPortfolio.imageUrl && (
        <div 
          className="fixed inset-0 bg-black/95 z-100 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedPortfolio(null)}
        >
          <div className="absolute top-4 left-4 text-white/70 font-medium">
            {selectedPortfolio.title} - {currentImageIndex + 1} de {selectedPortfolio.imageUrl.length}
          </div>
          <button 
            className="absolute top-4 right-6 text-white bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold transition-colors"
            onClick={(e) => { e.stopPropagation(); setSelectedPortfolio(null); }}
          >
            &times;
          </button>

          <div className="relative flex items-center justify-center w-full max-w-5xl flex-1">
            {/* Flecha Izquierda */}
            {selectedPortfolio.imageUrl.length > 1 && (
              <button 
                className="absolute left-2 md:left-8 z-10 bg-black/50 text-white hover:bg-black/80 rounded-full w-12 h-12 flex items-center justify-center text-3xl font-bold transition-colors"
                onClick={prevImage}
              >
                &#8249;
              </button>
            )}

            {/* Imagen Actual */}
            <img 
              src={selectedPortfolio.imageUrl[currentImageIndex]} 
              alt={`Visor de imagen ${currentImageIndex + 1}`} 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" 
              onClick={(e) => e.stopPropagation()} 
            />

            {/* Flecha Derecha */}
            {selectedPortfolio.imageUrl.length > 1 && (
              <button 
                className="absolute right-2 md:right-8 z-10 bg-black/50 text-white hover:bg-black/80 rounded-full w-12 h-12 flex items-center justify-center text-3xl font-bold transition-colors"
                onClick={nextImage}
              >
                &#8250;
              </button>
            )}
          </div>
          
          {/* Miniaturas opcionales abajo */}
          {selectedPortfolio.imageUrl.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto max-w-full px-4 pb-2" onClick={(e) => e.stopPropagation()}>
              {selectedPortfolio.imageUrl.map((img, idx) => (
                <img 
                  key={idx}
                  src={img} 
                  alt={`Miniatura ${idx + 1}`}
                  className={`h-16 w-16 object-cover rounded-md cursor-pointer transition-all border-2 ${idx === currentImageIndex ? 'border-brand-teal opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}
                  onClick={() => setCurrentImageIndex(idx)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}