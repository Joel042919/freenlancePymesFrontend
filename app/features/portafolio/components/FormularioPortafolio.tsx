"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface PortfolioData {
  id: string;
  title: string;
  description: string;
  projectUrl?: string;
  tecnologiasUsadas: string[];
  imageUrl: string[];
}

interface FormularioProps {
  initialData?: PortfolioData | null;
}

const FormularioPortafolio = ({ initialData }: FormularioProps) => {
  const router = useRouter();
  const [tecnologiaInput, setTecnologiaInput] = useState<string>('');
  const [tecnologiasUsadas, setTecnologiasUsadas] = useState<string[]>(initialData?.tecnologiasUsadas || []);
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.imageUrl || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const agregarTecnologia = () => {
    const nuevaTecnologia = tecnologiaInput.trim();
    if (nuevaTecnologia && !tecnologiasUsadas.includes(nuevaTecnologia)) {
      setTecnologiasUsadas([...tecnologiasUsadas, nuevaTecnologia]);
      setTecnologiaInput('');
    }
  };

  const handleMouseClickChip = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    agregarTecnologia();
  };

  const handleKeyDownChip = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      agregarTecnologia();
    }
  };

  const eliminarTecnologia = (tecAEliminar: string) => {
    setTecnologiasUsadas(tecnologiasUsadas.filter(tec => tec !== tecAEliminar));
  };

  const eliminarImagenExistente = async (imageUrl: string) => {
    if (!initialData) return;
    const token = localStorage.getItem('jwt_token');
    try {
      const res = await fetch(`http://localhost:8080/api/portafolios/${initialData.id}/image?imageUrl=${encodeURIComponent(imageUrl)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setExistingImages(existingImages.filter(img => img !== imageUrl));
      }
    } catch (error) {
      console.error("Error eliminando imagen", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const imagenes = formData.getAll('imagenUrl') as File[];
    const userId = localStorage.getItem('user_id');
    const token = localStorage.getItem('jwt_token');

    if (!userId) {
      alert("Error: Usuario no autenticado (no se encontró userId)");
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Upload files to Cloudflare R2 using Presigned URLs
      const uploadedUrls: string[] = [];
      
      for (const file of imagenes) {
        if (file.size === 0) continue; // Skip empty file inputs

        // Get Presigned URL
        const presignRes = await fetch(`http://localhost:8080/api/portafolios/presigned-url?fileName=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!presignRes.ok) {
          const errText = await presignRes.text();
          console.log("No se pudo obtener la URL firmada: " + errText);
          throw new Error("No se pudo obtener la URL firmada: " + errText);
        }
        
        const { presignedUrl, publicUrl } = await presignRes.json();
        
        // Upload directly to R2
        const uploadRes = await fetch(presignedUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type
          }
        });

        if (!uploadRes.ok) throw new Error("Fallo la subida a Cloudflare R2");

        uploadedUrls.push(publicUrl);
      }

      // 2. Prepare final data for backend
      const datosParaEnviar = new FormData();
      datosParaEnviar.append('freelancerId', userId);
      datosParaEnviar.append('title', formData.get('title') as string);
      datosParaEnviar.append('description', formData.get('description') as string);
      datosParaEnviar.append('projectUrl', formData.get('projectUrl') as string);

      // Enviar cada URL final al backend
      for (const url of uploadedUrls) {
        datosParaEnviar.append('imagenes', url); // Backend ahora espera List<String>
      }

      tecnologiasUsadas.forEach(tec => datosParaEnviar.append('tecnologiasUsadas', tec));

      const url = initialData 
        ? `http://localhost:8080/api/portafolios/${initialData.id}` 
        : `http://localhost:8080/api/portafolios/crear`;
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: datosParaEnviar,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        router.push('/freelancer/portafolio');
        router.refresh();
      } else {
        alert("Error al guardar el portafolio.");
      }
    } catch (error) {
      console.error("Error submitting form", error);
      alert("Error: " + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 pb-20">
      <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-100 max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-brand-dark mb-8">
          {initialData ? 'Editar Proyecto' : 'Crear Proyecto de Portafolio'}
        </h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm font-bold text-slate-700 mb-2">Título del proyecto</label>
          <input type="text" id="title" name="title" defaultValue={initialData?.title} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-light-teal transition-all" required />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-bold text-slate-700 mb-2">Descripción del proyecto</label>
          <textarea id="description" name="description" defaultValue={initialData?.description} rows={4} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-light-teal transition-all" required></textarea>
        </div>
        
        {existingImages.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Imágenes Actuales</label>
            <div className="flex flex-wrap gap-4">
              {existingImages.map((img, index) => (
                <div key={index} className="relative group rounded-md overflow-hidden border border-slate-200">
                  <img src={img} alt="Proyecto" className="w-24 h-24 object-cover" />
                  <button type="button" onClick={() => eliminarImagenExistente(img)} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label htmlFor="imagenUrl" className="block text-sm font-bold text-slate-700 mb-2">Cargar Nuevas Imágenes</label>
          <input type="file" multiple accept='.png,.jpg,.jpeg' name="imagenUrl" id="imagenUrl" className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-brand-light-teal file:text-brand-teal hover:file:bg-teal-100 transition-colors" />
        </div>
        <div>
          <label htmlFor="projectUrl" className="block text-sm font-bold text-slate-700 mb-2">Url del proyecto (Opcional)</label>
          <input type="text" id="projectUrl" name="projectUrl" defaultValue={initialData?.projectUrl} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-light-teal transition-all" />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Tecnologías utilizadas</label>
          <div className="flex gap-3 mb-4">
            <input type="text" value={tecnologiaInput} onChange={(e) => setTecnologiaInput(e.target.value)} onKeyDown={handleKeyDownChip} placeholder="Ej: React" className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-light-teal transition-all" />
            <button type="button" onClick={handleMouseClickChip} className="px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200 text-sm font-bold transition-colors">Añadir</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {tecnologiasUsadas.map((tec, index) => (
              <span key={index} className="inline-flex items-center gap-2 px-4 py-2 bg-brand-light-teal text-brand-teal font-bold rounded-full text-sm">
                {tec}
                <button type="button" onClick={() => eliminarTecnologia(tec)} className="text-brand-teal hover:text-teal-900 font-extrabold">&times;</button>
              </span>
            ))}
          </div>
        </div>
        <div className="pt-6">
          <button type="submit" disabled={isSubmitting} className="w-full py-4 px-6 bg-brand-teal text-white rounded-2xl font-bold hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-brand-light-teal disabled:opacity-50 transition-all text-lg shadow-sm">
            {isSubmitting ? 'Guardando...' : (initialData ? 'Actualizar Proyecto' : 'Guardar Proyecto')}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
};

export default FormularioPortafolio;