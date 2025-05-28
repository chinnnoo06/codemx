import React, { useState } from 'react';
import '../../styles/admin/secciondenuncias.css';

export const Seccion2PageDenunciaAdmin = ({ solicitudes, actualizarFetch }) => {
    const [isLoading, setIsLoading] = useState(false);

    const renderStars = (rating) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(
                <i
                    key={i}
                    className={`fa fa-star ${i < rating ? 'text-warning' : 'text-muted'}`}
                    aria-hidden="true"
                ></i>
            );
        }
        return stars;
    };

    const cambiarEstatus = async (idSolicitud, idCalificacion, estado) => {
      if (isLoading) return;
      setIsLoading(true);
      try {
          const response = await fetch("https://www.codemx.net/codemx/backend/admin/verificar_calificacion.php", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idSolicitud,
            idCalificacion,
            estado
          }),
          });

          const result = await response.json();

          if (result.success) {
            alert('Solicitud Actualizada');
            actualizarFetch();
          } else {
          console.error("Error al cambiar estado:", result.error);
          }
      } catch (error) {
          console.error("Error en la petición:", error);
      } finally {
          setIsLoading(false);
      }
    };

  return (
    <>
      {solicitudes && solicitudes.length > 0 ? (
        <div className='contenedor-denuncias w-100'>
          {solicitudes.map((solicitud, index) => (
            <div key={index} className="denuncia-card p-2 mb-4 rounded shadow-sm">

               {/* Encabezado con información básica */}
              <div className="denuncia-header d-flex align-items-center mb-3">
                <div>
                  <span className="text-muted fecha-denuncia small">
                    {solicitud.Fecha_Creacion ? new Date(solicitud.Fecha_Creacion).toLocaleDateString('es-MX', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Fecha no disponible'}
                  </span>
                </div>
              </div>

            {/* Cuerpo de la denuncia */}
              <div className="denuncia-body row">
                {/* Sección de usuarios involucrados */}
                <div className="col-md-4 mb-3 mb-md-0 col-1">
                  <div className="card h-100">
                    <div className="card-body">
                      <h6 className="card-title text-uppercase text-muted small mb-3">Usuarios involucrados</h6>
                      
                      <div className="d-flex align-items-center mb-3">
                        <div className="con-foto me-3">
                            <img 
                              src={solicitud.Candidato_Foto} 
                              alt={`${solicitud.Candidato_Nombre || ''} ${solicitud.Candidato_Apellido|| ''}`} 
                              className="rounded-circle img-denuncias" 
                            />
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="subtitulo-denuncia mb-0">Candidato</h6>
                          <p className="text-muted small mb-0">
                            {solicitud.Candidato_Nombre || 'Nombre no disponible'} {solicitud.Candidato_Apellido|| ''}
                          </p>
                        </div>
                      </div>
                      
                      <div className="d-flex align-items-center">
                        <div className="con-foto me-3">
                            <img 
                              src={solicitud.Empresa_Foto} 
                              alt={`${solicitud.Empresa_Nombre  || ''}`} 
                              className="rounded-circle img-denuncias" 
                            />
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="subtitulo-denuncia mb-0">Empresa</h6>
                          <p className="text-muted small mb-0">
                            {solicitud.Empresa_Nombre} 
                          </p>
                        </div>
                      </div>

                      {/* Sección de descripción mejorada */}
                    
                        <div className="mt-4">
                            <h6 className="card-title text-uppercase text-muted small mb-2">Descripción de la solicitud</h6>
                            <div className="descripcion-denuncia p-3 bg-light rounded">
                            <p className="parrafo-denuncia mb-0">{solicitud.Motivo}</p>
                            </div>
                        </div>
                 
                    </div>

                  </div>
                </div>

              
                {/* Sección del contenido denunciado */}
                <div className="col-lg-8 col-12">
                    <div className="card h-100">
                        <div className="card-body">
                        <h6 className="card-title text-uppercase text-muted small mb-3">Contenido a revisar</h6>
                        
                        <div className="contenido-denunciado p-3 bg-light rounded">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span className="subtitulo-denuncia">Calificación</span>
                                <small className="text-muted contenido-usuario">
                                {solicitud.Fecha_Calificacion ? new Date(solicitud.Fecha_Calificacion).toLocaleString('es-MX') : 'Fecha no disponible'}
                                </small>
                            </div>
                            <p className="mb-0">{solicitud.Comentario}</p>
                            <div className="stars">{renderStars(solicitud.Calificacion)}</div>
                            <div className="mt-2 text-end">
                                <small className="text-muted contenido-usuario">
                                Publicado por: {solicitud.Empresa_Nombre || 'Usuario desconocido'}
                                </small>
                            </div>
                        </div>
    
                        </div>
                    </div>
                </div>

                {/* Pie de la denuncia con acciones */}
                <div className="denuncia-footer mt-3 d-flex justify-content-end">
                  <button
                    className="btn btn-sm btn-tipodos me-2"
                    disabled={isLoading}
                    onClick={() =>
                      cambiarEstatus(
                        solicitud.ID,
                        solicitud.Calificacion_ID,
                        1
                      )
                    }
                  >
                    {isLoading ? (
                      <>Cargando...</>
                    ) : (
                      <>
                        <i className="fa-solid fa-check me-1"></i> Aceptar
                      </>
                    )}
                  </button>

                  <button
                    className="btn btn-sm btn-tipouno"
                    disabled={isLoading}
                    onClick={() =>
                      cambiarEstatus(
                        solicitud.ID,
                        solicitud.Calificacion_ID,
                        0
                      )
                    }
                  >
                    {isLoading ? (
                      <>Cargando...</>
                    ) : (
                      <>
                        <i className="fa-solid fa-ban me-1"></i> Rechazar
                      </>
                    )}
                  </button>
                </div>
             
              
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='contenedor-sin-denuncias pt-5'>
          <div className='sin-denuncias d-flex flex-column justify-content-center align-items-center'>
            <i className="fa-solid fa-flag icono-no-denuncias mb-3"></i>
            <h2 className="texto-no-denuncias mb-2">No hay solicitudes pendientes</h2>

          </div>
        </div>
      )}
    </>
  );
}