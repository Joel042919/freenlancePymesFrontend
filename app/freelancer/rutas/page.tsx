"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, GraduationCap, ChevronRight, PlayCircle, CheckCircle2, X } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Module {
  id: number;
  punto: string;
  description: string;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  progress: number;
  modules: Module[];
}

export default function RutasAprendizajePage() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Interactivity states
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [activePathId, setActivePathId] = useState<string | null>(null);
  const [completedModules, setCompletedModules] = useState<Set<number>>(new Set());

  useEffect(() => {
    apiFetch("/learning-paths/recommended")
      .then(setPaths)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleModuleClick = (pathId: string, module: Module) => {
    setActivePathId(pathId);
    setSelectedModule(module);
  };

  const handleMarkAsCompleted = () => {
    if (selectedModule && activePathId) {
      setCompletedModules((prev) => {
        const newSet = new Set(prev);
        newSet.add(selectedModule.id);
        return newSet;
      });
      
      // Update local progress
      setPaths(prevPaths => prevPaths.map(path => {
        if (path.id === activePathId) {
          const total = path.modules.length;
          // Count how many of this path's modules are in the completed set + the new one
          const completedCount = path.modules.filter(m => completedModules.has(m.id) || m.id === selectedModule.id).length;
          return { ...path, progress: Math.round((completedCount / total) * 100) };
        }
        return path;
      }));
      
      setSelectedModule(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6 relative">
      <div className="bg-gradient-to-r from-brand-purple to-brand-teal p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="flex items-center gap-3">
            <GraduationCap size={32} className="text-white/80" />
            <h1 className="text-4xl font-black">Tus Rutas de Aprendizaje</h1>
          </div>
          <p className="text-white/80 text-lg font-medium leading-relaxed">
            Hemos analizado las ofertas a las que intentaste postular. Aquí tienes el plan exacto para cerrar tu <strong>Skill Gap</strong> y conseguir esos contratos.
          </p>
        </div>
        
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-40 w-64 h-64 bg-brand-light-purple/20 rounded-full blur-2xl"></div>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-slate-100 rounded-3xl"></div>
        </div>
      ) : paths.length === 0 ? (
        <div className="text-center p-12 bg-slate-50 rounded-3xl border border-slate-100">
          <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-600">¡Tu perfil está al día!</h3>
          <p className="text-slate-500 mt-2">Actualmente no tienes brechas de conocimiento detectadas para tus postulaciones recientes.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {paths.map((path) => (
            <div key={path.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-brand-light-purple text-brand-purple rounded-2xl group-hover:scale-110 transition-transform">
                  <BookOpen size={24} />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-brand-purple">{path.progress}%</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completado</div>
                </div>
              </div>
              
              <h2 className="text-2xl font-extrabold text-slate-800 mb-2">{path.title}</h2>
              <p className="text-slate-500 text-sm mb-6 h-10">{path.description}</p>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-3 rounded-full mb-6 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-brand-purple to-brand-teal h-full rounded-full transition-all duration-1000"
                  style={{ width: `${path.progress}%` }}
                ></div>
              </div>

              <div className="space-y-3 mb-6">
                <h4 className="font-bold text-sm text-slate-400 uppercase tracking-wider">Módulos (Sílabo)</h4>
                {path.modules.map((m, idx) => {
                  const isCompleted = path.progress > 0 && idx === 0 || completedModules.has(m.id);
                  return (
                    <div 
                      key={m.id} 
                      onClick={() => handleModuleClick(path.id, m)}
                      className="flex gap-3 items-start p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-brand-purple/30 group/item"
                    >
                      <div className="mt-0.5">
                        {isCompleted ? (
                           <CheckCircle2 className="text-brand-teal" size={18} />
                        ) : (
                           <PlayCircle className="text-slate-300 group-hover/item:text-brand-purple transition-colors" size={18} />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-700 text-sm group-hover/item:text-brand-purple transition-colors">{m.punto}</div>
                        <div className="text-xs text-slate-500 mt-1 line-clamp-1">{m.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button 
                onClick={() => handleModuleClick(path.id, path.modules.find(m => !completedModules.has(m.id)) || path.modules[0])}
                className="w-full bg-brand-dark text-white font-bold rounded-2xl py-4 flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
              >
                Continuar Aprendiendo <ChevronRight size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal interactivo para el contenido del módulo */}
      {selectedModule && (
        <InteractiveModuleModal 
           module={selectedModule} 
           onClose={() => setSelectedModule(null)}
           onComplete={handleMarkAsCompleted}
        />
      )}
    </div>
  );
}

function InteractiveModuleModal({ module, onClose, onComplete }: { module: Module, onClose: () => void, onComplete: () => void }) {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/learning-paths/content/${module.id}`)
      .then(res => setContent(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [module.id]);

  const handleAnswerSubmit = (index: number) => {
    setSelectedAnswer(index);
    setShowResult(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="bg-brand-purple p-6 text-white flex justify-between items-start">
          <div>
            <div className="bg-white/20 text-xs font-bold px-2 py-1 rounded inline-block mb-2">Clase Teórica Interactiva</div>
            <h3 className="text-2xl font-black">{module.punto}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto text-slate-600 leading-relaxed">
          {loading ? (
             <div className="animate-pulse space-y-4">
               <div className="h-4 bg-slate-200 rounded w-full"></div>
               <div className="h-4 bg-slate-200 rounded w-5/6"></div>
               <div className="h-4 bg-slate-200 rounded w-4/6"></div>
               <div className="h-32 bg-slate-100 rounded-xl mt-6"></div>
             </div>
          ) : content ? (
            <>
              <div className="bg-brand-light-purple/30 p-6 rounded-2xl text-slate-800 font-medium text-lg border border-brand-purple/10">
                {content.teoria}
              </div>
              
              {content.quiz && content.quiz.length > 0 && (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mt-6">
                  <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <PlayCircle className="text-brand-purple" size={20} />
                    Validación Rápida
                  </h4>
                  <p className="font-medium text-slate-700 mb-4">{content.quiz[0].pregunta}</p>
                  
                  <div className="space-y-3">
                    {content.quiz[0].opciones.map((opt: string, idx: number) => {
                      const isSelected = selectedAnswer === idx;
                      const isCorrect = idx === content.quiz[0].respuesta_correcta;
                      
                      let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all font-medium ";
                      if (showResult) {
                        if (isCorrect) btnClass += "border-green-500 bg-green-50 text-green-700";
                        else if (isSelected && !isCorrect) btnClass += "border-red-500 bg-red-50 text-red-700";
                        else btnClass += "border-slate-200 bg-white text-slate-400";
                      } else {
                        btnClass += isSelected ? "border-brand-purple bg-brand-light-purple/30 text-brand-purple" : "border-slate-200 bg-white hover:border-brand-purple/50";
                      }

                      return (
                        <button 
                          key={idx} 
                          disabled={showResult}
                          onClick={() => handleAnswerSubmit(idx)}
                          className={btnClass}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  {showResult && (
                    <div className={`mt-4 p-4 rounded-xl font-bold flex items-center gap-2 ${selectedAnswer === content.quiz[0].respuesta_correcta ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                       {selectedAnswer === content.quiz[0].respuesta_correcta ? (
                         <><CheckCircle2 size={20} /> ¡Correcto! Has entendido el concepto.</>
                       ) : (
                         <><X size={20} /> Incorrecto. Repasa la teoría e inténtalo de nuevo.</>
                       )}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="text-red-500">Ocurrió un error al cargar el contenido interactivo.</p>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cerrar
          </button>
          <button 
            onClick={onComplete}
            disabled={!showResult || selectedAnswer !== content?.quiz?.[0]?.respuesta_correcta}
            className="px-6 py-3 rounded-xl font-bold bg-brand-teal text-white hover:bg-brand-teal/90 transition-colors flex items-center gap-2 shadow-lg shadow-brand-teal/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 size={20} />
            Marcar como Completado
          </button>
        </div>
      </div>
    </div>
  );
}
