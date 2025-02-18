import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../../styles/empresa/publicacion.css';
import { ModalLikes } from './ModalLikes';
import { ModalDislikes } from './ModalDislikes';
import { ModalComentarios } from './ModalComentarios';

export const SeccionPublicacion = ({ empresa, publicacion, manejarOcultarSeccion, actualizarFetch,  setPublicacionSeleccionada }) => {

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
    const [seccionActiva, setSeccionActiva] = useState("publicacion");
    const [descripcion, setDescripcion] = useState(publicacion.Contenido); 
    const [ocultarMeGusta, setOcultarMeGusta] = useState(null); 
    const [sinComentarios, setSinComentarios] = useState(null); 
    const navigate = useNavigate(); // Hook para redirigir a otra página

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

        } catch (error) {
            console.error("Error al obtener reacciones de la publicación:", error);
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
        try {
            const response = await fetch("https://www.codemx.net/codemx/backend/empresa/eliminar_publicacion.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ idPublicacion: publicacion.ID}),
            });
    
            const result = await response.json();
    
            if (result.success) {
                // Forzar eliminación de la imagen en la UI
                const imgElement = document.querySelector(`img[src="${publicacion.Img}"]`);
                if (imgElement) {
                    imgElement.remove(); // Elimina la imagen del DOM
                }
                actualizarFetch(); 
                manejarOcultarSeccion("perfil-publicaciones");

            } else {
                console.error("Error al eliminar publicacion:", result.message);
            }
        } catch (error) {
            console.error("Error en la petición:", error);
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

    const manejarShowEditarSeccion = () => {
        setSeccionActiva("editar-publicacion");
        setDescripcion(publicacion.Contenido);
        setOcultarMeGusta(Boolean(publicacion.Ocultar_MeGusta));

        if(publicacion.Ocultar_MeGusta == 0){
            setOcultarMeGusta(0);
        } else if (publicacion.Ocultar_MeGusta == 1){
            setOcultarMeGusta(1);
        }

        if(publicacion.Sin_Comentarios == 0){
            setSinComentarios(0);
        } else if (publicacion.Sin_Comentarios == 1){
            setSinComentarios(1);
        }
    };

    const manejarCloseEditarSeccion = () => {
        setSeccionActiva("publicacion");
        setShowModalOpciones(false);
    };

    const editarPublicacion = async () => {
        const formData = new FormData();
    
        formData.append("publicacion_id", publicacion.ID); 
        formData.append("descripcion", descripcion); 
        formData.append("ocultar_me_gusta", ocultarMeGusta); 
        formData.append("sin_comentarios", sinComentarios);
    
        try {
            const response = await fetch("https://www.codemx.net/codemx/backend/empresa/editar_publicacion.php", {
                method: "POST",
                body: formData,
            });
    
            const result = await response.json();
    
            if (result.success) {
                 // 🔹 Actualiza manualmente la publicación seleccionada antes de recargar datos
                setPublicacionSeleccionada(prev => ({
                    ...prev,
                    Contenido: descripcion,
                    Ocultar_MeGusta: ocultarMeGusta,
                    Sin_Comentarios: sinComentarios
                }));
                setSeccionActiva("publicacion");
                setShowModalOpciones(false);
            } else {
                console.error("Error al editar publicacion:", result.message);
            }
        } catch (error) {
            console.error("Error en la petición:", error);
        }
    };

    // Función para redirigir al perfil del candidato
    const irAlPerfil = (idCandidato) => {
        navigate(`/usuario-empresa/perfil-candidato`, { 
            state: { idCandidato: idCandidato }
        });
    };

    const irAlPerfilEmpresa = (idEmpresaPerfil, idEmpresaActiva) => {
        navigate(`/usuario-empresa/perfil-empresa`, { 
            state: { idEmpresa: idEmpresaPerfil, empresaActiva: idEmpresaActiva }
        });
    };
    const irAMiPerfilEmpresa = () => {
        manejarOcultarSeccion("/usuario-empresa/inicio-empresa");
      };
  



    return (
        <div className='contenedor'>
            {seccionActiva === "publicacion" && (
                <>
                <div className='boton d-flex align-items-center mb-2'>
                    <button className="btn btn-volver d-flex align-items-center" onClick={() => manejarOcultarSeccion("perfil-publicaciones")}>
                        <i className="fa-solid fa-arrow-left me-2"></i> Volver a publicaciones
                    </button>
                </div>

                <div className="contenedor-publicacion d-flex flex-column justify-content-between">
                    <div className='seccion-usuario d-flex align-items-center gap-2 px-1 '>
                        <img src={`${empresa.logo}?t=${new Date().getTime()}`} alt="Imagen de la publicación" className="img-perfil" onClick={() => irAMiPerfilEmpresa()}/>
                        <p className='usuario-nombre m-0 align-self-center' onClick={() => irAMiPerfilEmpresa()}>{empresa.nombre}</p>
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
                    <div className='seccion-descripcion text-start d-flex flex-column'>
                        <p className='descripcion'> <span className='usuario-nombre'>{empresa.nombre}</span> {publicacion.Contenido}</p>
                        <span className="comentario-tiempo">{new Date(publicacion.Fecha_Publicacion).toLocaleString()}</span>
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
                            <ModalComentarios empresa={empresa} comentarios={comentarios} publicacion={publicacion} fetchData={fetchData} irAlPerfil={irAlPerfil} irAlPerfilEmpresa={irAlPerfilEmpresa} irAMiPerfilEmpresa={irAMiPerfilEmpresa} />
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
                                <button className="btn-opciones" onClick={() => manejarShowEditarSeccion()}>
                                    Editar
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
                                Confirmar
                            </button>
                            </div>
                        </div>
                    </div>
                )}
                </>
            )}
            
            {seccionActiva === "editar-publicacion" && (
                <>
                    <div className='boton d-flex align-items-center mb-2'>
                        <button className="btn btn-volver d-flex align-items-center" onClick={() => manejarCloseEditarSeccion("publicacion")}>
                            <i className="fa-solid fa-arrow-left me-2"></i> Volver
                        </button>
                    </div>
                    <div className='contenedor-agregar-publicaciones d-flex flex-column justify-content-center align-items-center'>
                        {/* Input para la imagen */}
                        <div className='seccion-inputimg text-center d-flex  flex-column justify-content-center align-items-center'>
                            <img src={`${publicacion.Img}?t=${new Date().getTime()}`} alt="Previsualización" className="img-preview" />
                        </div>

                        {/* Input para la descripción */}
                        <div className='seccion-inputdescripcion'>
                        <textarea
                            placeholder="Escribe una descripción..."
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            className="form-control"
                            rows="3"
                        ></textarea>
                        </div>

                        {/* Configuracion de la publicacion */}
                        <div className="seccion-configuracion ">
                        <h2 className="titulo-configuracion">Configuración avanzada</h2>
                        <div className="opcion-configuracion d-flex justify-content-between align-items-center">
                            <span>Ocultar recuentos de Me gusta</span>
                            <label className="switch">
                            <input 
                                type="checkbox" 
                                checked={ocultarMeGusta} 
                                onChange={(e) => setOcultarMeGusta(e.target.checked ? 1 : 0)}
                            />
                            <span className="slider round"></span>
                            </label>
                        </div>

                        <div className="opcion-configuracion d-flex justify-content-between align-items-center">
                            <span>Desactivar comentarios</span>
                            <label className="switch">
                            <input 
                                type="checkbox" 
                                checked={sinComentarios} 
                                onChange={(e) => setSinComentarios(e.target.checked ? 1 : 0)}
                            />
                            <span className="slider round"></span>
                            </label>
                        </div>

                        </div>
                        {/* Botón para finalizar publicación */}
                        <button
                            className="btn btn-tipouno mt-2 mb-2 btn-sm "
                            disabled={!descripcion} 
                            onClick={() => editarPublicacion()}
                        >
                        Editar publicación
                        </button>
                    </div>
                </>
                
            )}
            
     
        </div>
        
    );
}
