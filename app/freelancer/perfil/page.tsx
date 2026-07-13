"use client";

import React, { useState, useEffect, useRef } from 'react';
import { User, Save, Code, AlertCircle } from 'lucide-react';
import { useEffect, useState, useCallback } from "react";
import { User, Plus, X, Save, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiFetch, ApiError } from "@/lib/api";

interface Skill {
  id: number;
  name: string;
  category: string;
}

interface ProfileData {
  id: string;
  firstname: string | null;
  lastName: string | null;
  bio: string | null;
  skills: Skill[];
}

export default function FreelancerProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // States for Profile Form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);

  // States for Skill Typeahead
  const [skillQuery, setSkillQuery] = useState('');
  const [skillResults, setSkillResults] = useState<Skill[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('jwt_token');
      const userId = localStorage.getItem('user_id');

      if (!token || !userId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:8080/api/v1/profiles/freelancer/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data: ProfileData = await res.json();
          setProfile(data);
          setFirstName(data.firstname || '');
          setLastName(data.lastName || '');
          setBio(data.bio || '');
          setSelectedSkills(data.skills || []);
        }
      } catch (error) {
        console.error("Error fetching profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const searchSkills = async (query: string) => {
    if (!query.trim()) {
      setSkillResults([]);
      setShowDropdown(false);
      return;
    }

    try {
      const token = localStorage.getItem('jwt_token');
      const res = await fetch(`http://localhost:8080/api/v1/skills/search?query=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSkillResults(data);
        setShowDropdown(true);
      }
    } catch (error) {
      console.error("Error searching skills", error);
    }
  };

  const handleSkillQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSkillQuery(val);

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    
    searchDebounceRef.current = setTimeout(() => {
      searchSkills(val);
    }, 300);
  };

  const handleSelectSkill = (skill: Skill) => {
    if (!selectedSkills.find(s => s.id === skill.id)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
    setSkillQuery('');
    setShowDropdown(false);
  };

  const handleRemoveSkill = (skillId: number) => {
    setSelectedSkills(selectedSkills.filter(s => s.id !== skillId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const token = localStorage.getItem('jwt_token');
    const userId = localStorage.getItem('user_id');

    if (!token || !userId) {
      alert("No estás autenticado");
      setSaving(false);
      return;
    }

    try {
      const params = new URLSearchParams();
      if (firstName) params.append('firstName', firstName);
      if (lastName) params.append('lastName', lastName);
      if (bio) params.append('bio', bio);
      
      selectedSkills.forEach(s => params.append('skillIds', s.id.toString()));

      const res = await fetch(`http://localhost:8080/api/v1/profiles/freelancer/${userId}`, {
        method: 'PUT',
        body: params,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (res.ok) {
        alert("Perfil actualizado correctamente");
      } else {
        alert("Error al actualizar el perfil");
      }
    } catch (error) {
      console.error("Error saving profile", error);
      alert("Ocurrió un error al guardar");
interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  bio: string;
  skills: Skill[];
}

export default function PerfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [searchSkill, setSearchSkill] = useState("");

  const fetchProfile = useCallback(async () => {
    try {
      const data = await apiFetch("/freelancers/profile/me");
      setProfile(data);
      setFirstName(data.firstName || "");
      setLastName(data.lastName || "");
      setBio(data.bio || "");
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "Error al cargar el perfil");
    }
  }, []);

  const fetchSkills = useCallback(async () => {
    try {
      const data = await apiFetch("/marketplace/skills");
      setAvailableSkills(data);
    } catch {
      // silencioso — las skills disponibles no son críticas
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchProfile(), fetchSkills()])
      .finally(() => setLoading(false));
  }, [fetchProfile, fetchSkills]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const updated = await apiFetch("/freelancers/profile/me", {
        method: "PUT",
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          bio: bio.trim(),
          skillNames: profile?.skills.map((s) => s.name) || [],
        }),
      });
      setProfile(updated);
      setFirstName(updated.firstName || "");
      setLastName(updated.lastName || "");
      setBio(updated.bio || "");
      setSuccess("Perfil actualizado correctamente");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "Error al guardar el perfil");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">
        Cargando perfil...
  const handleAddSkill = async (skill: Skill) => {
    setError("");
    try {
      const updated = await apiFetch("/freelancers/profile/me/skills", {
        method: "POST",
        body: JSON.stringify({ skillNames: [skill.name] }),
      });
      setProfile(updated);
      setSuccess(`"${skill.name}" agregada correctamente`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "Error al agregar skill");
    }
  };

  const handleRemoveSkill = async (skill: Skill) => {
    setError("");
    try {
      const updated = await apiFetch(`/freelancers/profile/me/skills/${skill.id}`, {
        method: "DELETE",
      });
      setProfile(updated);
      setSuccess(`"${skill.name}" eliminada correctamente`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || "Error al eliminar skill");
    }
  };

  const profileSkills = profile?.skills || [];
  const profileSkillIds = new Set(profileSkills.map((s) => s.id));

  const filteredAvailable = availableSkills.filter(
    (s) =>
      !profileSkillIds.has(s.id) &&
      s.name.toLowerCase().includes(searchSkill.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-teal" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto animate-in fade-in duration-500 font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <User className="text-brand-purple" size={32} />
          Mi Perfil Profesional
        </h1>
        <p className="text-slate-600 mt-2">Gestiona tu información pública y las habilidades que te destacan.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4">Información Básica</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
              <input 
                type="text" 
                id="firstName" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple" 
                placeholder="Ej. Juan"
                required 
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-1">Apellido</label>
              <input 
                type="text" 
                id="lastName" 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple" 
                placeholder="Ej. Pérez"
                required 
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-1">Biografía (Acerca de ti)</label>
            <textarea 
              id="bio" 
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
              rows={4} 
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-purple focus:outline-none focus:ring-1 focus:ring-brand-purple resize-y" 
              placeholder="Cuéntanos sobre tu experiencia, enfoque y lo que te apasiona..."
              required 
            ></textarea>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <Code className="text-brand-teal" size={24} />
            <h2 className="text-xl font-semibold text-slate-800">Habilidades (Skills)</h2>
          </div>
          
          <p className="text-sm text-slate-600 mb-4 flex items-center gap-1">
            <AlertCircle size={16} /> 
            Estas habilidades permitirán que el sistema genere tus pruebas y descubra tu ruta de aprendizaje ideal.
          </p>

          <div className="relative mb-6">
            <label htmlFor="skillSearch" className="block text-sm font-medium text-slate-700 mb-1">Buscar y agregar habilidad</label>
            <input 
              type="text" 
              id="skillSearch" 
              value={skillQuery} 
              onChange={handleSkillQueryChange} 
              onFocus={() => { if(skillResults.length > 0) setShowDropdown(true); }}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal" 
              placeholder="Ej. React, Java, Marketing..."
              autoComplete="off"
            />
            
            {showDropdown && skillResults.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {skillResults.map(skill => (
                  <li 
                    key={skill.id}
                    onClick={() => handleSelectSkill(skill)}
                    className="px-4 py-2 hover:bg-slate-50 cursor-pointer flex justify-between items-center border-b border-slate-50 last:border-0"
                  >
                    <span className="font-medium text-slate-700">{skill.name}</span>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{skill.category}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3">Tus habilidades seleccionadas:</h3>
            {selectedSkills.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-500 italic text-center">
                Aún no has agregado ninguna habilidad. Busca arriba para agregar.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedSkills.map(skill => (
                  <span 
                    key={skill.id} 
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-light-teal text-brand-teal rounded-full text-sm font-medium shadow-sm"
                  >
                    {skill.name}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveSkill(skill.id)}
                      className="text-brand-teal hover:text-teal-900 focus:outline-none rounded-full p-0.5 hover:bg-brand-teal/20 transition-colors"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={saving}
            className="flex items-center gap-2 bg-brand-purple text-white px-8 py-3 rounded-xl font-semibold hover:bg-purple-800 transition-colors shadow-sm disabled:opacity-70"
          >
            {saving ? (
              <span>Guardando...</span>
            ) : (
              <>
                <Save size={20} />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-brand-dark">Mi Perfil</h1>
        <p className="text-sm text-slate-500">
          Configura tu perfil profesional y declara tus habilidades técnicas.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600 border border-red-100">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-2xl bg-green-50 p-4 text-sm font-semibold text-green-600 border border-green-100">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      <Card className="rounded-3xl border-slate-100 shadow-sm">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light-teal text-brand-teal">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-brand-dark">Información personal</h2>
              <p className="text-sm text-slate-400">
                Tu nombre y biografía serán visibles para las PYMEs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Nombre</label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Tu nombre"
                className="rounded-2xl border-slate-200 h-11"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600">Apellido</label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Tu apellido"
                className="rounded-2xl border-slate-200 h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">Biografía</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Cuéntale a las PYMEs sobre ti, tu experiencia y habilidades..."
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-light-teal resize-none"
            />
            <p className="text-xs text-slate-400">{bio.length}/2000 caracteres</p>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="rounded-2xl bg-brand-teal hover:bg-brand-teal/90 text-white font-bold px-6 h-11"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar cambios
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-slate-100 shadow-sm">
        <CardContent className="p-6 space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-brand-dark">Mis habilidades</h2>
            <p className="text-sm text-slate-400">
              Las habilidades declaradas determinan las evaluaciones disponibles.
            </p>
          </div>

          {profileSkills.length === 0 ? (
            <p className="text-sm text-slate-400 py-4">
              Aún no has declarado habilidades. Selecciona desde el catálogo de abajo.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profileSkills.map((skill) => (
                <span
                  key={skill.id}
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-light-teal px-4 py-2 text-sm font-semibold text-brand-teal"
                >
                  {skill.name}
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-1 rounded-full p-0.5 hover:bg-brand-teal/20 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-3xl border-slate-100 shadow-sm">
        <CardContent className="p-6 space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-brand-dark">Catálogo de habilidades</h2>
            <p className="text-sm text-slate-400">
              Agrega habilidades técnicas a tu perfil desde el catálogo del sistema.
            </p>
          </div>

          <Input
            value={searchSkill}
            onChange={(e) => setSearchSkill(e.target.value)}
            placeholder="Buscar habilidades..."
            className="rounded-2xl border-slate-200 h-11 max-w-sm"
          />

          {availableSkills.length === 0 ? (
            <p className="text-sm text-slate-400 py-4">Cargando catálogo...</p>
          ) : filteredAvailable.length === 0 ? (
            <p className="text-sm text-slate-400 py-4">
              {searchSkill
                ? `No se encontraron habilidades con "${searchSkill}"`
                : "Ya tienes todas las habilidades disponibles agregadas a tu perfil."}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {filteredAvailable.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 hover:border-brand-teal/30 hover:bg-brand-light-teal/30 transition-all"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-brand-dark">{skill.name}</p>
                    {skill.category && (
                      <p className="text-xs text-slate-400">{skill.category}</p>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleAddSkill(skill)}
                    className="h-8 w-8 rounded-full text-brand-teal hover:bg-brand-teal/10 hover:text-brand-teal"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
