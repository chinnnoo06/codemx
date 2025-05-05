import React, { useState } from 'react';

export const ModalCalifiaciones = ({ calificaciones }) => {
    const [showModalOpciones, setShowModalOpciones] = useState(false);
    const [showModalRevision, setShowModalRevision] = useState(false);
    const [descripcionReporte, setDescripcionReporte] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [idCalificacion, setIdCalificacion] = useState(null);

    const manejarShowModalRevision = () => {
        setShowModalRevision(true);
        setShowModalOpciones(false);
    };

    const manejarCloseModalRevision = () => {
        setShowModalRevision(false);
        setShowModalOpciones(false);
    };

    const abrirOpciones = (calificacionID) => {
        setIdCalificacion(calificacionID);
        setShowModalOpciones(true);
    };

    const enviarReporte = async () => {
        if (isLoading) return;
        setIsLoading(true);

        try {
            const response = await fetch("https://www.codemx.net/codemx/backend/candidato/revision_calificacion.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    idCalificacion,
                    descripcion: descripcionReporte
                }),
            });

            const result = await response.json();
            if (result.success) {
                alert("Reporte enviado correctamente.");
                manejarCloseModalRevision();
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

    return (
        <div className="container container-modal">
            <h5 className="mb-3 text-center titulo-modal">Calificaciones del Candidato</h5>
            {calificaciones && calificaciones.length > 0 ? (
                <div className="calificaciones-list">
                    {calificaciones.map((calificacion, index) => (
                        <div key={index} className="calificacion-item mb-3">
                            <div className='header-calificacion d-flex align-items-center '>
                                <img
                                    src={calificacion.Logo}
                                    alt={calificacion.Nombre}
                                    className="usuario-calificacion-foto rounded-circle me-2"
                                />
                                <div className='d-flex flex-column '>
                                    <span className="usuario-calificacion-nombre">{calificacion.Nombre}</span>
                                    <span className="vacante-titulo ">{calificacion.Titulo}</span>
                                </div>
                            </div>

                            <div className="calificacion-info">
                                <p className="comentario-text">{calificacion.Comentario}</p>
                                <div className="stars">{renderStars(calificacion.Calificacion)}</div>
                                <div className="fecha-calificacion text-end small">
                                    <span>{new Date(calificacion.Fecha_Calificacion).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div
                                className="boton-opciones-calificacion"
                                onClick={() => abrirOpciones(calificacion.ID)}
                            >
                                <i className="fa-solid fa-ellipsis ms-auto"></i>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No hay calificaciones disponibles.</p>
            )}

            {/* Modal opciones */}
            {showModalOpciones && (
                <div className="modal-overlay-opciones">
                    <div className="modal-content-opciones" onClick={(e) => e.stopPropagation()}>
                        <div className="botones d-flex flex-column align-items-center">
                            <button className="btn-opciones btn-eliminar" onClick={manejarShowModalRevision}>
                                Solicitar Revisión
                            </button>
                            <div className="divider"></div>
                            <button className="btn-opciones" onClick={() => setShowModalOpciones(false)}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de reporte */}
            {showModalRevision && (
                <div className="modal-overlay-reportar" onClick={manejarCloseModalRevision}>
                    <div className="modal-content-reportar" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-reportar d-flex justify-content-between align-items-center">
                            <span className="modal-title-reportar">Solicitar Revisión</span>
                            <i className="fa-solid fa-x cursor-pointer close-button-reportar" onClick={manejarCloseModalRevision}></i>
                        </div>

                        <div className="modal-body-reportar">
                            <textarea
                                className="form-control text-center"
                                rows="3"
                                placeholder="Añade una descripción"
                                value={descripcionReporte}
                                onChange={(e) => setDescripcionReporte(e.target.value)}
                            ></textarea>

                            <div className="divider"></div>

                            <button className="btn-opciones" onClick={enviarReporte}>
                                {isLoading ? 'Cargando...' : 'Enviar Reporte'}
                            </button>

                            <div className="divider"></div>

                            <button className="btn-opciones btn-cancelar" onClick={manejarCloseModalRevision}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
