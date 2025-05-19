import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../../styles/empresa/publicacion.css';
import { ModalLikes } from './ModalLikes';
import { ModalDislikes } from './ModalDislikes';
import { ModalComentarios } from './ModalComentarios';
import LoadingSpinner from '../LoadingSpinner';

export const SeccionPublicacion = ({publicacion, manejarOcultarSeccion, actualizarFetch, seccionInicio=0}) => {

    const [likes, setLikes] = useState(0);
    const [numLikes, setNumLikes] = useState(0);
    const [dislikes, setDislikes] = useState(0);
    const [numDislikes, setNumDislikes] = useState(0);
    const [comentarios, setComentarios] = useState(0);
    const [numComentarios, setNumComentarios] = useState(0);
    const [showModalLikes, setShowModalLikes] = useState(false);
    const [showModalDislikes, setShowModalDislikes] = useState(false);
    const [showModalComentarios, setShowModalComentarios] = useState(false);
    const [showModalOpciones, setShowModalOpciones] = useState(false);
    const [showModalConfirmacion, setShowModalConfirmacion] = useState(false);
    const [isLoading, setIsLoading] = useState(true); 
    const navigate = useNavigate(); // Hook para redirigir a otra página
    const [isExpanded, setIsExpanded] = useState(false);

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

    const manejarShowModalOpciones = () => {
        setShowModalOpciones(true);
    };

    const manejarCloseModalOpciones = () => {
        setShowModalOpciones(false);
    };

    const eliminarPublicacion = async () => {
        if (isLoading) return;
        setIsLoading(true);

        try {
            const response = await fetch("https://www.codemx.net/codemx/backend/admin/eliminar_publicacion.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ idPublicacion: publicacion.ID, idEmpresa: publicacion.Empresa_ID, nombreEmpresa: publicacion.Empresa_Nombre,  emailEmpresa: publicacion.Email}),
            });
    
            const result = await response.json();
    
            if (result.success) {
                // Forzar eliminación de la imagen en la UI
                const imgElement = document.querySelector(`img[src="${publicacion.Img}"]`);
                if (imgElement) {
                    imgElement.remove(); // Elimina la imagen del DOM
                }
                fetchData(); 
                setShowModalConfirmacion(false);
                window.location.reload();
            } else {
                console.error("Error al eliminar publicacion:", result.message);
            }
        } catch (error) {
            console.error("Error en la petición:", error);
        }finally {
            setIsLoading(false);
        }

    };

    const manejarShowModalConfirmacion = () => {
        setShowModalConfirmacion(true);
        setShowModalOpciones(false);
    };

    const manejarCloseModalConfirmacion = () => {
        setShowModalConfirmacion(false);
        setShowModalOpciones(true);
    };

    // Función para redirigir al perfil del candidato
    const irAlPerfil = (idCandidato) => {
        navigate(`/usuario-administrador/perfil-candidato`, { 
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
    

    const toggleDescription = () => {
        setIsExpanded(!isExpanded);
    };

          
    if (isLoading) {
        return <LoadingSpinner></LoadingSpinner> 
    }

    return (
        <div className='contenedor'>

            {seccionInicio === 0 && (
                <div className='boton d-flex align-items-center mb-2'>
                    <button className="btn btn-volver-publicaciones d-flex align-items-center" onClick={() => manejarOcultarSeccion("perfil-publicaciones")}>
                        <i className="fa-solid fa-arrow-left me-2"></i> Volver a publicaciones
                    </button>
                </div>

            )}

          <div className="contenedor-publicacion d-flex flex-column justify-content-between">
              <div className='seccion-usuario d-flex align-items-center gap-2 px-1 '>
                    <img 
                        src={`${publicacion.Empresa_Logo}?t=${new Date().getTime()}`} 
                        alt="Imagen de la publicación" 
                        className="img-perfil" 
                        onClick={() => irAlPerfilEmpresa(publicacion.Empresa_ID)}
                        loading="lazy" 
                    />
                    <p className='usuario-nombre m-0 align-self-center' onClick={() => irAlPerfilEmpresa(publicacion.Empresa_ID)}>
                        {publicacion.Empresa_Nombre}
                    </p>
                    <i className="fa-solid fa-ellipsis ms-auto" onClick={manejarShowModalOpciones}></i>
              </div>
              <div className='seccion-img'>
                  <img src={`${publicacion.Img}?t=${new Date().getTime()}`} alt="Imagen de la publicación" className="img-detalle" />
              </div>
              <div className='seccion-reacciones text-start d-flex gap-4  px-1'>
                  <div className='likes' onClick={() => manejarShowModalLikes()}>
                      <i className="fa-solid fa-thumbs-up pe-2"></i>
                      {publicacion.Ocultar_MeGusta == 0 && numLikes}
                  </div>
                  <div className='dislikes' onClick={() => manejarShowModalDislikes()}>    
                      <i className="fa-solid fa-thumbs-down pe-2"></i>
                      {publicacion.Ocultar_MeGusta == 0 && numDislikes}
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
                      <ModalLikes likes={likes} irAlPerfil={irAlPerfil}/>
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
                      <ModalDislikes dislikes={dislikes} irAlPerfil={irAlPerfil} />
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
                        <ModalComentarios comentarios={comentarios} publicacion={publicacion} fetchData={fetchData} irAlPerfil={irAlPerfil} irAlPerfilEmpresa={irAlPerfilEmpresa}/>
                  </div>
              </div>
          )}

          {/*Modal opciones*/}
          {showModalOpciones && (
              <div className="modal-overlay-opciones" onClick={() => manejarCloseModalOpciones()}>
                  <div className="modal-content-opciones" onClick={(e) => e.stopPropagation()}>
                      <div className="botones d-flex flex-column align-items-center">
      
                          <button className="btn-opciones btn-eliminar" onClick={() => manejarShowModalConfirmacion()}>
                              Eliminar
                          </button>
                          <div className="divider"></div> 
                          <button className="btn-opciones" onClick={() => manejarCloseModalOpciones()}>
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
          
                      <p>¿Seguro que quieres eliminar la publicación?</p>

                      <div className="d-flex justify-content-between mt-3">
                      <button
                          className="btn btn-tipodos btn-sm"
                          onClick={() => manejarCloseModalConfirmacion()}
                      >
                          Cancelar
                      </button>
                      <button
                          className="btn btn-danger btn-sm"
                      onClick={() => eliminarPublicacion()}
                      >
                            {isLoading ? 'Cargando...' : 'Confirmar'}
                      </button>
                      </div>
                  </div>
              </div>
          )}
              
            
            
            
     
        </div>
        
    );
}
