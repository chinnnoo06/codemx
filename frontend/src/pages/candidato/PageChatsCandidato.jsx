import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import LoadingSpinner from '../../components/LoadingSpinner';
import { SeccionListaChats } from '../../components/candidato/SeccionListaChats';
import '../../styles/seccionchats.css';
import { SeccionChatsMensajes } from '../../components/candidato/SeccionChatsMensajes';

export const PageChatsCandidato = ({ candidato }) => {

    const [chats, setChats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingOpciones, setIsLoadingOpciones] = useState(false);
    const [seccionActiva, setSeccionActiva] = useState("pantalla-grande");
    const [seccionActivaPequenia, setSeccionActivaPequenia] = useState("lista-chats");
    const [chatActivo, setChatActivo] = useState(null);
    const [query, setQuery] = useState('');
    const [showModalOpcionesAutor, setShowModalOpcionesAutor] = useState(false);
    const [showModalOpcionesNoAutor, setShowModalOpcionesNoAutor] = useState(false);
    const [showModalConfirmacion, setShowModalConfirmacion] = useState(false);
    const [showModalDenuncia, setShowModalDenuncia] = useState(false);
    const [pasoReporte, setPasoReporte] = useState(1); // 1: Selección, 2: Descripción
    const [motivoSeleccionado, setMotivoSeleccionado] = useState("");
    const [descripcionReporte, setDescripcionReporte] = useState("");
    const [mensajeSeleccionado, setMensajeSeleccionado] = useState(null);
    const [empresaDelMensaje, setEmpresaDelMensaje] = useState(null);
    const navigate = useNavigate(); 

    // Función para obtener datos del backend
    const fetchData = useCallback(async () => {
        try {
            const Response = await fetch('https://www.codemx.net/codemx/backend/candidato/obtener_chats_candidato.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idCandidato: candidato.id }),
            });

            if (!Response.ok) {
                const errorData = await Response.json();
                throw new Error(errorData.error || 'Error desconocido');
            }
            const chatsData = await Response.json();

            // Actualizar estados
            setChats(chatsData.chats);
            setIsLoading(false);
        } catch (error) {
            console.error('Error al obtener los datos de vacantes:', error);
            setIsLoading(false);
        }
    }, [candidato.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        fetchData(); // carga inicial
    
        const interval = setInterval(() => {
            fetchData(); // actualiza lista de chats
        }, 2000); 
    
        return () => clearInterval(interval); 
    }, [fetchData]);


    useEffect(() => {
        const manejarCambioPantalla = () => {
          const ancho = window.innerWidth;
          if (ancho < 1000) {
            setSeccionActiva("pantalla-pequenia");
            setSeccionActivaPequenia("lista-chats"); // mostrará solo la lista al inicio
          } else {
            setSeccionActiva("pantalla-grande");
          }
        };
      
        manejarCambioPantalla();
        window.addEventListener("resize", manejarCambioPantalla);
      
        return () => window.removeEventListener("resize", manejarCambioPantalla);
      }, []);
      
      
    

    // Función para filtrar chats por la barra de búsqueda
    const buscar = (searchQuery) => {
        setQuery(searchQuery);
    };

    // Cuando se hace clic en un chat, actualizar el chat activo
    const seleccionarChat = (chat) => {
        setChatActivo(chat);
        if (window.innerWidth < 1000) {
            setSeccionActivaPequenia("conversacion-chat");
        }
    };

    
    const irAlPerfilEmpresa = (idEmpresaPerfil) => {
        navigate(`/usuario-candidato/perfil-empresa`, { 
            state: { idEmpresa: idEmpresaPerfil}
        });
    };

    if (isLoading) {
        return <LoadingSpinner></LoadingSpinner>;
    } 

    const manejarShowModalConfirmacion = () => {
        setShowModalConfirmacion(true);
        setShowModalOpcionesAutor(false);
    };

    const manejarCloseModalConfirmacion = () => {
        setShowModalConfirmacion(false);
        setShowModalOpcionesAutor(true);
    };

    
    const eliminarMensaje = async () => {
        if (isLoadingOpciones) return;
        setIsLoadingOpciones(true);
        try {
            const response = await fetch("https://www.codemx.net/codemx/backend/config/eliminar_mensaje.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ idMensaje: mensajeSeleccionado }),
            });
    
            const result = await response.json();
    
            if (result.success) {
                fetchData();
                manejarCloseModalConfirmacion();
                setShowModalOpcionesAutor(false);
            } else {
                console.error("Error al eliminar publicacion:", result.message);
            }
        } catch (error) {
            console.error("Error en la petición:", error);
        }finally {
            setIsLoadingOpciones(false);
        }

    };

    const manejarShowModalDenuncia = () => {
        setShowModalDenuncia(true);
        setPasoReporte(1);
        setMotivoSeleccionado("");
        setDescripcionReporte("");
    };

    const manejarCloseModalDenuncia = async () => {
        setShowModalDenuncia(false);
    };

    const manejarSeleccionReporte = (motivo) => {
        setMotivoSeleccionado(motivo);
        setPasoReporte(2);
    };

    const enviarReporte = async () => {
        if (isLoadingOpciones) return;
        setIsLoadingOpciones(true);

        try {
            const response = await fetch("https://www.codemx.net/codemx/backend/candidato/denuncia_candidato_empresa.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    motivo: motivoSeleccionado,
                    descripcion: descripcionReporte,
                    idMensaje: mensajeSeleccionado,
                    idDenunciante: candidato.id, 
                    idDenunciado: empresaDelMensaje,
                }),
            });

            const result = await response.json();
            if (result.success) {
                alert("Reporte enviado correctamente.");
                manejarCloseModalDenuncia();
            } else {
                console.error("Error al enviar reporte:", result.error);
                alert(`Error al enviar reporte: ${result.error || "Error desconocido"}`);
            }
        } catch (error) {
            console.error("Error al enviar reporte:", error);
        } finally {
            setIsLoadingOpciones(false);
        }
    };

    return (
        <div className='contenedor-seccion-chats w-100 py-4'>
            {seccionActiva === "pantalla-grande" && (
                <div className="container-fluid px-0">
                    <div className="row g-0">
                        {/* Columna izquierda: barra de búsqueda + lista de chats */}
                        <div className=" col-chats col-md-4 border-end" >
                            <div className='header d-flex flex-column w-100 '>
                                <h2 className='titulo-seccion'>Tus Conversaciones</h2>
                                {/* Barra de búsqueda */}
                                <div className="input-group mb-3 position-relative barra-busqueda">
                                    <span className="search-icon position-absolute top-50 start-0 translate-middle-y ms-2 text-muted">
                                        <i className="fa fa-search"></i>
                                    </span>
                                    <input
                                        type="text"
                                        name="query"
                                        placeholder="Buscar Chat"
                                        className="form-control rounded input-busqueda"
                                        value={query}
                                        onChange={(e) => buscar(e.target.value)}
                                    />
                                </div>
                            </div>
                            <SeccionListaChats
                                chats={chats}
                                setChatActivo={seleccionarChat}
                                query={query}
                                irAlPerfilEmpresa={irAlPerfilEmpresa}
                            />
                        </div>

                        {/* Columna derecha: ventana del chat activo */}
                        <div className="col-md-8 ">
                            <SeccionChatsMensajes 
                                chat={chatActivo} 
                                irAlPerfilEmpresa={irAlPerfilEmpresa}
                                onMostrarOpcionesAutor={(idMensaje) => {
                                    setMensajeSeleccionado(idMensaje);
                                    setShowModalOpcionesAutor(true);
                                }}
                                onMostrarOpcionesNoAutor={(idMensaje, idEmpresa) => {
                                    setMensajeSeleccionado(idMensaje);
                                    setEmpresaDelMensaje(idEmpresa);
                                    setShowModalOpcionesNoAutor(true);
                                }}
                            />
                        </div>

                    </div>
                </div>
            )}

            {seccionActiva === "pantalla-pequenia" && (
                <>
                    {seccionActivaPequenia === "lista-chats" && (
                          <div className=" col-chats col-md-4" >
                            <div className='header d-flex flex-column w-100 '>
                                <h2 className='titulo-seccion'>Tus Conversaciones</h2>
                                {/* Barra de búsqueda */}
                                <div className="input-group mb-3 position-relative barra-busqueda">
                                    <span className="search-icon position-absolute top-50 start-0 translate-middle-y ms-2 text-muted">
                                        <i className="fa fa-search"></i>
                                    </span>
                                    <input
                                        type="text"
                                        name="query"
                                        placeholder="Buscar Chat"
                                        className="form-control rounded input-busqueda"
                                        value={query}
                                        onChange={(e) => buscar(e.target.value)}
                                    />
                                </div>
                            </div>
                            <SeccionListaChats
                                chats={chats}
                                setChatActivo={seleccionarChat}
                                query={query}
                                irAlPerfilEmpresa={irAlPerfilEmpresa}
                            />
                        </div>
                    )}

                    {seccionActivaPequenia === "conversacion-chat" && (
                        <div className='contenedor-chat-responsive'>
                         <button className="btn-volver-publicaciones d-flex align-items-center mb-4" onClick={() => setSeccionActivaPequenia("lista-chats")} >
                            <i className="fa-solid fa-arrow-left me-2"></i> Volver a lista de chats
                        </button>
                            <SeccionChatsMensajes 
                                chat={chatActivo} 
                                irAlPerfilEmpresa={irAlPerfilEmpresa}
                                onMostrarOpcionesAutor={(idMensaje) => {
                                    setMensajeSeleccionado(idMensaje);
                                    setShowModalOpcionesAutor(true);
                                }}
                                onMostrarOpcionesNoAutor={(idMensaje, idEmpresa) => {
                                    setMensajeSeleccionado(idMensaje);
                                    setEmpresaDelMensaje(idEmpresa);
                                    setShowModalOpcionesNoAutor(true);
                                }}
                            />
                        </div>
                    )}
                </>
            )}

            
            {/*Modal opciones*/}
            {showModalOpcionesAutor && (
                <div className="modal-overlay-opciones" onClick={() => setShowModalOpcionesAutor(false)}>
                    <div className="modal-content-opciones" onClick={(e) => e.stopPropagation()}>
                        <div className="botones d-flex flex-column align-items-center">
        
                            <button className="btn-opciones btn-eliminar" onClick={() => manejarShowModalConfirmacion()}>
                                Eliminar
                            </button>
                            <div className="divider"></div> 
                            <button className="btn-opciones" onClick={() => setShowModalOpcionesAutor(false)}>
                                Cancelar
                            </button>
                    
        
                        </div>
                    </div>
                </div>
            )}

                        
            {/*Modal opciones*/}
            {showModalOpcionesNoAutor && (
                <div className="modal-overlay-opciones" onClick={() => setShowModalOpcionesNoAutor(false)}>
                    <div className="modal-content-opciones" onClick={(e) => e.stopPropagation()}>
                        <div className="botones d-flex flex-column align-items-center">
        
                            <button className="btn-opciones btn-eliminar" onClick={() => manejarShowModalDenuncia()}>
                                Reportar
                            </button>
                            <div className="divider"></div> 
                            <button className="btn-opciones" onClick={() => setShowModalOpcionesNoAutor(false)}>
                                Cancelar
                            </button>
                    
        
                        </div>
                    </div>
                </div>
            )}

            {/*Modal Confirmacion*/}
            {showModalConfirmacion && (
                <div className="modal-overlay-confirmacion" onClick={() => manejarCloseModalConfirmacion()}>
                    <div className="modal-content-confirmacion" onClick={(e) => e.stopPropagation()}>
            
                        <p>¿Seguro que quieres eliminar el comentario?</p>

                        <div className="d-flex justify-content-between mt-3">
                        <button
                            className="btn btn-tipodos btn-sm"
                            onClick={() => manejarCloseModalConfirmacion()}
                        >
                            Cancelar
                        </button>
                        <button
                            className="btn btn-danger btn-sm"
                        onClick={() => eliminarMensaje()}
                        >
                                {isLoadingOpciones ? 'Cargando...' : 'Confirmar'}
                        </button>
                        </div>
                    </div>
                </div>
            )}

            
        <div className='modal-reportar'>
          {showModalDenuncia && (
              <div className="modal-overlay-reportar" onClick={manejarCloseModalDenuncia}>
                  <div className="modal-content-reportar" onClick={(e) => e.stopPropagation()}>
                      {/* Título */}
                      <div className="modal-header-reportar d-flex justify-content-between align-items-center">
                          <span className="modal-title-reportar">Reportar</span>
                          <i className="fa-solid fa-x cursor-pointer close-button-reportar" onClick={manejarCloseModalDenuncia}></i>
                      </div>

                      <div className="divider"></div>

                      {/* Pregunta inicial */}
                      {pasoReporte === 1 && (
                          <>
                              <div className="modal-question-reportar d-flex justify-content-center align-items-center text-center">
                                ¿Por qué quieres reportar esta mensaje?
                              </div>

                              <div className="divider"></div>

                         
                              {/* Opciones de reporte a candidato*/}
                              <div className="modal-body-reportar">
                                  <button className="btn-opciones" onClick={() => manejarSeleccionReporte(2)}>
                                    Comportamiento Inapropiado
                                  </button>
                                  <div className="divider"></div>

                                  <button className="btn-opciones" onClick={() => manejarSeleccionReporte(7)}>
                                    Conducta Profesional No Ética
                                  </button>
                                  <div className="divider"></div>

                                  <button className="btn-opciones" onClick={() => manejarSeleccionReporte(8)}>
                                    Acoso Laboral o Sexual
                                  </button>
                                  <div className="divider"></div>

                                  <button className="btn-opciones btn-cancelar" onClick={manejarCloseModalDenuncia}>
                                      Cancelar
                                  </button>
                              </div>
    
                          </>
                      )}

                      {/* Segunda pantalla - Descripción del reporte */}
                      {pasoReporte === 2 && (
                          <>
                              <div className="modal-body-reportar">
                                  
                                  <textarea
                                      className="form-control text-center"
                                      rows="3"
                                      placeholder="Añade una descripción (opcional)"
                                      value={descripcionReporte}
                                      onChange={(e) => setDescripcionReporte(e.target.value)}
                                  ></textarea>

                                  <div className="divider"></div>

                                  <button className="btn-opciones " onClick={enviarReporte}>
                                    {isLoading ? 'Cargando...' : 'Enviar Reporte'}                                      
                                  </button>

                                  <div className="divider"></div>

                                  <button className="btn-opciones btn-cancelar" onClick={() => setPasoReporte(1)}>
                                      Volver
                                  </button>
                              </div>
                          </>
                      )}
                  </div>
              </div>
            )}
        </div>

        </div>
    )
}
