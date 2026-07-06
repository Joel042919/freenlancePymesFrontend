"use client";

import React, { useState, useEffect } from 'react';

export default function PerfilPyme() {
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem('user_id');
    setUserId(id);
    if (id) {
      fetchProfile(id);
    }
  }, []);

  const fetchProfile = async (id: string) => {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:8080/api/pyme/profile/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setCompanyName(data.companyName || '');
        setIndustry(data.industry || '');
      }
    } catch (error) {
      console.error("Error fetching PYME profile", error);
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    const token = localStorage.getItem('jwt_token');
    if (!token) return;

    setIsSaving(true);
    try {
      const res = await fetch(`http://localhost:8080/api/pyme/profile/${userId}?companyName=${encodeURIComponent(companyName)}&industry=${encodeURIComponent(industry)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8 font-sans">
      <h1 className="text-3xl font-bold text-slate-800 mb-8">Perfil de PYME</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        {!isEditing ? (
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{profile?.companyName || "Empresa Sin Nombre"}</h2>
                <p className="text-brand-teal font-medium mt-1">{profile?.industry || "Industria No Especificada"}</p>
              </div>
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md font-medium hover:bg-slate-200 transition-colors">
                Editar Perfil
              </button>
            </div>
            
            <div className="flex items-center gap-2 mt-4">
              {profile?.verificationBadge && (
                <span className="px-3 py-1 bg-brand-light-teal text-brand-teal text-sm font-semibold rounded-full flex items-center gap-1">
                  ✓ Verificada
                </span>
              )}
            </div>

            <div className="mt-8 border-t border-slate-100 pt-6">
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Reputación</h3>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-brand-purple">{profile?.reputationScore ? profile.reputationScore.toFixed(1) : "N/A"}</span>
                <span className="text-slate-500 text-sm">Puntos de reputación basados en proyectos anteriores.</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la Empresa</label>
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Industria</label>
              <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal" />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md font-medium hover:bg-slate-200 transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-brand-teal text-white rounded-md font-medium hover:bg-teal-700 transition-colors">
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}