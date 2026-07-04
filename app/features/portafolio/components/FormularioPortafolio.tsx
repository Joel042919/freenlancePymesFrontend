"use client";

import { useState } from "react";


const Formulario = () => {

    const [tecnologiaInput, setTecnologiaInput] = useState<string>('');
    const [tecnologiasUsadas, setTecnologiasUsadas] = useState<string[]>([]);
    
    const agregarTecnologia = ()=>{
        const nuevaTecnologia = tecnologiaInput.trim();
        if(nuevaTecnologia && !tecnologiasUsadas.includes(nuevaTecnologia)){
            setTecnologiasUsadas([...tecnologiasUsadas, nuevaTecnologia]);
            setTecnologiaInput('');
        }
    };

    const handleMouseClickChip = (e: React.MouseEvent<HTMLButtonElement>)=>{
        e.preventDefault();
        agregarTecnologia()
    }
    const handleKeyDownChip = (e: React.KeyboardEvent<HTMLInputElement>)=>{
        if(e.key==='Enter'){
            e.preventDefault();
            agregarTecnologia();
        }
    }

    const eliminarTecnologia = (tecAEliminar:string)=>{
        setTecnologiasUsadas(tecnologiasUsadas.filter(tec => tec !== tecAEliminar));
    }

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const imagenes = formData.getAll('imagenUrl') as File[];

        const datosParaEnviar = new FormData();

        datosParaEnviar.append('freelancerId','58db7173-f355-4440-b69b-b493467a379a')
        datosParaEnviar.append('title',formData.get('title') as string);
        datosParaEnviar.append('description',formData.get('description') as string);
        datosParaEnviar.append('projectUrl',formData.get('projectUrl') as string);

        //Adjuntamos la lista de archivos
        imagenes.forEach(img => datosParaEnviar.append('imagenes',img));

        tecnologiasUsadas.forEach(tec=> datosParaEnviar.append('tecnologiasUsadas',tec));

        //Aqui se hacia el fetch para el backend
        fetch('http://localhost:8080/api/portafolios/crear',{
            method:'POST',
            body:datosParaEnviar,
        })
    };


  return (
    <div>
        <h1>Crear tu portafolio</h1>
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="title">Titulo del proyecto</label>
                <input type="text" id="title" name="title" />
            </div>
            <div>
                <label htmlFor="description">Descripción del proyecto</label>
                <textarea id="description" name="description"></textarea>
            </div>
            <div>
                <label htmlFor="imagenUrl">Carga de Imagen del proyecto</label>
                <input type="file" multiple accept='.png,.jpg,.jpeg' name="imagenUrl" id="imagenUrl"/>
            </div>
            <div>
                <label htmlFor="projectUrl">Url del proyecto</label>
                <input type="text" id="projectUrl" name="projectUrl" />
            </div>
            <div>
                <label>Tecnologías utilizadas</label>
                <div>
                    <input type="text" value={tecnologiaInput} onChange={(e)=> setTecnologiaInput(e.target.value)} onKeyDown={handleKeyDownChip} placeholder="Ej: Spring Boot" />
                    <button type="button" onClick={handleMouseClickChip}>Añadir</button>
                </div>
                <div>
                    {
                        tecnologiasUsadas.map((tec,index)=>(
                            <span key={index}>
                                {tec}
                                <button type="button" onClick={()=>eliminarTecnologia(tec)}>&times;</button>
                            </span>
                        ))
                    }
                </div>
            </div>
            <div>
                <button type="submit">Guardar Proyecto</button>
            </div>
        </form>
    </div>
  )
}

export default Formulario