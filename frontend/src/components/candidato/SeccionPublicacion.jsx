import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../../styles/empresa/publicacion.css';
import { ModalLikes } from './ModalLikes';
import { ModalDislikes } from './ModalDislikes';
import { ModalComentarios} from './ModalComentarios';
import LoadingSpinner from '../LoadingSpinner';

export const SeccionPublicacion = ({ candidato, idCandidato, publicacion, manejarOcultarSeccion, seccionInicio=0, toggleSeguir, seguimientoEstado}) => {
    const [likes, setLikes] = useState(0);
    const [numLikes, setNumLikes] = useState(0);
    const [dislikes, setDislikes] = useState(0);
    const [numDislikes, setNumDislikes] = useState(0);
    const [comentarios, setComentarios] = useState(0);
    const [numComentarios, setNumComentarios] = useState(0);
    const [showModalLikes, setShowModalLikes] = useState(false);
    const [showModalDislikes, setShowModalDislikes] = useState(false);
    const [showModalComentarios, setShowModalComentarios] = useState(false);
    const navigate = useNavigate(); 
    const [reaccion, setReaccion] = useState(null); 
    const isProcessing = useRef(false); 
    const [showModalDenuncia, setShowModalDenuncia] = useState(false);
    const [pasoReporte, setPasoReporte] = useState(1); // 1: Selección, 2: Descripción
    const [motivoSeleccionado, setMotivoSeleccionado] = useState("");
    const [descripcionReporte, setDescripcionReporte] = useState("");
    const [isLoading, setIsLoading] = useState(true); 
    const [isExpanded, setIsExpanded] = useState(false);
    const [idEmpresa] = useState(publicacion.Empresa_ID);
    const [nombreEmpresa] = useState(publicacion.Empresa_Nombre);

    const fetchData = useCallback(async () => {
          try {
            // Realiza la solicitud al backend enviando el session_id desencriptado
            const response = await fetch("https://www.codemx.net/codemx/backend/empresa/obtener_likes_dislikes_comentarios.php", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idPublicacion: publicacion.ID }), 
            });

            if (!response.ok) {
                throw new Error('Error al obtener los datos');
            }
            const responseData = await response.json();

            // Actualizar estados
            setLikes(responseData.likes);
            setNumLikes(responseData.cantidadLikes);
            setDislikes(responseData.dislikes);
            setNumDislikes(responseData.cantidadDislikes);
            setComentarios(responseData.comentarios);
            setNumComentarios(responseData.cantidadComentarios);

            // Realiza la solicitud al backend enviando el session_id desencriptado
            const responseReaccion = await fetch("https://www.codemx.net/codemx/backend/candidato/obtener_reaccion_publicacion.php", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idPublicacion: publicacion.ID, idCandidato }), 
            });

            if (!response.ok) {
                throw new Error('Error al obtener los datos');
            }
            const responseData2 = await responseReaccion.json();

            setReaccion(responseData2.reaccion); // Puede ser 'like', 'dislike' o null
            setIsLoading(false);

          } catch (error) {
              console.error("Error al obtener reacciones de la publicación:", error);
              setIsLoading(false);
          }
  
      }, [publicacion.ID]); 
  
  
      useEffect(() => {
          fetchData();
      }, [fetchData]);

    const manejarShowModalLikes = () => {
        setShowModalLikes(true);
    };

    const manejarCloseModalLikes = async () => {
        setShowModalLikes(false);
    };

    const manejarShowModalDislikes = () => {
        setShowModalDislikes(true);
    };

    const manejarCloseModalDislikes= async () => {
        setShowModalDislikes(false);
    };

    const manejarShowModalComentarios = () => {
        setShowModalComentarios (true);
    };

    const manejarCloseModalComentarios = async () => {
        setShowModalComentarios (false);
    };

    const manejarReaccion = async (tipo) => {
        if (isProcessing.current) return; // Evita múltiples clics seguidos
        isProcessing.current = true;
    
        const nuevoEstado = reaccion === tipo ? null : tipo;
        let url = "";
    
        if (nuevoEstado === "like") {
            url = "https://www.codemx.net/codemx/backend/candidato/agregar_like_publicacion.php";
        } else if (nuevoEstado === "dislike") {
            url = "https://www.codemx.net/codemx/backend/candidato/agregar_dislike_publicacion.php";
        } else {
            url = "https://www.codemx.net/codemx/backend/candidato/eliminar_reaccion_publicacion.php"; // Nueva API para eliminar reacción
        }
    
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idCandidato, idPublicacion: publicacion.ID }),
            });
    
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    
            const result = await response.json();
            if (result.success) {
                setReaccion(nuevoEstado);
                setNumLikes((prev) => (nuevoEstado === "like" ? prev + 1 : reaccion === "like" ? prev - 1 : prev));
                setNumDislikes((prev) => (nuevoEstado === "dislike" ? prev + 1 : reaccion === "dislike" ? prev - 1 : prev));

                
                // ✅ Enviar notificación solo si se dio "like"
                if (nuevoEstado === "like") {
                    // Segundo fetch: enviar notificación
                    const notifResponse = await fetch(
                        'https://www.codemx.net/codemx/backend/config/notificacion_reaccion_publicacion.php',
                        {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ idEmpresa: idEmpresa,  empresaNombre: nombreEmpresa, candidatoNombre: candidato.nombre, candidatoApellido: candidato.apellido, idPublicacion: publicacion.ID, esLike: true}),
                        }
                    );

                    const notifResult = await notifResponse.json();

                    if (!notifResponse.ok || !notifResult.success) {
                        console.error('Error al enviar notificación:', notifResult.error || 'Respuesta no exitosa');
                    }
                }

            } else {
                alert(`Error al actualizar la reacción: ${result.error || "Error desconocido"}`);
            }
        } catch (error) {
            console.error("Error al actualizar la reacción:", error);
        } finally {
            isProcessing.current = false;
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
        if (isLoading) return;
        setIsLoading(true);

        try {
            const response = await fetch("https://www.codemx.net/codemx/backend/candidato/denuncia_candidato_empresa.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    motivo: motivoSeleccionado,
                    descripcion: descripcionReporte,
                    idPublicacion: publicacion.ID,
                    idDenunciante: idCandidato, 
                    idDenunciado: idEmpresa,
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

    // Función para redirigir al perfil del candidato
    const irAlPerfilCandidato = (idCandidato) => {
        navigate(`/usuario-candidato/perfil-candidato`, { 
            state: { idCandidato: idCandidato }
        });
    };

    const irAlPerfilEmpresa = (idEmpresaPerfil) => {
        if (seccionInicio === 0 ) {
            manejarOcultarSeccion();
            navigate(`/usuario-candidato/perfil-empresa`, { 
                state: { idEmpresa: idEmpresaPerfil}
            });
        } else if (seccionInicio === 1) {
            navigate(`/usuario-candidato/perfil-empresa`, { 
                state: { idEmpresa: idEmpresaPerfil}
            });
        }
    };

    const irAMiPerfil = () => {
      navigate(`/usuario-candidato/miperfil-candidato`);  
    };

    const toggleDescription = () => {
        setIsExpanded(!isExpanded);
    };

    if (isLoading) {
        return <LoadingSpinner></LoadingSpinner> 
    }

  return (
    <div className='contenedor'>

        <>
        {seccionInicio === 0 && (
            <div className='boton d-flex align-items-center mb-2'>
                <button className="btn btn-volver-publicaciones d-flex align-items-center" onClick={() => manejarOcultarSeccion("perfil-publicaciones")}>
                    <i className="fa-solid fa-arrow-left me-2"></i> Volver a publicaciones
                </button>
            </div>

        )}

        <div className="contenedor-publicacion d-flex flex-column justify-content-between">
            <div className='seccion-usuario d-flex align-items-center gap-2 px-1 justify-content-between'>
                <div className="d-flex align-items-center gap-2">
                    <img 
                        src={`${publicacion.Empresa_Logo}?t=${new Date().getTime()}`} 
                        alt="Imagen de la publicación" 
                        className="img-perfil" 
                        onClick={() => irAlPerfilEmpresa(idEmpresa)}
                        loading="lazy" 
                    />
                    <p className='usuario-nombre m-0 align-self-center' onClick={() => irAlPerfilEmpresa(idEmpresa)}>
                        {publicacion.Empresa_Nombre}
                    </p>
                </div>

                {seccionInicio === 1 && publicacion.Siguiendo == 0 && (
                    <button 
                        className={`btn ${seguimientoEstado[idEmpresa] ? 'btn-tipouno' : 'btn-tipodos'} btn-sm seguir-publi ms-auto`} 
                        onClick={() => toggleSeguir(idEmpresa)}
                    >
                        {seguimientoEstado[idEmpresa] ? 'Dejar de seguir' : 'Seguir'}
                    </button>
                )}

                <i className="fa-solid fa-ellipsis" onClick={manejarShowModalDenuncia}></i>
            </div>
            <div className='seccion-img'>
                <img src={`${publicacion.Img}?t=${new Date().getTime()}`} alt="Imagen de la publicación" className="img-detalle" />
            </div>
            <div className='seccion-reacciones text-start d-flex gap-4  px-1'>
                <div className='likes'>
                    <i className={reaccion === "like" ? "fa-solid fa-thumbs-up pe-2" : "fa-regular fa-thumbs-up pe-2"} onClick={() => manejarReaccion("like")}></i>
                    {publicacion.Ocultar_MeGusta == 0 && (
                        <span onClick={() => manejarShowModalLikes()}>
                            {numLikes}
                        </span>
                    )}
                </div>
                <div className='dislikes'>    
                    <i className={reaccion === "dislike" ? "fa-solid fa-thumbs-down pe-2" : "fa-regular fa-thumbs-down pe-2"} onClick={() => manejarReaccion("dislike")}></i>
                    {publicacion.Ocultar_MeGusta == 0 && (
                        <span onClick={() => manejarShowModalDislikes()}>
                            {numDislikes}
                        </span>
                    )}
                </div>
                {publicacion.Sin_Comentarios == 0 && (
                    <div className='comentarios' onClick={() => manejarShowModalComentarios()}>    
                        <i className="fa-solid fa-comment pe-2"></i>
                        {numComentarios}
                    </div>
                )}
  
            </div>

            {/* Mostrar la descripción con truncado de 100 caracteres */}
            <div className='seccion-descripcion text-start d-flex flex-column'>
                <p className='descripcion'>
                    <span className='usuario-nombre'>{publicacion.Empresa_Nombre} </span>
                    <span style={{ whiteSpace: 'pre-wrap' }}>
                    {isExpanded ? publicacion.Contenido : publicacion.Contenido.substring(0, 100) + (publicacion.Contenido.length > 100 ? "..." : "")}
                    </span>
                    {publicacion.Contenido.length > 100 && (
                    <span 
                        className="ver-mas" 
                        onClick={toggleDescription}>
                        {isExpanded ? " Ver menos" : " Ver más"}
                    </span>
                    )}
                </p>
                <span className="comentario-tiempo">
                    {new Date(publicacion.Fecha_Publicacion).toLocaleString()}
                </span>
            </div>




        </div>

        {/* Modal Likes */}
        {showModalLikes && (
            <div className="modal-overlay" onClick={() => manejarCloseModalLikes()}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <button className="close-button btn" onClick={() => manejarCloseModalLikes()}>
                            <i className="fa-solid fa-x"></i>
                    </button>
                    <ModalLikes likes={likes} irAlPerfilCandidato={irAlPerfilCandidato} irAMiPerfil={irAMiPerfil} idCandidato={idCandidato}/>
                </div>
            </div>
        )}

        {/* Modal Disikes */}
        {showModalDislikes && (
            <div className="modal-overlay" onClick={() => manejarCloseModalDislikes()}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <button className="close-button btn" onClick={() => manejarCloseModalDislikes()}>
                            <i className="fa-solid fa-x"></i>
                    </button>
                    <ModalDislikes dislikes={dislikes} irAlPerfilCandidato={irAlPerfilCandidato} irAMiPerfil={irAMiPerfil} idCandidato={idCandidato} />
                </div>
            </div>
        )}

        {/* Modal Comentarios */}
        {showModalComentarios && (
            <div className="modal-overlay" onClick={() => manejarCloseModalComentarios()}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <button className="close-button btn" onClick={() => manejarCloseModalComentarios()}>
                            <i className="fa-solid fa-x"></i>
                    </button>
                    <ModalComentarios comentarios={comentarios} publicacion={publicacion} fetchData={fetchData} irAlPerfilCandidato={irAlPerfilCandidato} irAlPerfilEmpresa={irAlPerfilEmpresa} irAMiPerfil={irAMiPerfil} idCandidato={idCandidato} idEmpresa={idEmpresa} nombreEmpresa={nombreEmpresa} candidato={candidato}/>
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
                                ¿Por qué quieres reportar esta publicacion?
                              </div>

                              <div className="divider"></div>

                         
                              {/* Opciones de reporte a candidato*/}
                              <div className="modal-body-reportar">
                                  <button className="btn-opciones" onClick={() => manejarSeleccionReporte(1)}>
                                    Información Falsa o Engañosa
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

        </>
  </div>
  )
}
