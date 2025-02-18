import React, { useState, useEffect, useCallback } from "react";
import "../../styles/empresa/publicacion.css";

export const ModalComentariosPerfilEmpresa = ({ empresa, comentarios, publicacion, fetchData, irAlPerfil, irAlPerfilEmpresa, irAMiPerfilEmpresa, empresaActiva }) => {
    // Estado para manejar los likes por cada comentario
    const [likesEstado, setLikesEstado] = useState(
        comentarios.reduce((acc, comentario) => {
            acc[comentario.ID] = comentario.LikeDado || false; // Estado inicial basado en si el usuario ya dio like
            return acc;
        }, {})
    );

    const [numLikes, setNumLikes] = useState(
        comentarios.reduce((acc, comentario) => {
            acc[comentario.ID] = comentario.NumLikes || 0;
            return acc;
        }, {})
    );

    const [respuestasVisibles, setRespuestasVisibles] = useState({});
    const [nuevoComentario, setNuevoComentario] = useState("");
    const [respuestaA, setRespuestaA] = useState(null);
    const [modalOpciones, setModalOpciones] = useState(false);
    const [modalReportar, setModalReportar] = useState(false);
    const [pasoReporte, setPasoReporte] = useState(1); // 1: Selección, 2: Descripción
    const [motivoSeleccionado, setMotivoSeleccionado] = useState("");
    const [descripcionReporte, setDescripcionReporte] = useState("");
    const [opcionAutor, setopcionAutor] = useState(null);
    const [comentarioSeleccionado, setComentarioSeleccionado] = useState(null);
    const [comentarioIdSeleccionado, setComentarioIdSeleccionado] = useState(null);
    const [candidatoIdSeleccionado, setCandidatoIdSeleccionado] = useState(null);
    const [isLiking, setIsLiking] = useState(false); 

    const obtenerLikesUsuario = useCallback(async () => {
        try {
            const response = await fetch("https://www.codemx.net/codemx/backend/config/obtener_likes_comentarios.php", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    idEmpresa: empresaActiva,
                    idPublicacion: publicacion.ID
                }),
            });
    
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    
            const result = await response.json();
    
            if (result.success) {
                const nuevosLikesEstado = {};
                result.likes.forEach((idComentario) => {
                    nuevosLikesEstado[idComentario] = true;
                });
    
                setLikesEstado(nuevosLikesEstado);
            } else {
                console.error("Error al obtener likes:", result.message);
            }
        } catch (error) {
            console.error("Error al obtener likes:", error);
        }
    }, [empresaActiva, publicacion.ID]); // Dependencias
    
    useEffect(() => {
        obtenerLikesUsuario();
    }, [obtenerLikesUsuario]); // Ahora no habrá advertencias
    
    
    useEffect(() => {
        obtenerLikesUsuario();
    }, [obtenerLikesUsuario]); 
    
    const manejarLike = async (idComentario) => {
        if (isLiking) return; 

        setIsLiking(true);

        const estaDandoLike = !likesEstado[idComentario];
        const url = estaDandoLike
            ? "https://www.codemx.net/codemx/backend/config/agregar_like_comentario.php"
            : "https://www.codemx.net/codemx/backend/config/eliminar_like_comentario.php";
    
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idEmpresa: empresaActiva, idComentario }),
            });
    
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    
            const result = await response.json();
    
            if (result.success) {
                setLikesEstado((prevState) => ({
                    ...prevState,
                    [idComentario]: estaDandoLike,
                }));
    
                setNumLikes((prevState) => ({
                    ...prevState,
                    [idComentario]: (Number(prevState[idComentario]) || 0) + (estaDandoLike ? 1 : -1),
                }));

                fetchData();
            } else {
                alert(`Error al actualizar el like: ${result.error || "Error desconocido"}`);
            }
        } catch (error) {
            console.error("Error al actualizar el like:", error);
        } finally {
            setTimeout(() => setIsLiking(false), 500); 
        }
    };

    const manejarRespuestas = (idComentario, nombreUsuario) => {
       
        setRespuestasVisibles((prevState) => ({
            ...prevState,
            [idComentario]: !prevState[idComentario],
        }));
        if (!nombreUsuario) return; 
        setRespuestaA(idComentario); 
        setNuevoComentario(`@${nombreUsuario} `); 
    };

    const manejarCambioComentario = (e) => {
        const texto = e.target.value;

        // Si el usuario borra el @nombreUsuario, eliminar la respuestaA
        if (!texto.startsWith("@")) {
            setRespuestaA(null);
        }
    
        setNuevoComentario(texto);
    };

    const manejarEnterComentario = (e) => {
        if (e.key === "Enter") {
            enviarComentario();
        }
    };

    const manejarModalOpciones = (comentario) => {
        const usuarioEsEmpresa = empresaActiva !== undefined && empresaActiva !== null;
        const esAutor = usuarioEsEmpresa 
            ? comentario.EmpresaID === empresaActiva 
            : comentario.CandidatoID === empresaActiva;
    
        setopcionAutor(esAutor);
        setModalOpciones(true);
        setComentarioSeleccionado(comentario);
        setComentarioIdSeleccionado(comentario.ID);
    };

    const cerrarModalOpciones = () => {
        setModalOpciones(false);
        setopcionAutor(null);
    };

    const eliminarComentario = async () => {
        if (!comentarioIdSeleccionado) return; 
    
        try {
            const response = await fetch("https://www.codemx.net/codemx/backend/config/eliminar_comentario.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ idComentario: comentarioIdSeleccionado, idEmpresa: empresaActiva }),
            });
    
            const result = await response.json();
    
            if (result.success) {
                fetchData(); 
            } else {
                console.error("Error al eliminar comentario:", result.message);
            }
        } catch (error) {
            console.error("Error en la petición:", error);
        }
    
        setComentarioSeleccionado(null);
        setModalOpciones(false);
    };

    const manejarModalReportar = () => {
        setModalReportar(true);
        setPasoReporte(1);
        setMotivoSeleccionado("");
        setDescripcionReporte("");
    };

    const cerrarModalReportar = () => {
        setModalReportar(false);
        setModalOpciones(false);
        setPasoReporte(1);
    };

    const manejarSeleccionReporte = (motivo, comentario) => {
        setMotivoSeleccionado(motivo);
        setPasoReporte(2);

    
        // Si el comentario es nulo, usa el último comentario seleccionado
        setComentarioIdSeleccionado(comentario.ID);
        setCandidatoIdSeleccionado(comentario ? comentario.CandidatoID : candidatoIdSeleccionado);


    };

    const enviarReporte = async () => {
    
        try {
            const response = await fetch("https://www.codemx.net/codemx/backend/empresa/denuncia_empresa_candidato.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    motivo: motivoSeleccionado,
                    descripcion: descripcionReporte,
                    idComentario: comentarioIdSeleccionado,
                    idDenunciante: empresa.id, 
                    idDenunciado: candidatoIdSeleccionado
                }),
            });

            const result = await response.json();
            if (result.success) {
                alert("Reporte enviado correctamente.");
                cerrarModalReportar();
            } else {
                console.error("Error al enviar reporte:", result.message);
            }
        } catch (error) {
            console.error("Error al enviar reporte:", error);
        }
    };
    
    const enviarComentario = async () => {
        if (nuevoComentario.trim() === "" || nuevoComentario.trim() === "@") return;
    
        // Remueve el "@" si el usuario lo deja solo
        const comentarioLimpio = nuevoComentario.startsWith("@") ? nuevoComentario.replace(/^@\S+\s/, "") : nuevoComentario;
    
        try {
            const response = await fetch("https://www.codemx.net/codemx/backend/config/agregar_comentario.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    idEmpresa: empresaActiva,
                    idPublicacion: publicacion.ID,
                    comentario: comentarioLimpio, 
                    respuestaA: respuestaA, 
                }),
            });
    
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
    
            const result = await response.json();
    
            if (result.success) {
                setNuevoComentario(""); 
                setRespuestaA(null); 
                fetchData();
            } else {
                console.error("Error al agregar comentario:", result.message);
            }
        } catch (error) {
            console.error("Error al agregar comentario:", error);
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
                                if (comentario.CandidatoID) {
                                    irAlPerfil(comentario.CandidatoID);
                                } else if (comentario.EmpresaID) {
                                    if (comentario.EmpresaID === empresaActiva) {
                                        irAMiPerfilEmpresa();
                                    } else {
                                        irAlPerfilEmpresa(comentario.EmpresaID);
                                    }
                                }
                            }}
                            className="comentario-foto rounded-circle"
                        />
                         <div className="d-flex justify-content-between align-items-center w-100">
                            <div className="comentario-usuario d-flex flex-column">
                                <span className="comentario-nombre"
                                      onClick={() => {
                                        if (comentario.CandidatoID) {
                                            irAlPerfil(comentario.CandidatoID);
                                        } else if (comentario.EmpresaID) {
                                            if (comentario.EmpresaID === empresaActiva) {
                                                irAMiPerfilEmpresa();
                                            } else {
                                                irAlPerfilEmpresa(comentario.EmpresaID);
                                            }
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
                            {(comentario.tipo_usuario === "candidato" || comentario.EmpresaID === empresaActiva) && (
                                <i onClick={() => manejarModalOpciones(comentario)} className="fa-solid fa-ellipsis ms-auto"></i>
                            )}

                        </div>
                    </div>

                    <div className="comentario-contenedor">
                        <div className="comentario-texto mb-2 mt-2">{comentario.Comentario}</div>

                        <div className="comentario-footer d-flex justify-content-between align-items-center">
                            <div className="comentario-acciones">
                                <div className="comentario-reacciones" onClick={() => manejarLike(comentario.ID)}>
                                    <i className={likesEstado[comentario.ID] ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
                                    <span className="ms-2">{numLikes[comentario.ID]}</span>
                                </div>
                            </div>
                            {nivel < 3 && (
                                <div className="comentario-responder" onClick={() => manejarRespuestas(comentario.ID, nombreUsuarioLimpio)}>
                                    Responder
                                </div>
                            )}
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

            <div className="barra-comentario d-flex align-items-center mt-3">
                <input
                    type="text"
                    className="input-comentario"
                    placeholder="Escribe un comentario..."
                    value={nuevoComentario} 
                    onChange={manejarCambioComentario} 
                    onKeyDown={manejarEnterComentario} 
                />
                <button className="btn-enviar-comentario" onClick={enviarComentario}>
                    <i className="fa-solid fa-paper-plane"></i>
                </button>
            </div>
            <div className='modal-opciones'>
                {modalOpciones && (
                    <div className="modal-overlay-opciones" onClick={cerrarModalOpciones}>
                        <div className="modal-content-opciones" onClick={(e) => e.stopPropagation()}>
                            <div className="botones d-flex flex-column align-items-center">
                                {opcionAutor ? (
                                    <>
                                        <button className="btn-opciones btn-eliminar" onClick={eliminarComentario}>
                                            Eliminar
                                        </button>
                                        <div className="divider"></div> 
                                        <button className="btn-opciones" onClick={cerrarModalOpciones}>
                                            Cancelar
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button className="btn-opciones btn-reportar" onClick={manejarModalReportar}>
                                            Reportar
                                        </button>
                                        <div className="divider"></div>
                                        <button className="btn-opciones" onClick={cerrarModalOpciones}>
                                            Cancelar
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className='modal-reportar'>
                {modalReportar && (
                    <div className="modal-overlay-reportar" onClick={cerrarModalReportar}>
                        <div className="modal-content-reportar" onClick={(e) => e.stopPropagation()}>
                            {/* Título */}
                            <div className="modal-header-reportar d-flex justify-content-between align-items-center">
                                <span className="modal-title-reportar">Reportar</span>
                                <i className="fa-solid fa-x cursor-pointer close-button-reportar" onClick={cerrarModalReportar}></i>
                            </div>

                            <div className="divider"></div>

                            {/* Pregunta inicial */}
                            {pasoReporte === 1 && (
                                <>
                                    <div className="modal-question-reportar d-flex justify-content-center align-items-center text-center">
                                        ¿Por qué quieres reportar este comentario?
                                    </div>

                                    <div className="divider"></div>

                                    {/* Opciones de reporte */}
                                    <div className="modal-body-reportar">
                                        <button className="btn-opciones" onClick={() => manejarSeleccionReporte(1, comentarioSeleccionado)}>
                                            Información Falsa o Engañosa
                                        </button>
                                        <div className="divider"></div>

                                        <button className="btn-opciones" onClick={() => manejarSeleccionReporte(4, comentarioSeleccionado)}>
                                            Conducta Inapropiada u Ofensiva
                                        </button>
                                        <div className="divider"></div>

                                        <button className="btn-opciones" onClick={() => manejarSeleccionReporte(6, comentarioSeleccionado)}>
                                            Spam o Mensajes No Deseados
                                        </button>
                                        <div className="divider"></div>

                                        <button className="btn-opciones" onClick={() => manejarSeleccionReporte(7, comentarioSeleccionado)}>
                                            Acoso o Discriminación 
                                        </button>
                                        <div className="divider"></div>

                                        <button className="btn-opciones btn-cancelar" onClick={cerrarModalReportar}>
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
                                            Enviar Reporte
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
    );
};
