import React, { useState, useEffect, useCallback } from "react";
import "../../styles/empresa/publicacion.css";

export const ModalComentarios = ({ comentarios, publicacion, fetchData, irAlPerfilCandidato, irAlPerfilEmpresa}) => {


    const [numLikes] = useState(
        comentarios.reduce((acc, comentario) => {
            acc[comentario.ID] = comentario.NumLikes || 0;
            return acc;
        }, {})
    );

    const [respuestasVisibles, setRespuestasVisibles] = useState({});
    const [modalOpciones, setModalOpciones] = useState(false);
    const [comentarioSeleccionado, setComentarioSeleccionado] = useState(null);
    const [isLoading, setIsLoading] = useState(false); 

    
    const manejarRespuestas = (idComentario, nombreUsuario) => {
       
        setRespuestasVisibles((prevState) => ({
            ...prevState,
            [idComentario]: !prevState[idComentario],
        }));
        if (!nombreUsuario) return; 

    };

    const manejarModalOpciones = (comentario) => {
        setComentarioSeleccionado(comentario);
        setModalOpciones(true);
    };

    const cerrarModalOpciones = () => {
        setModalOpciones(false);
    };

    const eliminarComentario = async () => {
    if (isLoading || !comentarioSeleccionado) return;
    setIsLoading(true);

    const isCandidato = comentarioSeleccionado.tipo_usuario === "candidato";

    const payload = {
        idComentario: comentarioSeleccionado.ID,
        contenidoComentario: comentarioSeleccionado.Comentario,
        nombreUsuario: isCandidato
            ? `${comentarioSeleccionado.CandidatoNombre} ${comentarioSeleccionado.CandidatoApellido}`
            : comentarioSeleccionado.EmpresaNombre,
        ...(isCandidato
            ? { idCandidato: comentarioSeleccionado.CandidatoID }
            : { idEmpresa: comentarioSeleccionado.EmpresaID }),
    };


    try {
        const response = await fetch("https://www.codemx.net/codemx/backend/admin/eliminar_comentario.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (result.success) {
            fetchData();
        } else {
            console.error("Error al eliminar comentario:", result.error);
        }
    } catch (error) {
        console.error("Error en la petición:", error);
    } finally {
        setIsLoading(false);
        setModalOpciones(false);
    }
};


    // Función para organizar comentarios en un árbol de respuestas
    const construirJerarquiaComentarios = (comentarios) => {
        let comentariosMap = {};
        let comentariosRaiz = [];

        comentarios.forEach((comentario) => {
            comentariosMap[comentario.ID] = { ...comentario, respuestas: [] };
        });

        comentarios.forEach((comentario) => {
            if (comentario.Respuesta_a) {
                if (comentariosMap[comentario.Respuesta_a]) {
                    comentariosMap[comentario.Respuesta_a].respuestas.push(
                        comentariosMap[comentario.ID]
                    );
                }
            } else {
                comentariosRaiz.push(comentariosMap[comentario.ID]);
            }
        });

        return comentariosRaiz;
    };

     // Función recursiva para renderizar comentarios y sus respuestas
     const renderizarComentarios = (comentarios, nivel = 0) => {
        return comentarios.map((comentario) => {
            const nombreUsuario = comentario.tipo_usuario === "candidato"
                ? `${comentario.CandidatoNombre} ${comentario.CandidatoApellido}`
                : comentario.EmpresaNombre;

            const nombreUsuarioLimpio = nombreUsuario
                .replace(/\s+/g, "") // Eliminar todos los espacios
                .trim(); 

            return (
                <div
                    key={comentario.ID}
                    className={`comentario-item ${nivel > 0 ? "comentario-respuesta" : ""}`}
                    style={{ marginLeft: nivel * 20 + "px" }}
                >
                    <div className="comentario-header d-flex align-items-center">
                        <img
                            src={
                                comentario.tipo_usuario === "candidato"
                                    ? `${comentario.CandidatoFotografia}?t=${new Date().getTime()}`
                                    : `${comentario.EmpresaLogo}?t=${new Date().getTime()}`
                            }
                            alt="perfil"
                           onClick={() => {
                                if (comentario.EmpresaID) {
                                    irAlPerfilEmpresa(comentario.EmpresaID)
                                } else if (comentario.CandidatoID) {
                                    irAlPerfilCandidato(comentario.CandidatoID)
                                }
                            }}
                            className="comentario-foto rounded-circle"
                        />
                         <div className="d-flex justify-content-between align-items-center w-100">
                            <div className="comentario-usuario d-flex flex-column">
                                <span className="comentario-nombre"
                                    onClick={() => {
                                        if (comentario.EmpresaID) {
                                            irAlPerfilEmpresa(comentario.EmpresaID)
                                        } else if (comentario.CandidatoID) {
                                            irAlPerfilCandidato(comentario.CandidatoID)
                                        }
                                    }}>
                                    {nombreUsuario}
                                    {comentario.EmpresaID === publicacion.Empresa_ID && (
                                        <>
                                            <span className="autor ms-2">-</span>
                                            <span className="autor ms-2">Autor</span>
                                        </>
                                    )}
                                </span>
                                <span className="comentario-tiempo">
                                    {new Date(comentario.Fecha_Comentario).toLocaleString()}
                                </span>
                                
                            </div>
                                <i onClick={() => manejarModalOpciones(comentario)} className="fa-solid fa-ellipsis ms-auto"></i>
                        </div>
                    </div>

                    <div className="comentario-contenedor">
                        <div className="comentario-texto mb-2 mt-2">{comentario.Comentario}</div>

                        <div className="comentario-footer d-flex justify-content-between align-items-center">
                            <div className="comentario-acciones">
                                <div className="comentario-reacciones">
                                    <i className="fa-solid fa-heart"></i>
                                    <span className="ms-2">{numLikes[comentario.ID]}</span>
                                </div>
                            </div>
                        </div>

                        {/* Botón para mostrar/ocultar respuestas */}
                        {comentario.respuestas.length > 0 && (
                            <button
                                className="btn-ver-respuestas"
                                onClick={() => manejarRespuestas(comentario.ID)}
                            >
                                {respuestasVisibles[comentario.ID] ? "Ocultar respuestas" : `Ver respuestas (${comentario.respuestas.length})`}
                            </button>
                        )}

                        {/* Renderizar respuestas si están visibles */}
                        {respuestasVisibles[comentario.ID] &&
                            renderizarComentarios(comentario.respuestas, nivel + 1)}
                    </div>
                </div>
            );
        });
    };

    // Construir estructura de comentarios con jerarquía
    const comentariosJerarquicos = construirJerarquiaComentarios(comentarios);

    return (
        <div>
            <h5 className="mb-3 text-center titulo-modal">Comentarios</h5>

            <div className="lista-comentarios">
                {comentariosJerarquicos.length > 0 ? (
                    renderizarComentarios(comentariosJerarquicos)
                ) : (
                    <p className="text-center">No hay comentarios en esta publicación.</p>
                )}
            </div>

            <div className='modal-opciones'>
                {modalOpciones && (
                    <div className="modal-overlay-opciones" onClick={cerrarModalOpciones}>
                        <div className="modal-content-opciones" onClick={(e) => e.stopPropagation()}>
                            <div className="botones d-flex flex-column align-items-center">
            
                                <button className="btn-opciones btn-eliminar" onClick={eliminarComentario}>
                                    {isLoading ? 'Cargando...' : 'Eliminar'}
                                </button>
                                <div className="divider"></div> 
                                <button className="btn-opciones" onClick={cerrarModalOpciones}>
                                    Cancelar
                                </button>
                 
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
       
        </div>
    );
};
