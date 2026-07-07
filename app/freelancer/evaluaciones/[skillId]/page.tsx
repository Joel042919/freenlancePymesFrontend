"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api";

interface Question {
  index: number;
  question: string;
  options: string[];
}

interface StartResponse {
  assessmentId: string;
  skillName: string;
  questions: Question[];
}

interface ResultResponse {
  score: number;
  passed: boolean;
  badgeAwarded: boolean;
}

export default function QuizPage() {
  const params = useParams<{ skillId: string }>();
  const router = useRouter();

  const [quiz, setQuiz] = useState<StartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ResultResponse | null>(null);

  useEffect(() => {
    apiFetch(`/assessments/${params.skillId}/start`, { method: "POST" })
      .then((data) => setQuiz(data))
      .catch((err: ApiError) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.skillId]);

  const selectAnswer = (optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    setSubmitting(true);
    setError("");
    try {
      const data = await apiFetch(`/assessments/${quiz.assessmentId}/submit`, {
        method: "POST",
        body: JSON.stringify({ answers }),
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || "No se pudo calificar la evaluación.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-sm text-slate-400">Generando tu evaluación...</p>;
  if (error && !quiz) return <p className="text-sm font-semibold text-red-600">{error}</p>;
  if (!quiz) return null;

  if (result) {
    return (
      <div className="mx-auto max-w-lg">
        <Card className="rounded-3xl border-slate-100 shadow-sm">
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full ${
                result.passed ? "bg-brand-light-teal text-brand-teal" : "bg-red-50 text-red-500"
              }`}
            >
              {result.passed ? <CheckCircle2 className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
            </div>
            <h1 className="text-2xl font-extrabold text-brand-dark">
              {result.passed ? "¡Aprobaste la evaluación!" : "No alcanzaste el puntaje mínimo"}
            </h1>
            <p className="text-sm text-slate-500">
              Obtuviste <span className="font-bold text-brand-dark">{result.score.toFixed(0)}%</span> en{" "}
              {quiz.skillName}. Se requiere al menos 70% para obtener la insignia.
            </p>
            {result.badgeAwarded && (
              <div className="rounded-2xl bg-brand-light-teal px-4 py-2 text-sm font-bold text-brand-teal">
                🏅 Insignia &quot;Habilidad Verificada&quot; obtenida para {quiz.skillName}
              </div>
            )}
            <Button
              onClick={() => router.push("/freelancer/evaluaciones")}
              className="mt-2 rounded-2xl bg-brand-teal hover:bg-brand-teal/90 text-white font-bold h-11 px-6"
            >
              Volver a evaluaciones
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = quiz.questions[currentIndex];
  const isLast = currentIndex === quiz.questions.length - 1;
  const hasAnswer = answers[currentIndex] !== undefined;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <button
        onClick={() => router.push("/freelancer/evaluaciones")}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-teal"
      >
        <ArrowLeft className="h-4 w-4" /> Salir de la evaluación
      </button>

      <Card className="rounded-3xl border-slate-100 shadow-sm">
        <CardContent className="space-y-6 p-8">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {quiz.skillName}
            </span>
            <span className="text-xs font-bold text-slate-400">
              Pregunta {currentIndex + 1} de {quiz.questions.length}
            </span>
          </div>

          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand-teal transition-all"
              style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
            />
          </div>

          <h2 className="text-lg font-bold text-brand-dark">{question.question}</h2>

          {error && (
            <div className="rounded-2xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {question.options.map((option, i) => (
              <button
                key={i}
                onClick={() => selectAnswer(i)}
                className={`w-full rounded-2xl border p-4 text-left text-sm font-semibold transition-all ${
                  answers[currentIndex] === i
                    ? "border-brand-teal bg-brand-light-teal/40 ring-1 ring-brand-teal text-brand-dark"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => i - 1)}
              className="rounded-2xl h-10 px-4"
            >
              Anterior
            </Button>

            {isLast ? (
              <Button
                type="button"
                disabled={!hasAnswer || submitting}
                onClick={handleSubmit}
                className="rounded-2xl h-10 px-6 bg-brand-teal hover:bg-brand-teal/90 text-white font-bold"
              >
                {submitting ? "Enviando..." : "Enviar respuestas"}
              </Button>
            ) : (
              <Button
                type="button"
                disabled={!hasAnswer}
                onClick={() => setCurrentIndex((i) => i + 1)}
                className="flex items-center gap-1.5 rounded-2xl h-10 px-4 bg-brand-teal hover:bg-brand-teal/90 text-white font-bold"
              >
                Siguiente <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
