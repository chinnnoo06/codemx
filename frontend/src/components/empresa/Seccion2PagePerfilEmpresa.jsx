import React, { useState } from 'react';
import '../../styles/empresa/miperfilpublicaciones.css';

export const Seccion2PagePerfilEmpresa = ({ publicaciones, manejarMostrarSeccion }) => {
  const [seccionActiva, setSeccionActiva] = useState('ver-publicaciones');

  
  return (
    <div className="contenedor"> 
      <div className="linea-separadora"></div>
      
      {/* Botones de navegación */}
      <div className="botones-seccion d-flex justify-content-center mb-4">
        <button
          className={`btn me-5 ${seccionActiva === 'ver-publicaciones' ? 'activo' : ''}`}
          onClick={() => setSeccionActiva('ver-publicaciones')}
        >
          <i className="fa-solid fa-th"></i> <span className='texto-boton'>PUBLICACIONES</span>
        </button>
        <button
          className={`btn ${seccionActiva === 'agregar-publicacion' ? 'activo' : ''}`}
          onClick={() => setSeccionActiva('ver-vacantes')}
        >
          <i className="fa-solid fa-briefcase"></i> <span className='texto-boton'>VACANTES</span>
        </button>
      </div>

      {/* Sección de publicaciones */}
      {seccionActiva === "ver-publicaciones" && (
        <>
          {publicaciones && publicaciones.length > 0 ? (
            <div className='contenedor-publicaciones'>
              {publicaciones.map((publicacion, index) => (
                <div key={index} className='item-publicacion' onClick={() => manejarMostrarSeccion(publicacion)}>
                  <img
                    src={`${publicacion.Img}?t=${new Date().getTime()}`}
                    alt={`Foto de la publicación ${index + 1}`}
                    className="img-publicacion"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className='contenedor-sin-publicaciones'>
              <div className='sin-publicaciones d-flex flex-column justify-content-center align-items-center'>
                <i className="fa-solid fa-camera icono-camara mb-3"></i>
                <h2 className="texto-no-publicaciones">Aún no hay publicaciones</h2>
              </div>
            </div>
          )}
        </>
      )}

      {/* Sección para agregar publicación */}
      {seccionActiva === "ver-vacantes" && (
       <div>
        <p>Hola</p>
        </div>
        )}
      </div>
  )
}
