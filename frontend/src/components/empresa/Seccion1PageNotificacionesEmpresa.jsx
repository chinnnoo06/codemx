import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Seccion1PageNotificacionesEmpresa = ({ notificaciones, fetchData, todasLeidas }) => {
    const [showModalOpciones, setShowModalOpciones] = useState(false);
    const [idNotificacion, setIdNotificacion] = useState(null);
    const navigate = useNavigate();

  const obtenerIcono = (tipo) => {
    switch (tipo) {
      case 'vacante_inactiva':
        return <i className="fa-solid fa-ban icono-notificacion"></i>;
      case 'mensaje':
        return <i className="fa-solid fa-message icono-notificacion"></i>;
      case 'strike':
        return <i className="fa-solid fa-triangle-exclamation icono-notificacion"></i>;
      case 'reaccion':
        return <i className="fa-solid fa-face-smile icono-notificacion"></i>;
      case 'postulacion_nueva':
        return <i className="fa-solid fa-user-plus icono-notificacion"></i>;
      case 'eliminacion_contenido':
        return <i className="fa-solid fa-user-slash icono-notificacion"></i>; 
      default:
        return <i className="fa-solid fa-bell icono-notificacion"></i>;
    }
  };

  const manejarShowModalOpciones = (idNotificacion) => {
    setIdNotificacion(idNotificacion);
    setShowModalOpciones(true);
};

      
  const manejarLeido = async (idNotificacion, leidoActual) => {
    try {
      const response = await fetch("https://www.codemx.net/codemx/backend/config/manejar_leido_notificacion.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idNotificacion,
          leido: leidoActual === '1' ? '0' : '1' // alternar el estado
        }),
      });
  
      const result = await response.json();
  
      if (result.success) {
        fetchData();
      } else {
        console.error("Error al actualizar notificación:", result.message);
      }
    } catch (error) {
      console.error("Error en la petición:", error);
    }
  };

  const eliminar_notificacion = async () => {
    try {
      const response = await fetch("https://www.codemx.net/codemx/backend/config/eliminar_notificacion.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idNotificacion}),
      });
  
      const result = await response.json();
  
      if (result.success) {
        fetchData();
        setShowModalOpciones(false);
      } else {
        console.error("Error al actualizar notificación:", result.message);
        setShowModalOpciones(false);
      }
    } catch (error) {
      console.error("Error en la petición:", error);
      setShowModalOpciones(false);
    }
  };

  return (
    <>
      {notificaciones && notificaciones.length > 0 ? (
        <div className='contenedor-notificicaciones w-100'>
          {notificaciones.map((notificacion, index) => (
            <div key={index} className="notificacion d-flex justify-content-between align-items-center pt-3 pb-3 position-relative">
                {/* Ícono + descripción */}
                <div className="d-flex align-items-center flex-grow-1">
                    <div className="fila-img me-3 d-flex align-items-center">
                        {obtenerIcono(notificacion.Tipo_Evento)}
                    </div>
                    <div className="fila-info">
                        <div className='contenedor-descripcion'>
                            {['strike'].includes(notificacion.Tipo_Evento) ? (
                                <span
                                    className={`texto-descripcion-link ${notificacion.Leida !== '1' ? 'noti-noleida' : ''}`}
                                    onClick={() => {
                                    navigate('/usuario-empresa/inicio-empresa');
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {notificacion.Descripcion}
                                </span>
                            ) : notificacion.Tipo_Evento === 'vacante_inactiva' ? (
                                <span
                                    className={`texto-descripcion-link ${notificacion.Leida !== '1' ? 'noti-noleida' : ''}`}
                                    onClick={() => {
                                      navigate('/usuario-empresa/vacantes-empresa', {
                                        state: {
                                          seccionActiva: 'detalles-vacante',
                                          idVacante: notificacion.Vacante_ID
                                        }
                                      });
                                    }}                                    
                                    style={{ cursor: 'pointer' }}
                                >
                                    {notificacion.Descripcion}
                                </span>
                            ) : notificacion.Tipo_Evento === 'mensaje' ? (
                                <span
                                    className={`texto-descripcion-link ${notificacion.Leida !== '1' ? 'noti-noleida' : ''}`}
                                    onClick={() => {
                                    navigate('/usuario-empresa/chats-empresa', {
                                        state: {
                                        chatId: notificacion.Chat_ID
                                        }
                                    });
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {notificacion.Descripcion}
                                </span>
                            ) : notificacion.Tipo_Evento === 'reaccion' ?(
                                <span
                                  className={`texto-descripcion-link ${notificacion.Leida !== '1' ? 'noti-noleida' : ''}`}
                                  onClick={() => {
                                    navigate('/usuario-empresa/inicio-empresa', {
                                      state: {
                                        seccionActiva: 'publicacion',
                                        idPublicacion: notificacion.Publicacion_ID
                                      }
                                    });
                                  }}
                                  style={{ cursor: 'pointer' }}
                                >
                                  {notificacion.Descripcion}
                              </span>
                            ): notificacion.Tipo_Evento === 'postulacion_nueva' ? (
                              <span
                                className={`texto-descripcion-link ${notificacion.Leida !== '1' ? 'noti-noleida' : ''}`}
                                onClick={() => {
                                  navigate('/usuario-empresa/vacantes-empresa', {
                                    state: {
                                      seccionActiva: 'detalles-vacante',
                                      idVacante: notificacion.Vacante_ID
                                    }
                                  });
                                }}   
                                style={{ cursor: 'pointer' }}
                              >
                                {notificacion.Descripcion}
                            </span>
                            ) : notificacion.Tipo_Evento === 'eliminacion_contenido' && (
                              <span
                                className={`texto-descripcion-link ${notificacion.Leida !== '1' ? 'noti-noleida' : ''}`}
                                onClick={() => {
                                  navigate('/usuario-empresa/inicio-empresa');
                                }}
                                style={{ cursor: 'pointer' }}
                              >
                                {notificacion.Descripcion}
                              </span>
                            )}

                        </div>

                        <span className="fecha-notificacion">{new Date(notificacion.Fecha_Creacion).toLocaleString()}</span>
                    </div>
                </div>

                {/* Acciones laterales (alineadas al centro vertical) */}
                <div className="acciones-laterales d-flex flex-column align-items-center justify-content-center ms-3">
                    <i className="fa-solid fa-ellipsis icono-opciones-notificaciones" onClick={() => manejarShowModalOpciones(notificacion.ID)}></i>
                    <input
                        type="checkbox"
                        className="checkbox-personalizado mb-2"
                        title="Marcar como leída"
                        checked={todasLeidas || notificacion.Leida === '1'}
                        readOnly
                        onChange={() => manejarLeido(notificacion.ID, notificacion.Leida)}
                    />

                </div>
            </div>

          ))}
        </div>
      ) : (
        <div className='contenedor-sin-notificaciones pt-5'>
          <div className='sin-notificaciones d-flex flex-column justify-content-center align-items-center'>
            <i className="fa-solid fa-briefcase icono-no-notificacion mb-2"></i>
            <h2 className="texto-no-notificaciones">No tienes notificaciones</h2>
          </div>
        </div>
      )}

        {/*Modal opciones*/}
        {showModalOpciones && (
            <div className="modal-overlay-opciones" onClick={() => setShowModalOpciones(false)}>
                <div className="modal-content-opciones" onClick={(e) => e.stopPropagation()}>
                    <div className="botones d-flex flex-column align-items-center">
                        <button className="btn-opciones btn-eliminar" onClick={() => eliminar_notificacion()}>
                            Eliminar
                        </button>
                        <div className="divider"></div> 
                        <button className="btn-opciones" onClick={() => setShowModalOpciones(false)}>
                            Cancelar
                        </button>
                
    
                    </div>
                </div>
            </div>
        )}
    </>
  );
};
