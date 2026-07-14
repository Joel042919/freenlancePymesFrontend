"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GraduationCap, CheckCircle2, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { apiFetch, ApiError } from "@/lib/api";

interface SkillStatus {
  skillId: number;
  skillName: string;
  category: string;
  alreadyPassed: boolean;
  bestScore: number | null;
}

export default function EvaluacionesPage() {
  const [skills, setSkills] = useState<SkillStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/assessments/my-skills")
      .then((data) => setSkills(data))
      .catch((err: ApiError) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 pb-20">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-brand-dark">Evaluación de habilidades</h1>
        <p className="text-lg text-slate-500">
          Rinde pruebas automáticas por cada habilidad declarada en tu perfil y obtén la insignia
          &quot;Habilidad Verificada&quot;.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600 border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Cargando tus habilidades...</p>
      ) : skills.length === 0 ? (
        <p className="text-sm text-slate-400">
          Aún no has declarado habilidades en tu perfil. Agrégalas para poder rendir evaluaciones.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <Card key={skill.skillId} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light-teal text-brand-teal">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                    {skill.category}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-brand-dark">{skill.skillName}</h3>

                {skill.alreadyPassed ? (
                  <div className="flex items-center gap-2 rounded-2xl bg-brand-light-teal p-3 text-sm font-bold text-brand-teal">
                    <CheckCircle2 className="h-4 w-4" />
                    Habilidad Verificada ({skill.bestScore?.toFixed(0)}%)
                  </div>
                ) : (
                  <Link
                    href={`/freelancer/evaluaciones/evaluar/test-session`}
                    className="flex items-center justify-center gap-1.5 rounded-2xl bg-brand-teal px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-teal/90 transition-colors"
                  >
                    Rendir prueba <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
