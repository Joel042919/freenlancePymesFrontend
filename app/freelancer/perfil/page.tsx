"use client";

import React, { useState, useEffect, useRef } from 'react';
import { User, Save, Code, AlertCircle } from 'lucide-react';

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
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-500">
        Cargando perfil...
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
    </div>
  );
}
