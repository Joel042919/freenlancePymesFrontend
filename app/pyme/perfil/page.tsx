import React from 'react'

interface EmpresaProp{
    nombre:string,
    descripcion:string,
    imagen:string,
    urlPaginaWeb:string,
    insignias:string[],
    isVerified:boolean,
    reviews:Review[]
}

interface Review{
    id:string,
    nombreUsuario:string,
    urlProfile:string,
    comentario:string,
    calificacion:number
}

const PerfilPyme = ({
    nombre = "Empresa de Prueba",
    descripcion = "Descripción de prueba",
    imagen = "",
    urlPaginaWeb = "#",
    insignias = [],
    isVerified = false,
    reviews = []
}:EmpresaProp) => {
  return (
    <div>
        <h1>Empresa {nombre}</h1>
        <p>{descripcion}</p>
        {imagen && <img src={imagen} alt={nombre} />}
        <a href={urlPaginaWeb} target="_blank" rel="noopener noreferrer">
            Visitar página web
        </a>
        <div>
            {insignias.map((insignia) => (
                <span key={insignia}>{insignia}</span>
            ))}
        </div>
        {isVerified && <p>Verificada</p>}
        <div>
            {reviews.map((review) => (
                <div key={review.id}>
                    <h3>{review.nombreUsuario}</h3>
                    <p>{review.comentario}</p>
                    <p>Calificación: {review.calificacion}/5</p>
                </div>
            ))}
        </div>
    </div>
  )
}

export default PerfilPyme