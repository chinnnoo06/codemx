import React, { useState } from 'react';

export const ModalCalifiaciones = ({ calificaciones }) => {
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
                        </div>
                    ))}
                </div>
            ) : (
                <p>No hay calificaciones disponibles.</p>
            )}

        </div>
    );
};
