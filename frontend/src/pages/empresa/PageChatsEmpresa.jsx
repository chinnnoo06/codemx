import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/seccionchats.css';
import { SeccionListaChats } from '../../components/empresa/SeccionListaChats';
import { SeccionChatsMensajes } from '../../components/empresa/SeccionChatsMensajes';


export const PageChatsEmpresa = ({ empresa }) => {

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
    const [candidatoDelMensaje, setCandidatoDelMensaje] = useState(null);
    const [showModalOpciones, setShowModalOpciones] = useState(false);
    const [showModalConfirmacionEliminarChat, setShowModalConfirmacionEliminarChat] = useState(false);
    const [chatAEliminar, setChatAEliminar] = useState(null);
    const location = useLocation();
    const navigate = useNavigate(); 

    // Función para obtener datos del backend
    const fetchData = useCallback(async () => {
        try {
            const Response = await fetch('https://www.codemx.net/codemx/backend/empresa/obtener_chats_empresa.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idEmpresa: empresa.id }),
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
            console.error('Error al obtener los datos de chats:', error);
            setIsLoading(false);
        }
    }, [empresa.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        fetchData(); // carga inicial
    
        const interval = setInterval(() => {
            fetchData(); // actualiza lista de chats
        }, 1000); 
    
        return () => clearInterval(interval); 
    }, [fetchData]);


    useEffect(() => {
        const manejarCambioPantalla = () => {
            const ancho = window.innerWidth;
    
            if (ancho < 1000) {
                setSeccionActiva((prev) => {
                    if (prev !== "pantalla-pequenia") {
                        setSeccionActivaPequenia("lista-chats"); // solo si antes era otra vista
                        return "pantalla-pequenia";
                    }
                    return prev;
                });
            } else {
                setSeccionActiva("pantalla-grande");
            }
        };
    
        manejarCambioPantalla();
    
        // Usa debounce para evitar spam en móviles
        let resizeTimeout;
        const debouncedResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(manejarCambioPantalla, 200);
        };
    
        window.addEventListener("resize", debouncedResize);
        return () => window.removeEventListener("resize", debouncedResize);
    }, []);

    useEffect(() => {
        if (location.state?.chatId && chats) {
          const chatEncontrado = chats.find(c => c.Chat_ID === location.state.chatId);
          if (chatEncontrado) {
            setChatActivo(chatEncontrado);
            if (window.innerWidth < 1000) {
              setSeccionActiva("pantalla-pequenia");
              setSeccionActivaPequenia("conversacion-chat");
            }
          }
        }
      }, [location.state?.chatId, chats]);

    

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

    
    const irAlPerfilCandidato = (idCandidatoPerfil) => {
        navigate(`/usuario-empresa/perfil-candidato`, { 
            state: { idEmpresa: idCandidatoPerfil}
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

    
    const manejarShowModalConfirmacionElinarChat = () => {
        setShowModalConfirmacionEliminarChat(true);
        setShowModalOpciones(false);
    };

    const manejarCloseModalConfirmacionEliminarChat = () => {
        setShowModalConfirmacionEliminarChat(false);
        setShowModalOpciones(true);
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

    const eliminarChat = async () => {
        if (isLoadingOpciones) return;
        setIsLoadingOpciones(true);
        try {
            const response = await fetch("https://www.codemx.net/codemx/backend/config/eliminar_chat.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ idChat: chatAEliminar }),
            });
    
            const result = await response.json();
    
            if (result.success) {
                fetchData();
                manejarCloseModalConfirmacionEliminarChat();
                setShowModalOpciones(false);
                setChatActivo(null);
            } else {
                console.error("Error al eliminar chat:", result.message);
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
            const response = await fetch("https://www.codemx.net/codemx/backend/empresa/denuncia_empresa_candidato.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    motivo: motivoSeleccionado,
                    descripcion: descripcionReporte,
                    idMensaje: mensajeSeleccionado,
                    idDenunciante: empresa.id, 
                    idDenunciado: candidatoDelMensaje,
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

    const manejarMostrarOpcionesEliminar = (idChat) => {
        setChatAEliminar(idChat);
        setShowModalOpciones(true);
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
                                irAlPerfilCandidato={irAlPerfilCandidato}
                            />
                        </div>

                        {/* Columna derecha: ventana del chat activo */}
                        <div className="col-md-8 ">
                            <SeccionChatsMensajes 
                                chat={chatActivo} 
                                irAlPerfilCandidato={irAlPerfilCandidato}
                                onMostrarOpcionesAutor={(idMensaje) => {
                                    setMensajeSeleccionado(idMensaje);
                                    setShowModalOpcionesAutor(true);
                                }}
                                onMostrarOpcionesNoAutor={(idMensaje, idCandidato) => {
                                    setMensajeSeleccionado(idMensaje);
                                    setCandidatoDelMensaje(idCandidato);
                                    setShowModalOpcionesNoAutor(true);
                                }}
                                manejarMostrarOpcionesEliminar={manejarMostrarOpcionesEliminar}
                                idEmpresa={empresa.id}
                                empresa={empresa}
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
                                irAlPerfilCandidato={irAlPerfilCandidato}
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
                                irAlPerfilCandidato={irAlPerfilCandidato}
                                onMostrarOpcionesAutor={(idMensaje) => {
                                    setMensajeSeleccionado(idMensaje);
                                    setShowModalOpcionesAutor(true);
                                }}
                                onMostrarOpcionesNoAutor={(idMensaje, idCandidato) => {
                                    setMensajeSeleccionado(idMensaje);
                                    setCandidatoDelMensaje(idCandidato);
                                    setShowModalOpcionesNoAutor(true);
                                }}
                                setShowModalOpciones={setShowModalOpciones}
                                idEmpresa={empresa.id}
                                empresa={empresa}
                            />
                        </div>
                    )}
                </>
            )}

            {/*Modal opciones*/}
            {showModalOpciones && (
                <div className="modal-overlay-opciones" onClick={() => setShowModalOpciones(false)}>
                    <div className="modal-content-opciones" onClick={(e) => e.stopPropagation()}>
                        <div className="botones d-flex flex-column align-items-center">
        
                            <button className="btn-opciones btn-eliminar" onClick={() => manejarShowModalConfirmacionElinarChat()}>
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

             {/*Modal Confirmacion*/}
             {showModalConfirmacionEliminarChat && (
                <div className="modal-overlay-confirmacion" onClick={() => manejarCloseModalConfirmacionEliminarChat()}>
                    <div className="modal-content-confirmacion" onClick={(e) => e.stopPropagation()}>
            
                        <p>¿Seguro que quieres eliminar el chat?</p>

                        <div className="d-flex justify-content-between mt-3">
                        <button
                            className="btn btn-tipodos btn-sm"
                            onClick={() => manejarCloseModalConfirmacionEliminarChat()}
                        >
                            Cancelar
                        </button>
                        <button
                            className="btn btn-danger btn-sm"
                        onClick={() => eliminarChat()}
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
                                    Falta de Profesionalismo
                                  </button>
                                  <div className="divider"></div>

                                  <button className="btn-opciones" onClick={() => manejarSeleccionReporte(4)}>
                                    Conducta Inapropiada u Ofensiva
                                  </button>
                                  <div className="divider"></div>

                                  <button className="btn-opciones" onClick={() => manejarSeleccionReporte(6)}>
                                    Spam o Mensajes No Deseados
                                  </button>
                                  <div className="divider"></div>

                                  <button className="btn-opciones" onClick={() => manejarSeleccionReporte(7)}>
                                    Acoso o Discriminación
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
