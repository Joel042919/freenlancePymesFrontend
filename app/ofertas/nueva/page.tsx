"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowLeft, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { getRole } from "@/lib/auth";

interface Skill {
  id: number;
  name: string;
}

interface FormData {
  title: string;
  description: string;
  budgetType: "FIXED" | "HOURLY";
  minBudget: string;
  maxBudget: string;
  totalBudget: string;
  duration: string;
  modality: "REMOTE" | "ONSITE" | "HYBRID" | "";
  applicationDeadline: string;
  requiredSkills: string[];
}

interface FormErrors {
  [key: string]: string;
}

const INITIAL_FORM: FormData = {
  title: "",
  description: "",
  budgetType: "FIXED",
  minBudget: "",
  maxBudget: "",
  totalBudget: "",
  duration: "",
  modality: "",
  applicationDeadline: "",
  requiredSkills: [],
};

export default function NuevaOfertaPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [skillSearch, setSkillSearch] = useState("");
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);

  useEffect(() => {
    const role = getRole();
    if (role !== "PYME") {
      router.replace("/403");
      return;
    }
    apiFetch("/marketplace/skills")
      .then((data) => setAvailableSkills(Array.isArray(data) ? data : []))
      .catch(() => setAvailableSkills([]))
      .finally(() => setSkillsLoading(false));
  }, [router]);

  const update = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!form.title.trim()) errs.title = "El título es obligatorio.";
    if (!form.description.trim()) errs.description = "La descripción es obligatoria.";
    if (!form.duration.trim()) errs.duration = "Indica la duración estimada.";

    if (form.budgetType === "FIXED") {
      const total = Number(form.totalBudget);
      if (!total || total <= 0) errs.totalBudget = "Ingresa un presupuesto total válido.";
    } else {
      const min = Number(form.minBudget);
      const max = Number(form.maxBudget);
      if (!min || min <= 0) errs.minBudget = "Ingresa un mínimo válido.";
      if (!max || max <= 0) errs.maxBudget = "Ingresa un máximo válido.";
      if (min && max && min >= max) errs.maxBudget = "El máximo debe ser mayor al mínimo.";
    }

    if (!form.modality) errs.modality = "Selecciona una modalidad.";
    if (!form.applicationDeadline) errs.applicationDeadline = "Selecciona una fecha límite.";
    if (form.requiredSkills.length === 0) errs.requiredSkills = "Agrega al menos una habilidad.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    if (!validate()) return;

    const payload: Record<string, string | number | string[]> = {
      title: form.title.trim(),
      description: form.description.trim(),
      budgetType: form.budgetType,
      duration: form.duration.trim(),
      modality: form.modality,
      applicationDeadline: form.applicationDeadline,
      requiredSkills: form.requiredSkills,
    };

    if (form.budgetType === "FIXED") {
      payload.totalBudget = Number(form.totalBudget);
    } else {
      payload.minBudget = Number(form.minBudget);
      payload.maxBudget = Number(form.maxBudget);
    }

    setSubmitting(true);
    try {
      await apiFetch("/marketplace/offers", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      router.push("/pyme/ofertas");
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "No se pudo crear la oferta.");
    } finally {
      setSubmitting(false);
    }
  };

  const addSkill = (name: string) => {
    if (!form.requiredSkills.includes(name)) {
      update("requiredSkills", [...form.requiredSkills, name]);
    }
    setSkillSearch("");
    setShowSkillDropdown(false);
  };

  const removeSkill = (name: string) => {
    update("requiredSkills", form.requiredSkills.filter((s) => s !== name));
  };

  const filteredSkills = availableSkills.filter(
    (s) =>
      s.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
      !form.requiredSkills.includes(s.name)
  );

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-purple"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>

      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-brand-dark">Crear nueva oferta</h1>
        <p className="text-sm text-slate-500">
          Publica un proyecto y recibe propuestas de freelancers.
        </p>
      </div>

      {submitError && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600 border border-red-100">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <Card className="rounded-3xl border-slate-100 shadow-sm">
          <CardContent className="space-y-5 p-8">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500">Título del puesto *</Label>
              <Input
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                className="rounded-2xl border-slate-200 h-11"
                placeholder="Ej: Desarrollador React Senior"
              />
              {errors.title && <p className="text-xs font-semibold text-red-500">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500">Descripción detallada *</Label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                className="w-full min-h-32 rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                placeholder="Describe el proyecto, responsabilidades y requisitos..."
              />
              {errors.description && <p className="text-xs font-semibold text-red-500">{errors.description}</p>}
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-semibold text-slate-500">Habilidades requeridas *</Label>
              <div className="relative">
                <Input
                  value={skillSearch}
                  onChange={(e) => {
                    setSkillSearch(e.target.value);
                    setShowSkillDropdown(true);
                  }}
                  onFocus={() => setShowSkillDropdown(true)}
                  onBlur={() => setTimeout(() => setShowSkillDropdown(false), 200)}
                  className="rounded-2xl border-slate-200 h-11"
                  placeholder="Buscar y seleccionar habilidades..."
                  disabled={skillsLoading}
                />
                {showSkillDropdown && skillSearch && filteredSkills.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg max-h-48 overflow-y-auto">
                    {filteredSkills.map((skill) => (
                      <button
                        key={skill.id}
                        type="button"
                        onMouseDown={() => addSkill(skill.name)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-brand-light-purple hover:text-brand-purple transition-colors"
                      >
                        {skill.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {form.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 rounded-full bg-brand-light-purple px-3 py-1 text-xs font-semibold text-brand-purple"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-red-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              {errors.requiredSkills && <p className="text-xs font-semibold text-red-500">{errors.requiredSkills}</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-100 shadow-sm">
          <CardContent className="space-y-5 p-8">
            <h2 className="text-lg font-bold text-brand-dark">Presupuesto y condiciones</h2>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500">Tipo de presupuesto</Label>
              <div className="flex gap-3">
                {(["FIXED", "HOURLY"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => update("budgetType", type)}
                    className={`rounded-2xl px-5 py-2.5 text-sm font-bold transition-colors ${
                      form.budgetType === type
                        ? "bg-brand-purple text-white"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {type === "FIXED" ? "Presupuesto fijo" : "Por hora"}
                  </button>
                ))}
              </div>
            </div>

            {form.budgetType === "FIXED" ? (
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500">Presupuesto total (USD) *</Label>
                <Input
                  type="number"
                  min={1}
                  value={form.totalBudget}
                  onChange={(e) => update("totalBudget", e.target.value)}
                  className="rounded-2xl border-slate-200 h-11"
                  placeholder="Ej: 5000"
                />
                {errors.totalBudget && <p className="text-xs font-semibold text-red-500">{errors.totalBudget}</p>}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500">Mínimo (USD) *</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.minBudget}
                    onChange={(e) => update("minBudget", e.target.value)}
                    className="rounded-2xl border-slate-200 h-11"
                    placeholder="Ej: 20"
                  />
                  {errors.minBudget && <p className="text-xs font-semibold text-red-500">{errors.minBudget}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500">Máximo (USD) *</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.maxBudget}
                    onChange={(e) => update("maxBudget", e.target.value)}
                    className="rounded-2xl border-slate-200 h-11"
                    placeholder="Ej: 50"
                  />
                  {errors.maxBudget && <p className="text-xs font-semibold text-red-500">{errors.maxBudget}</p>}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500">Duración estimada *</Label>
              <Input
                value={form.duration}
                onChange={(e) => update("duration", e.target.value)}
                className="rounded-2xl border-slate-200 h-11"
                placeholder="Ej: 3 meses"
              />
              {errors.duration && <p className="text-xs font-semibold text-red-500">{errors.duration}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500">Modalidad *</Label>
              <div className="flex flex-wrap gap-3">
                {([
                  { value: "REMOTE", label: "Remoto" },
                  { value: "ONSITE", label: "Presencial" },
                  { value: "HYBRID", label: "Híbrido" },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update("modality", opt.value)}
                    className={`rounded-2xl px-5 py-2.5 text-sm font-bold transition-colors ${
                      form.modality === opt.value
                        ? "bg-brand-purple text-white"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {errors.modality && <p className="text-xs font-semibold text-red-500">{errors.modality}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500">Fecha límite de aplicación *</Label>
              <Input
                type="date"
                value={form.applicationDeadline}
                onChange={(e) => update("applicationDeadline", e.target.value)}
                className="rounded-2xl border-slate-200 h-11"
              />
              {errors.applicationDeadline && (
                <p className="text-xs font-semibold text-red-500">{errors.applicationDeadline}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="rounded-2xl h-11 px-6"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="rounded-2xl h-11 px-6 bg-brand-purple hover:bg-brand-purple/90 text-white font-bold"
          >
            <Save className="h-4 w-4" />
            {submitting ? "Publicando..." : "Publicar oferta"}
          </Button>
        </div>
      </form>
    </div>
  );
}
