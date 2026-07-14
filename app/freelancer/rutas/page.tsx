"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, Map, Target, Clock, ArrowRight, UserCheck } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SavedRoute {
  id: string;
  date: string;
  data: {
    error: string;
    missingSkills: string[];
    studyPlans: Record<string, any>;
  }
}

export default function RutasPage() {
  const [routes, setRoutes] = useState<SavedRoute[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const raw = localStorage.getItem('freelancer_routes');
    if (raw) {
      setRoutes(JSON.parse(raw));
    }
  }, []);

  if (!mounted) return null;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 pb-20">
      {/* Hero Section (SkillUp Inspired) */}
      <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center overflow-hidden relative">
        <div className="flex-1 space-y-6 z-10">
          <div className="inline-flex items-center gap-2 bg-brand-light-teal px-4 py-2 rounded-full text-brand-teal font-bold text-sm">
            <BookOpen size={16} />
            SkillUp
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-dark tracking-tight leading-tight">
            Tus Rutas de <br/> <span className="text-brand-purple">Aprendizaje</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-md">
            Desarrolla las habilidades técnicas y blandas que te faltan para alcanzar tu máximo potencial.
          </p>
          
          <div className="flex gap-6 pt-4">
            <div>
              <span className="text-4xl font-extrabold text-brand-teal block">+{routes.length}</span>
              <span className="text-sm text-slate-500 font-medium">rutas guardadas</span>
            </div>
            <div>
              <span className="text-4xl font-extrabold text-brand-teal block">100%</span>
              <span className="text-sm text-slate-500 font-medium">enfocado en ti</span>
            </div>
          </div>
        </div>
        
        <div className="md:w-5/12 w-full h-[350px] bg-brand-teal rounded-[2rem] relative overflow-hidden flex flex-col items-center justify-center shadow-inner">
          <div className="absolute top-[-20px] left-[-20px] w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-[-20px] right-[-20px] w-40 h-40 bg-brand-dark/20 rounded-full blur-2xl"></div>
          
          <div className="text-center text-white p-8 relative z-10 flex flex-col items-center">
             <div className="bg-white/10 p-5 rounded-full mb-6 backdrop-blur-sm border border-white/20">
               <Target size={64} className="opacity-90" />
             </div>
             <h3 className="text-2xl font-bold mb-2">El éxito en tu carrera</h3>
             <p className="text-white/80 text-sm">depende de mantenerte actualizado</p>
          </div>
        </div>
      </div>

      {/* Info Cards Row */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-brand-purple rounded-[2rem] p-8 text-white relative overflow-hidden shadow-sm flex flex-col justify-between">
           <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
           <h3 className="text-3xl font-extrabold mb-8 relative z-10">¿Por qué el upskilling es clave?</h3>
           <div className="space-y-4 relative z-10">
              <div className="bg-white/10 p-5 rounded-2xl flex justify-between items-center backdrop-blur-sm border border-white/5 transition-colors hover:bg-white/20">
                 <span className="text-white/90 text-sm font-medium">Empresas que valoran el aprendizaje</span>
                 <span className="text-3xl font-bold text-white">100%</span>
              </div>
              <div className="bg-white/10 p-5 rounded-2xl flex justify-between items-center backdrop-blur-sm border border-white/5 transition-colors hover:bg-white/20">
                 <span className="text-white/90 text-sm font-medium">Incremento de competitividad</span>
                 <span className="text-3xl font-bold text-brand-teal bg-white px-3 py-1 rounded-xl">85%</span>
              </div>
           </div>
        </div>
        <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-100 shadow-sm flex flex-col justify-center">
           <h3 className="text-2xl font-extrabold text-brand-dark mb-8">¿Qué obtendrás aquí?</h3>
           <div className="grid grid-cols-2 gap-x-6 gap-y-8">
              <div className="space-y-3">
                 <div className="w-12 h-12 rounded-2xl bg-brand-light-teal text-brand-teal flex items-center justify-center">
                    <BookOpen size={24} />
                 </div>
                 <div>
                   <h4 className="font-bold text-slate-800 text-sm mb-1">Cursos clave</h4>
                   <p className="text-xs text-slate-500 leading-relaxed">Contenido enfocado en las necesidades del mercado</p>
                 </div>
              </div>
              <div className="space-y-3">
                 <div className="w-12 h-12 rounded-2xl bg-brand-purple/10 text-brand-purple flex items-center justify-center">
                    <UserCheck size={24} />
                 </div>
                 <div>
                   <h4 className="font-bold text-slate-800 text-sm mb-1">Mentoría personal</h4>
                   <p className="text-xs text-slate-500 leading-relaxed">Feedback y acompañamiento en tu ruta</p>
                 </div>
              </div>
              <div className="space-y-3">
                 <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                    <Map size={24} />
                 </div>
                 <div>
                   <h4 className="font-bold text-slate-800 text-sm mb-1">Práctica real</h4>
                   <p className="text-xs text-slate-500 leading-relaxed">Ejercicios basados en casos de uso reales</p>
                 </div>
              </div>
              <div className="space-y-3">
                 <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Clock size={24} />
                 </div>
                 <div>
                   <h4 className="font-bold text-slate-800 text-sm mb-1">A tu propio ritmo</h4>
                   <p className="text-xs text-slate-500 leading-relaxed">Aprende cuando quieras y donde quieras</p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Mis Rutas */}
      <div className="pt-10">
        <h2 className="text-3xl font-extrabold text-brand-dark mb-8 flex items-center gap-3">
          Mis rutas activas
          {routes.length > 0 && (
            <span className="text-sm font-bold bg-brand-light-teal text-brand-teal px-3 py-1 rounded-full">
              {routes.length} guardadas
            </span>
          )}
        </h2>

        {routes.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-12 text-center border border-slate-100 border-dashed flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Map className="w-12 h-12 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-700 mb-3">Aún no tienes rutas guardadas</h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">Busca ofertas de trabajo. Si te falta alguna habilidad, el sistema te generará un plan a tu medida.</p>
            <Link href="/freelancer/ofertas">
              <Button className="bg-brand-teal hover:bg-brand-teal/90 rounded-xl px-8 py-6 text-base font-bold shadow-sm">
                Explorar ofertas ahora
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {routes.map((route) => (
              <div key={route.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="bg-slate-50/50 p-8 border-b border-slate-100 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <h3 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                      Ruta del {new Date(route.date).toLocaleDateString()}
                    </h3>
                    <p className="text-sm text-slate-500 mt-2 flex flex-wrap gap-2 items-center">
                      Habilidades faltantes:
                      {route.data.missingSkills.map(skill => (
                        <span key={skill} className="font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                    </p>
                  </div>
                  <Button className="rounded-xl bg-brand-purple hover:bg-brand-purple/90 text-white font-bold px-6 py-5 w-full md:w-auto shadow-sm">
                    Continuar aprendizaje <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>

                <div className="p-8 space-y-10">
                  {Object.entries(route.data.studyPlans).map(([skill, plan]: [string, any]) => (
                    <div key={skill} className="bg-white">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                          <h4 className="font-extrabold text-brand-dark text-xl">{plan.title}</h4>
                          <p className="text-sm text-slate-500 mt-1 max-w-2xl">{plan.description}</p>
                        </div>
                        <span className="text-sm font-bold text-brand-teal bg-brand-light-teal px-4 py-2 rounded-full whitespace-nowrap self-start md:self-auto border border-brand-teal/10">
                          Duración: {plan.duration}
                        </span>
                      </div>

                      <div className="relative pl-2 md:pl-4">
                        <div className="absolute left-[23px] md:left-[31px] top-2 bottom-6 w-0.5 bg-slate-100 z-0"></div>
                        <Accordion className="space-y-4">
                          {plan.modules.map((mod: any) => (
                            <AccordionItem key={mod.week} value={mod.week.toString()} className="border-none relative z-10">
                              <div className="flex gap-4 md:gap-6 items-start">
                                <div className="w-10 h-10 rounded-full bg-white text-brand-teal flex items-center justify-center font-extrabold text-sm shrink-0 border-[3px] border-brand-teal shadow-sm mt-1 z-10">
                                  {mod.week}
                                </div>
                                <div className="flex-1 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm px-6 transition-all duration-300">
                                  <AccordionTrigger className="hover:no-underline font-bold text-slate-800 py-5 text-base cursor-pointer">
                                    {mod.title}
                                  </AccordionTrigger>
                                  <AccordionContent className="text-slate-600 pb-6">
                                    <ul className="space-y-3 mt-2">
                                      {mod.topics.map((topic: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3">
                                          <div className="w-1.5 h-1.5 rounded-full bg-brand-teal/50 shrink-0 mt-2"></div>
                                          <span className="text-sm leading-relaxed text-slate-600">{topic}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </AccordionContent>
                                </div>
                              </div>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
