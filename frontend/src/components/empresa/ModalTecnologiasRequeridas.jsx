import React, { useState, useEffect } from 'react';

export const ModalTecnologiasRequeridas = ({ categorias }) => {

    return (
        <div className="container container-modal">
            <h5 className="mb-3 text-center titulo-modal">Tecnologías Requeridas</h5>

            <p className='texto-modal-tecnologias-requeridas text-muted'>
                El siguiente listado de tecnologías se utilizan para hacer match con las habilidades de los candidatos, entre más coincidencias haya entre las tecnologías requeridas por la vacante y las dominadas por el usuario, mayor será la recomendación para el candidato, porque significa que es una vacante que se adapta a sus habilidades.
            </p>

            {Object.keys(categorias).length > 0 ? (
                Object.keys(categorias).map((categoria) => (
                    <div key={categoria} className="categoria-tecnologia mb-4">
                        <div className="d-flex mb-2">
                            <h6 className="categoria-titulo">{categoria}</h6>
                        </div>
                        <ul>
                            {categorias[categoria].map((tecnologia) => (
                                <li key={tecnologia.id_tecnologia} className="tecnologia-item d-flex justify-content-between align-items-center mb-2">
                                    <span className="tecnologia-nombre">{tecnologia.nombre_tecnologia}</span>
                                    <i className="fa-solid fa-laptop-code me-2"></i>
                                    
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            ) : (
                <p>No se encontraron tecnologías requeridas.</p>
            )}
        </div>
    );
};
