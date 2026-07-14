"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { X, ArrowLeft, Save } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api";
import { getRole } from "@/lib/auth";

interface Skill {
  id: number;
  name: string;
}

interface OfferData {
  id: string;
  title: string;
  description: string;
  budgetType: string;
  totalBudget: number | null;
  minBudget: number | null;
  maxBudget: number | null;
  modality: string | null;
  estimatedDays: number | null;
  location: string | null;
  requiredSkills: string[];
}

interface FormState {
  title: string;
  description: string;
  budgetType: "FIJO" | "POR_HORA";
  minBudget: string;
  maxBudget: string;
  totalBudget: string;
  estimatedDays: string;
  modality: "REMOTO" | "PRESENCIAL" | "HIBRIDO" | "";
  requiredSkillIds: number[];
  location: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function EditarOfertaPage() {
  const params = useParams<{ offerId: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [form, setForm] = useState<FormState | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [skillSearch, setSkillSearch] = useState("");
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);

  useEffect(() => {
    const role = getRole();
    if (role !== "PYME") {
      router.replace("/403");
      return;
    }

    Promise.all([
      apiFetch(`/offers/${params.offerId}`) as Promise<OfferData>,
      apiFetch("/marketplace/skills").catch(() => []) as Promise<Skill[]>,
    ])
      .then(([offer, skills]) => {
        const catalog = Array.isArray(skills) ? skills : [];
        setAvailableSkills(catalog);

        const skillIds = (offer.requiredSkills ?? [])
          .map((name) => catalog.find((s) => s.name === name)?.id)
          .filter((id): id is number => id != null);

        setForm({
          title: offer.title,
          description: offer.description,
          budgetType:
            offer.budgetType === "FIJO" || offer.budgetType === "POR_HORA"
              ? offer.budgetType
              : "FIJO",
          minBudget: offer.minBudget?.toString() || "",
          maxBudget: offer.maxBudget?.toString() || "",
          totalBudget: offer.totalBudget?.toString() || "",
          estimatedDays: offer.estimatedDays?.toString() || "",
          modality: (offer.modality as FormState["modality"]) || "",
          requiredSkillIds: skillIds,
          location: offer.location || "",
        });
      })
      .catch((err: ApiError) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, [params.offerId, router]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = (): boolean => {
    if (!form) return false;
    const errs: FormErrors = {};

    if (!form.title.trim()) errs.title = "El título es obligatorio.";
    if (!form.description.trim())
      errs.description = "La descripción es obligatoria.";
    if (!form.estimatedDays.trim())
      errs.estimatedDays = "Indica los días estimados.";

    if (form.budgetType === "FIJO") {
      const total = Number(form.totalBudget);
      if (!total || total <= 0)
        errs.totalBudget = "Ingresa un presupuesto total válido.";
    } else {
      const min = Number(form.minBudget);
      const max = Number(form.maxBudget);
      if (!min || min <= 0) errs.minBudget = "Ingresa un mínimo válido.";
      if (!max || max <= 0) errs.maxBudget = "Ingresa un máximo válido.";
      if (min && max && min >= max)
        errs.maxBudget = "El máximo debe ser mayor al mínimo.";
    }

    if (!form.modality) errs.modality = "Selecciona una modalidad.";
    if (form.requiredSkillIds.length === 0)
      errs.requiredSkillIds = "Agrega al menos una habilidad.";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSubmitError("");
    if (!validate()) return;

    const payload: Record<string, any> = {
      title: form.title.trim(),
      description: form.description.trim(),
      budgetType: form.budgetType,
      estimatedDays: Number(form.estimatedDays),
      modality: form.modality,
      requiredSkillIds: form.requiredSkillIds,
    };

    if (form.budgetType === "FIJO") {
      payload.totalBudget = Number(form.totalBudget);
    } else {
      payload.minBudget = Number(form.minBudget);
      payload.maxBudget = Number(form.maxBudget);
    }

    if (form.location.trim()) {
      payload.location = form.location.trim();
    }

    setSubmitting(true);
    try {
      await apiFetch(`/offers/${params.offerId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      router.push("/pyme/ofertas");
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : "No se pudo actualizar la oferta.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const addSkill = (id: number) => {
    if (!form) return;
    if (!form.requiredSkillIds.includes(id)) {
      update("requiredSkillIds", [...form.requiredSkillIds, id]);
    }
    setSkillSearch("");
    setShowSkillDropdown(false);
  };

  const removeSkill = (id: number) => {
    if (!form) return;
    update(
      "requiredSkillIds",
      form.requiredSkillIds.filter((s) => s !== id),
    );
  };

  const skillName = (id: number) =>
    availableSkills.find((s) => s.id === id)?.name ?? `Skill #${id}`;

  const filteredSkills = availableSkills.filter(
    (s) =>
      s.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
      !(form?.requiredSkillIds ?? []).includes(s.id),
  );

  if (loading)
    return <p className="text-sm text-slate-400">Cargando oferta...</p>;
  if (loadError)
    return <p className="text-sm font-semibold text-red-600">{loadError}</p>;
  if (!form) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-purple"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </button>

      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-brand-dark">
          Editar oferta
        </h1>
        <p className="text-sm text-slate-500">
          Actualiza los detalles de tu oferta publicada.
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
              <Label className="text-xs font-semibold text-slate-500">
                Título del puesto *
              </Label>
              <Input
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                className="rounded-2xl border-slate-200 h-11"
              />
              {errors.title && (
                <p className="text-xs font-semibold text-red-500">
                  {errors.title}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500">
                Descripción detallada *
              </Label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                className="w-full min-h-32 rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
              {errors.description && (
                <p className="text-xs font-semibold text-red-500">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-semibold text-slate-500">
                Habilidades requeridas *
              </Label>
              <div className="relative">
                <Input
                  value={skillSearch}
                  onChange={(e) => {
                    setSkillSearch(e.target.value);
                    setShowSkillDropdown(true);
                  }}
                  onFocus={() => setShowSkillDropdown(true)}
                  onBlur={() =>
                    setTimeout(() => setShowSkillDropdown(false), 200)
                  }
                  className="rounded-2xl border-slate-200 h-11"
                  placeholder="Buscar y seleccionar habilidades..."
                />
                {showSkillDropdown &&
                  skillSearch &&
                  filteredSkills.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg max-h-48 overflow-y-auto">
                      {filteredSkills.map((skill) => (
                        <button
                          key={skill.id}
                          type="button"
                          onMouseDown={() => addSkill(skill.id)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-brand-light-purple hover:text-brand-purple transition-colors"
                        >
                          {skill.name}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
              <div className="flex flex-wrap gap-2">
                {form.requiredSkillIds.map((id) => (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1 rounded-full bg-brand-light-purple px-3 py-1 text-xs font-semibold text-brand-purple"
                  >
                    {skillName(id)}
                    <button
                      type="button"
                      onClick={() => removeSkill(id)}
                      className="hover:text-red-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              {errors.requiredSkillIds && (
                <p className="text-xs font-semibold text-red-500">
                  {errors.requiredSkillIds}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-100 shadow-sm">
          <CardContent className="space-y-5 p-8">
            <h2 className="text-lg font-bold text-brand-dark">
              Presupuesto y condiciones
            </h2>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500">
                Tipo de presupuesto
              </Label>
              <div className="flex gap-3">
                {(["FIJO", "POR_HORA"] as const).map((type) => (
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
                    {type === "FIJO" ? "Presupuesto fijo" : "Por hora"}
                  </button>
                ))}
              </div>
            </div>

            {form.budgetType === "FIJO" ? (
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-500">
                  Presupuesto total (USD) *
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={form.totalBudget}
                  onChange={(e) => update("totalBudget", e.target.value)}
                  className="rounded-2xl border-slate-200 h-11"
                />
                {errors.totalBudget && (
                  <p className="text-xs font-semibold text-red-500">
                    {errors.totalBudget}
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500">
                    Mínimo (USD) *
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.minBudget}
                    onChange={(e) => update("minBudget", e.target.value)}
                    className="rounded-2xl border-slate-200 h-11"
                  />
                  {errors.minBudget && (
                    <p className="text-xs font-semibold text-red-500">
                      {errors.minBudget}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-slate-500">
                    Máximo (USD) *
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.maxBudget}
                    onChange={(e) => update("maxBudget", e.target.value)}
                    className="rounded-2xl border-slate-200 h-11"
                  />
                  {errors.maxBudget && (
                    <p className="text-xs font-semibold text-red-500">
                      {errors.maxBudget}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500">
                Días estimados *
              </Label>
              <Input
                type="number"
                min={1}
                value={form.estimatedDays}
                onChange={(e) => update("estimatedDays", e.target.value)}
                className="rounded-2xl border-slate-200 h-11"
              />
              {errors.estimatedDays && (
                <p className="text-xs font-semibold text-red-500">
                  {errors.estimatedDays}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500">
                Modalidad *
              </Label>
              <div className="flex flex-wrap gap-3">
                {(
                  [
                    { value: "REMOTO", label: "Remoto" },
                    { value: "PRESENCIAL", label: "Presencial" },
                    { value: "HIBRIDO", label: "Híbrido" },
                  ] as const
                ).map((opt) => (
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
              {errors.modality && (
                <p className="text-xs font-semibold text-red-500">
                  {errors.modality}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500">
                Ubicación
              </Label>
              <Input
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                className="rounded-2xl border-slate-200 h-11"
                placeholder="Ej: Lima, Perú"
              />
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
            {submitting ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
}
