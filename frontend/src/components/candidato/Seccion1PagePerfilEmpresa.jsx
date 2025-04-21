import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; 
import img from '../../resources/fondo.png';
import '../../styles/empresa/miperfil.css';
import { ModalSeguidoresPerfilEmpresa } from './ModalSeguidoresPerfilEmpresa';
import { ModalDetallesEmpresa } from './ModalDetallesEmpresa';

export const Seccion1PagePerfilEmpresa = ({ empresa, numPublicaciones, idCandidato }) => {
    const [showModalSeguidores, setShowModalSeguidores] = useState(false);
    const [showModalInfo, setShowModalInfo] = useState(false);
    const [showModalDenuncia, setShowModalDenuncia] = useState(false);
    const [pasoReporte, setPasoReporte] = useState(1); // 1: Selección, 2: Descripción
    const [motivoSeleccionado, setMotivoSeleccionado] = useState("");
    const [descripcionReporte, setDescripcionReporte] = useState("");
    const [numSeguidores, setNumSeguidores] = useState(0);
    const [numVacantes, setNumVacantes] = useState(0);
    const[seguidores, setSeguidores]=useState(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [siguiendo, setSiguiendo] = useState(false); 
    const [hayChat, setHayChat] = useState(false); 
    const [chatId, setChatId] = useState(null);
    const [isLoading, setIsLoading] = useState(false); 
    const navigate = useNavigate();

    // Función para obtener datos del backend
    const fetchData = useCallback(async () => {
        try {
            const Response = await fetch('https://www.codemx.net/codemx/backend/empresa/obtener_seguidores_vacantes.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idEmpresa: empresa.id }),
            });

            if (!Response.ok) {
                throw new Error('Error al obtener los datos');
            }
            const responseData= await Response.json();
            // Actualizar estados
            setNumSeguidores(responseData.cantidadSeguidores);
            setNumVacantes(responseData.cantidadVacantes);
            setSeguidores(responseData.seguidores)
        } catch (error) {
            console.error('Error al obtener los datos de seguidores y vacanets:', error);
        }
    }, [empresa.id]); 

    // Función para obtener si el candidato sigue a la empresa
    const obtenerEstados = useCallback(async () => {
        try {
            const response = await fetch("https://www.codemx.net/codemx/backend/candidato/obtener_siguiendo_chat.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ idCandidato, idEmpresa: empresa.id }),
            });

            if (!response.ok) throw new Error("Error al verificar seguidor.");

            const result = await response.json();
            setSiguiendo(result.sigue);
            setHayChat(result.haychat);
            setChatId(result.idChat);
        } catch (error) {
            console.error("Error al verificar si sigue a la empresa:", error);
        }
    }, [idCandidato, empresa.id]);

    useEffect(() => {
        fetchData();
        obtenerEstados();

    }, [fetchData, obtenerEstados]);

    const manejarShowModalSeguidores = () => {
        setShowModalSeguidores(true);
    };

    const manejarCloseModalSeguidores = async () => {
        setShowModalSeguidores(false);
        fetchData();
    };

    const manejarShowModalInfo = () => {
        setShowModalInfo(true);
    };

    const manejarCloseModalInfo = async () => {
        setShowModalInfo(false);
    };

    const toggleMenu = () => {
      setMenuVisible(!menuVisible);
    };
    

    const toggleSeguir = async () => {
        if (isLoading) return;
        setIsLoading(true);

        try {
            const url = siguiendo
                ? 'https://www.codemx.net/codemx/backend/candidato/dejar_seguir.php'
                : 'https://www.codemx.net/codemx/backend/candidato/seguir.php';
    
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idCandidato, idEmpresa: empresa.id }),
            });
    
            const result = await response.json();
    
            if (result.success) {
                // Cambia el estado local para reflejar el cambio
                setSiguiendo(!siguiendo);
                fetchData();
                setNumSeguidores((prev) => (siguiendo ? prev - 1 : prev + 1)); 
            } else {
                alert('No se pudo actualizar el seguimiento.');
            }
        } catch (error) {
            console.error('Error al cambiar el estado de seguimiento:', error);
            alert('Ocurrió un error al intentar cambiar el estado de seguimiento.');
        } finally {
            setIsLoading(false);
        }
    };

    const manejarShowModalDenuncia = () => {
        setShowModalDenuncia(true);
        setMenuVisible(!menuVisible);
        setPasoReporte(1);
        setMotivoSeleccionado("");
        setDescripcionReporte("");
      };
    
      const manejarCloseModalDenuncia = async () => {
        setShowModalDenuncia(false);
        setMenuVisible(!menuVisible);
      };
    
      const manejarSeleccionReporte = (motivo) => {
        setMotivoSeleccionado(motivo);
        setPasoReporte(2);
      };
    
      const enviarReporte = async () => {
        if (isLoading) return;
        setIsLoading(true);

        try {
            const response = await fetch("https://www.codemx.net/codemx/backend/candidato/denuncia_candidato_empresa.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    motivo: motivoSeleccionado,
                    descripcion: descripcionReporte,
                    idDenunciante: idCandidato, 
                    idDenunciado: empresa.id,
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
            setIsLoading(false);
        }
      };

    const manejarRedireccionMensaje = () => {
        navigate('/usuario-candidato/chats-candidato', {
            state: { chatId }
        });
    };


  return (
      <div className="perfil-container-empresa">
        {/* Fondo de encabezado */}
        <div className="perfil-header-empresa position-relative">
            <img src={img} alt="Fondo" className="img-fluid rounded-top" />
             {/* Boton-repsonsive */}
             <div className="boton-perfil-empresa " onClick={toggleMenu}>
                <i className="fa-solid fa-ellipsis ms-auto"></i>
            </div>
            {/* Menú desplegable para pantallas pequeñas */}
            {menuVisible && (
                <div className="modal-overlay-opciones-perfil" onClick={toggleMenu}>
                    <div className="modal-content-opciones-perfil" onClick={(e) => e.stopPropagation()}>
                        <button className="btn-opciones" onClick={() => manejarShowModalInfo()} >
                            Ver Información
                        </button>
                        <div className="divider"></div>
                        <button className="btn-opciones"  onClick={() => manejarShowModalDenuncia()}>
                            Reportar
                        </button>
                        <div className="divider"></div>
                        <button className="btn-opciones btn-cancelar"  onClick={toggleMenu}>
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
  
          <div className="perfil-empresa">
              {/* Información del usuario */}
              <div className="perfil-body-empresa py-3 px-2">
                  <div className="d-flex  justify-content-between  ">
                      {/* Foto de perfil */}
                      <div className="foto-perfil-container-empresa mb-3 mb-md-0">
                          {empresa.logo && (
                              <img
                                  src={`${empresa.logo}?t=${new Date().getTime()}`}
                                  alt="Perfil"
                                  className="foto-perfil-empresa rounded-circle"
                              />
                          )}
                      </div>

                      
                      {/* Estadisticas*/}
                      <div className="estadisticas-perfil-empresa d-flex flex-row text-center flex-nowrap">
                        <div className="d-flex flex-column align-items-center" onClick={() => manejarShowModalSeguidores()}>
                            <p className="text-highlight">{`${numSeguidores}`}</p>
                            <p>Seguidores</p> 
                        </div>

                        <div className="d-flex flex-column align-items-center">
                            <p className="text-highlight">{`${numVacantes}`}</p>
                            <p>Vacantes</p>
                        </div>

                        <div className="d-flex flex-column align-items-center">
                            <p className="text-highlight">{`${numPublicaciones}`}</p>
                            <p>Publicaciones</p>
                        </div>
                    </div>


                  </div>
  
                  {/* Detalles del usuario */}
                  <div className="datos-container-empresa  mt-0 mt-md-2">
                      <h2 >{`${empresa.nombre}`}</h2>
                      <p className='text-muted mt-2 mb-2'>{`${empresa.descripcion}`}</p>
                  </div>

                  
                    {/* Botones */}
                    <div className="botones-perfil-empresa d-flex gap-2 mt-2">
                        <button className={`btn ${siguiendo ? 'btn-tipouno' : 'btn-tipodos'} btn-sm`} onClick={() => toggleSeguir()}>
                            {siguiendo ? 'Dejar de seguir' : 'Seguir'}
                        </button>
                        {hayChat && (
                            <button className="btn btn-tipodos btn-sm" onClick={manejarRedireccionMensaje}>
                                Mandar Mensaje
                            </button>
                        )}

                    </div>
              </div>
          </div>


        {/* Modal Seguidores */}
        {showModalSeguidores && (
            <div className="modal-overlay" onClick={() => manejarCloseModalSeguidores()}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <button className="close-button btn" onClick={() => manejarCloseModalSeguidores()}>
                            <i className="fa-solid fa-x"></i>
                    </button>
                    <ModalSeguidoresPerfilEmpresa seguidores={seguidores} idCandidato={idCandidato}/>
                </div>
            </div>
        )}

        {/* Modal Info */}
        {showModalInfo && (
            <div className="modal-overlay" onClick={() => manejarCloseModalInfo()}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <button className="close-button btn" onClick={() => manejarCloseModalInfo()}>
                        <i className="fa-solid fa-x"></i>
                    </button>
                    <ModalDetallesEmpresa empresa={empresa} manejarCloseModalForm={manejarCloseModalInfo}/>
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
                                ¿Por qué quieres reportar este usuario?
                              </div>

                              <div className="divider"></div>

                         
                              {/* Opciones de reporte a candidato*/}
                              <div className="modal-body-reportar">
                                  <button className="btn-opciones" onClick={() => manejarSeleccionReporte(1)}>
                                    Información Falsa o Engañosa
                                  </button>
                                  <div className="divider"></div>

                                  <button className="btn-opciones" onClick={() => manejarSeleccionReporte(2)}>
                                    Comportamiento Inapropiado
                                  </button>
                                  <div className="divider"></div>

                                  <button className="btn-opciones" onClick={() => manejarSeleccionReporte(3)}>
                                    Publicación de Contenido Irrelevante o Spam
                                  </button>
                                  <div className="divider"></div>

                                  <button className="btn-opciones" onClick={() => manejarSeleccionReporte(4)}>
                                    Discriminación o Discurso de Odio
                                  </button>
                                  <div className="divider"></div>

                                  <button className="btn-opciones" onClick={() => manejarSeleccionReporte(5)}>
                                    Uso Fraudulento de la Plataforma
                                  </button>
                                  <div className="divider"></div>

                                  <button className="btn-opciones" onClick={() => manejarSeleccionReporte(6)}>
                                    Oferta de Empleo Inexistente o Fraudulenta
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
