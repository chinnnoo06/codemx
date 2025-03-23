import React, { useState } from 'react';
import '../../styles/empresa/miperfilpublicaciones.css';

export const Seccion2PagePerfilEmpresa = ({ empresa, publicaciones, vacantes, manejarMostrarSeccion, manejarMostrarSeccionVacante }) => {
  const [seccionActiva, setSeccionActiva] = useState('ver-publicaciones');

   // Ordenar publicaciones de la más reciente a la más antigua
   const publicacionesOrdenadas = publicaciones
   ? [...publicaciones].sort((a, b) => new Date(b.Fecha_Publicacion) - new Date(a.Fecha_Publicacion))
   : [];

  
  return (
    <div className="contenedor contenedor-seccion2"> 
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
          className={`btn ${seccionActiva === 'ver-vacantes' ? 'activo' : ''}`}
          onClick={() => setSeccionActiva('ver-vacantes')}
        >
          <i className="fa-solid fa-briefcase"></i> <span className='texto-boton'>VACANTES</span>
        </button>
      </div>

      {/* Sección de publicaciones */}
      {seccionActiva === "ver-publicaciones" && (
        <>
          {publicacionesOrdenadas && publicacionesOrdenadas.length > 0 ? (
            <div className='contenedor-publicaciones'>
              {publicacionesOrdenadas.map((publicacion, index) => (
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
        <div className='contenedor-vacantes-empresa'>
            {vacantes && vacantes.length > 0 ? (
                <div className='contenedor-vacantes w-100 '>
                    {vacantes.map((vacante, index) => (
                        <div key={index} className='vacante d-flex align-items-center pt-3 pb-3' onClick={() => manejarMostrarSeccionVacante(vacante)}>
    
                            {/* Logo de la empresa */}
                            <div className='fila-foto'>
                                <img
                                    src={`${empresa.logo}?t=${new Date().getTime()}`}
                                    alt="Perfil"
                                    className="foto-perfil-empresa rounded-circle"
                                />
                            </div>
    
                            {/* Información de la vacante */}
                            <div className='fila-info'>
                                <div className='d-flex justify-content-between align-items-start '>
                                    <h4 className='titulo-vacante'>{vacante.Titulo}</h4>
    
                                    {/* Número de postulados (se acomoda según pantalla) */}
                                    <div className="postulados d-flex align-items-center">
                                        <i className="fa-solid fa-users text-muted me-2"></i>
                                        <span className="text-muted">{vacante.Cantidad_Postulados} postulados</span>
                                    </div>
                                </div>
                                
                                <h5 className='nombre-empresa'>{empresa.nombre}</h5>
                                
                                <div className='datos d-flex'>
                                    <span className='estado-vacante text-muted'>{vacante.Estado_Vacante}, México</span>
                                    <span className='direccion-vacante text-muted'>{vacante.Ubicacion}</span>
                                    <span className='modalidad-vacante text-muted'>({vacante.Modalidad_Vacante})</span>
                                </div>
                            </div>
    
                        </div>
                    ))}
                </div>
            ) : (
                <div className='contenedor-sin-vacantes'>
                    <div className='sin-vacantes d-flex flex-column justify-content-center align-items-center'>
                        <i className="fa-solid fa-briefcase icono-vacante mb-2"></i> 
                        <h2 className="texto-no-vacantes">Aún no hay vacantes</h2>
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  )
}
