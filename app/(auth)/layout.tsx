import React from "react";
import Image from "next/image";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans text-slate-800 lg:grid lg:grid-cols-12">
      {/* Panel Izquierdo: Información y Branding (Compartido) */}
      <div className="relative hidden flex-col justify-between bg-white p-12 lg:col-span-5 lg:flex xl:p-16 border-r border-slate-100 overflow-hidden">
        {/* Fondo decorativo sutil */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 h-96 w-96 rounded-full bg-brand-teal/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 h-96 w-96 rounded-full bg-brand-purple/5 blur-3xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-teal text-white font-bold text-lg shadow-md shadow-brand-teal/20">
            S
          </div>
          <span className="text-2xl font-black tracking-tight text-brand-dark">
            Skill<span className="text-brand-purple">Up</span>
          </span>
        </div>

        {/* Contenido Principal */}
        <div className="relative my-auto space-y-12">
          <div className="space-y-6">
            <h1 className="text-4xl font-extrabold tracking-tight text-brand-dark xl:text-5xl leading-tight">
              Plataforma online para el desarrollo de <span className="text-brand-teal underline decoration-brand-teal/30 underline-offset-8">talento y conexión</span>.
            </h1>
            <p className="text-lg text-slate-500 max-w-md">
              Compara tus habilidades, detecta brechas con IA y postula a proyectos de confianza con contratos y pagos seguros.
            </p>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 gap-8 pt-4">
            <div className="space-y-2">
              <span className="text-4xl font-black text-brand-teal tracking-tight block">
                +35 000
              </span>
              <span className="text-sm font-medium text-slate-400 block leading-snug">
                usuarios ya confían en nuestros cursos e hitos
              </span>
            </div>
            <div className="space-y-2">
              <span className="text-4xl font-black text-brand-purple tracking-tight block">
                +200
              </span>
              <span className="text-sm font-medium text-slate-400 block leading-snug">
                PYMEs asociadas publicando ofertas de trabajo
              </span>
            </div>
          </div>

          {/* Botón flotante simulado estilo píldora */}
          <div className="inline-flex items-center gap-3 rounded-full border border-brand-purple/20 bg-brand-light-purple/30 px-6 py-3 text-brand-purple font-semibold text-sm hover:bg-brand-light-purple/50 transition-all duration-300 w-fit">
            <span>Aprende habilidades clave en un mes</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>

        {/* Ilustración de Usuario / Avatar */}
        <div className="relative flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-brand-teal shadow-sm bg-brand-light-teal flex-shrink-0">
            <Image
              src="/developer_avatar.png"
              alt="Developer avatar"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">Comunidad SkillUp</p>
            <p className="text-xs text-slate-400">Únete a desarrolladores validados en Java, Spring Boot y React.</p>
          </div>
          <div className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-brand-dark text-white">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Panel Derecho (Contenido dinámico de las páginas) */}
      <div className="flex flex-col justify-center px-6 py-12 lg:col-span-7 lg:px-12 xl:col-span-7 xl:px-24">
        {children}
      </div>
    </div>
  );
}
