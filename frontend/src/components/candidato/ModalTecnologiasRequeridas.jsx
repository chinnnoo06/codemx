import React, { useState, useEffect, useCallback } from 'react';

export const ModalTecnologiasRequeridas = ({ tecnologiasRequeridas, categorias, idCandidato }) => {
    const [tecnologiasDominadas, setTecnologiasDominadas] = useState([]);
    
    const fetchData = useCallback(async () => {
        try {
            // Fetch para obtener tecnologías dominadas
            const tecnologiasDominadasResponse = await fetch(
                'https://www.codemx.net/codemx/backend/candidato/obtener_tecnologias_dominadas.php',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({idCandidato}),
                }
            );

            if (!tecnologiasDominadasResponse.ok) {
                const errorDataTecnologiasDominadas = await tecnologiasDominadasResponse.json();
                throw new Error(errorDataTecnologiasDominadas.error || 'Error desconocido al obtener tecnologías dominadas');
            }

            const tecnologiasDominadasData = await tecnologiasDominadasResponse.json();
            setTecnologiasDominadas(tecnologiasDominadasData.tecnologias_dominadas);
        } catch (error) {
            // Manejo de errores
            console.error('Error al obtener los datos:', error);
        }
    }, [idCandidato]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filtramos las tecnologías requeridas por la vacante que el candidato también domina
    const tecnologiasCoincidentes = tecnologiasRequeridas.filter(tecnologia =>
        tecnologiasDominadas.some(dominada => dominada.id_tecnologia === tecnologia.id_tecnologia)
    );

    return (
        <div className="container container-modal">
            <h5 className="mb-3 text-center titulo-modal">Tecnologías Requeridas</h5>

            <p className='texto-modal-tecnologias-requeridas text-muted'>
                Las tecnologías mostradas son las que requeridas por la vacante, entre más tecnologías coincidan con las que usted domina, mayor será la coincidencia y tendrá más posibilidades de ser contactado.
            </p>

            {/* Mostrar cuántas tecnologías coinciden */}
            {tecnologiasCoincidentes.length > 0 ? (
                <p className='texto-modal-tecnologias-requeridas text-muted'>{tecnologiasCoincidentes.length} tecnologías coinciden con las requeridas para esta vacante.</p>
            ) : (
                <p className='texto-modal-tecnologias-requeridas text-muted'>No hay tecnologías dominadas que coincidan con las requeridas para esta vacante.</p>
            )}

            {/* Tecnologías coincidencias */}
            {tecnologiasCoincidentes.length > 0 ? (
                <div className="tecnologias-coincidentes d-flex gap-2 mt-2 mb-4">
                    {tecnologiasCoincidentes.map((tecnologia) => (
                    <span className="technology-tag" key={tecnologia.id_tecnologia}>{tecnologia.nombre_tecnologia}</span>
                    ))}
                </div>
            ) : null}

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
