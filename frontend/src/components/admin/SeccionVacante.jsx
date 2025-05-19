import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../../styles/empresa/vacante.css';
import { ModalTecnologiasRequeridas } from './ModalTecnologiasRequeridas';
import LoadingSpinner from '../LoadingSpinner';

export const SeccionVacante = ({vacante, manejarOcultarSeccionVacante, actualizarFetch}) => {
    const [requisitos, setRequisitos] = useState([]);
    const [responsabilidades, setResponsabilidades] = useState([]);
    const [candidatos, setCandidatos] = useState([]);
    const [seccionActiva, setSeccionActiva] = useState("detalle-vacante");
    const [showModalOpciones, setShowModalOpciones] = useState(false);
    const [showModalConfirmacion, setShowModalConfirmacion] = useState(false);
    const [showModalTecnologias, setShowModalTecnologias] = useState(false);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true); 
    const [categorias, setCategorias] = useState({});

    const navigate = useNavigate(); // Hook para redirigir a otra página


    // Función para obtener datos del backend
    const fetchData = useCallback(async () => {
        try {
            const Response = await fetch('https://www.codemx.net/codemx/backend/empresa/obtener_requisitos_responsabilidades_vacante.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idVacante: vacante.ID }),
            });
    
            if (!Response.ok) {
                const errorData = await Response.json();
                throw new Error(errorData.error || 'Error desconocido');
            }
            const responseData = await Response.json();
    
            // Actualizar estados
            setRequisitos(responseData.requisitos);
            setResponsabilidades(responseData.responsabilidades);
    
            const ResponseCandidatos = await fetch('https://www.codemx.net/codemx/backend/empresa/obtener_candidatos_vacante.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idVacante: vacante.ID }),
            });
    
            if (!ResponseCandidatos.ok) {
                const errorDataCandidato = await ResponseCandidatos.json();
                throw new Error(errorDataCandidato.error || 'Error desconocido');
            }
            const responseDataCandidatos = await ResponseCandidatos.json();
    
            setCandidatos(responseDataCandidatos.candidatos);
    
            const ResponseTecnologiasRequeridas = await fetch('https://www.codemx.net/codemx/backend/empresa/obtener_tecnologias_vacante.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idVacante: vacante.ID }),
            });
    
            if (!ResponseTecnologiasRequeridas.ok) {
                const errorDataTecnologiasRequeridas = await ResponseTecnologiasRequeridas.json();
                throw new Error(errorDataTecnologiasRequeridas.error || 'Error desconocido');
            }
            const responseDataTecnologiasRequeridas = await ResponseTecnologiasRequeridas.json();
    
            // Actualizar el estado de las tecnologías
            const tecnologiasDataTecnologiasRequeridas = responseDataTecnologiasRequeridas.tecnologias_requeridas;
    
            // Agrupar las tecnologías por categoría
            const categoriasAgrupadas = tecnologiasDataTecnologiasRequeridas.reduce((acc, tecnologia) => {
                const { categoria_tecnologia } = tecnologia;
                if (!acc[categoria_tecnologia]) {
                    acc[categoria_tecnologia] = [];
                }
                acc[categoria_tecnologia].push(tecnologia);
                return acc;
            }, {});
    
            // Actualizamos el estado
            setCategorias(categoriasAgrupadas);
            setIsLoading(false);
    
        } catch (error) {
            console.error('Error al obtener los requisitos y requerimientos de la vacante:', error);
            setIsLoading(false);
        }
    }, [vacante.ID]);

    // Llamamos a fetchData en useEffect
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    

    const manejarShowModalOpciones = () => {
        setShowModalOpciones(true);
    };

    const manejarCloseModalOpciones = () => {
        setShowModalOpciones(false);
    };


    const manejarShowModalConfirmacion = () => {
        setShowModalConfirmacion(true);
        setShowModalOpciones(false);
    };

    const manejarCloseModalConfirmacion = () => {
        setShowModalConfirmacion(false);
        setShowModalOpciones(true);
    };

    const eliminarVacante = async () => {
        if (isLoading) return;
        setIsLoading(true);

        console.log(vacante.ID, vacante.Empresa_ID, vacante.Empresa_Nombre, vacante.Titulo, vacante.Empresa_Email)
        try {
            const response = await fetch("https://www.codemx.net/codemx/backend/admin/eliminar_vacante.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ idVacante: vacante.ID, idEmpresa: vacante.Empresa_ID, nombreEmpresa: vacante.Empresa_Nombre, nombreVacante: vacante.Titulo, emailEmpresa: vacante.Empresa_Email}),
            });
    
            const result = await response.json();
    
            if (result.success) {
                actualizarFetch(); 
                manejarOcultarSeccionVacante("vacantes");
                window.location.reload();

            } else {
                console.error("Error al eliminar vacante:", result.error || result.message || "Error desconocido");

            }
        } catch (error) {
            console.error("Error en la petición:", error);
        }finally {
            setIsLoading(false);
        }

    };

    // Función para filtrar seguidores
    const buscar = (searchQuery) => {
        setQuery(searchQuery);
    };

    const usuariosFiltrados = candidatos.filter((candidato) =>
        `${candidato.Nombre} ${candidato.Apellido}`.toLowerCase().includes(query.toLowerCase())
    );

    // Función para redirigir al perfil del candidato
    const irAlPerfil = (idCandidato) => {
        navigate(`/usuario-administrador/perfil-candidato`, { 
            state: { idCandidato: idCandidato }
        });
    };

    if (isLoading) {
        return <LoadingSpinner></LoadingSpinner> 
    }

    return (
        <div> 

            {seccionActiva == "detalle-vacante" && (
                <>
                    <div className='boton d-flex align-items-center '>
                        <button className="btn-volver-vacantes d-flex align-items-center" onClick={() => manejarOcultarSeccionVacante()}>
                            <i className="fa-solid fa-arrow-left me-2"></i> Volver a vacantes
                        </button>
                    </div>
                    <div className='vacante-detalle d-flex flex-column pt-3 pb-3'>
                        <div className='informacion-principal d-flex align-items-center mb-4'>
                
                            <div className='fila-info-vacante w-100'>
                                <div className='d-flex justify-content-between align-items-start'>
                                    <h3 className='titulo-vacante'>{vacante.Titulo}</h3>
                                    <div className="boton-opciones-vacante" onClick={manejarShowModalOpciones}>
                                        <i className="fa-solid fa-ellipsis ms-auto"></i>
                                    </div>
                                </div>
                                
                                <h5 className='nombre-empresa'>{vacante.Empresa_Nombre}</h5>

                                <div className='datos-vacante d-flex'>
                                    <span className='estado-vacante text-muted'>{vacante.Estado_Vacante}, México</span>
                                    <span className='direccion-vacante text-muted'>{vacante.Ubicacion}</span>
                                    <span className='modalidad-vacante text-muted'>({vacante.Modalidad_Vacante})</span>

                                </div>

                                <div className="datos2-vacante mt-2 d-flex gap-3">
                                    <div className='tecnologias-requeridas'  onClick={() => setShowModalTecnologias(true)}>
                                        <i className="fa-solid fa-list-check me-2"></i>
                                        <span>Tecnologías requeridas</span>
                                    </div>
                                    <span className='fechaLimite-vacante text-muted'>Fecha Limite: {vacante.Fecha_Limite}</span>
                                    {vacante.Estatus === "activa" && (<span className='estatus-vacante text-muted'>Activa</span>)}
                                    {vacante.Estatus === "inactiva" && (<span className='estatus-vacante text-muted'>Inactiva</span>)}

                                </div>
                            </div>
                        </div>

                        <div className='informacion-detallada'>
                            <div className='descripcion-vacante mb-4'>
                                <h5 className='subtitulo'>Descripción de la vacante</h5>
                                <span className='text-muted'>{vacante.Descripcion}</span>
                            </div>

                            <div className='row'>
                                <div className='requisitos col-md-6 mb-4'>
                                    <h5 className='subtitulo'>Responsabilidades de la vacante</h5>
                                    <ul className="text-muted">
                                        {responsabilidades.map((responsabilidad, index) => (
                                            <li key={index}>{responsabilidad.Responsabilidad}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className='responsabilidades col-md-6 mb-4'>
                                    <h5 className='subtitulo'>Requisitos de la vacante</h5>
                                    <ul className="text-muted">
                                        {requisitos.map((requisito, index) => (
                                            <li key={index}>{requisito.Requerimiento}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className='postulados-vacante mb-4'>
                                <h5 className='subtitulo mb-3'><i className="fa-solid fa-users me-2"></i> {vacante.Cantidad_Postulados} Postulados</h5>
                                {/* Barra de búsqueda */}
                                <div className="input-group mb-4 position-relative">
                                <span className="search-icon position-absolute top-50 start-0 translate-middle-y ms-2 text-muted">
                                    <i className="fa fa-search"></i>
                                </span>
                                <input
                                    type="text"
                                    name="query"
                                    placeholder="Buscar Usuario"
                                    className="form-control rounded input-busqueda"
                                    value={query}
                                    onChange={(e) => buscar(e.target.value)}
                                />
                                </div>
                        
                                {/* Lista de seguidores */}
                                <div className="usuario-postulado-list">
                                    {usuariosFiltrados && usuariosFiltrados.length > 0 ? (
                                        usuariosFiltrados.map((candidato) => {
                                            const nombreCompleto = `${candidato.Nombre} ${candidato.Apellido}`;
                                            return (
                                                <div
                                                    key={candidato.ID}
                                                    onClick={() => irAlPerfil(candidato.ID)}
                                                    className="usuario-postulado-item d-flex align-items-center mb-3"
                                                >
                                                    <img
                                                        src={candidato.Fotografia}
                                                        alt={candidato.Nombre}
                                                        className="usuario-postulado-foto rounded-circle me-3"
                                                    />
                                                    <span className="usuario-postulado-nombre">{nombreCompleto}</span>          
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p>La vacante no tiene postulados</p>
                                    )}
                                </div>
                            </div>

                
                        </div>
                    </div>

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
                    
                                <p>¿Seguro que quieres eliminar la vacante?</p>

                                <div className="d-flex justify-content-between mt-3">
                                <button
                                    className="btn btn-tipodos btn-sm"
                                    onClick={() => manejarCloseModalConfirmacion()}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn btn-danger btn-sm"
                                onClick={() => eliminarVacante()}
                                >
                                        {isLoading ? 'Cargando...' : 'Confirmar'}
                                </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/*Modal Confirmacion*/}
                    {showModalTecnologias && (
                        <div className="modal-overlay" onClick={() => setShowModalTecnologias(false)}>
                            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                <button className="close-button btn" onClick={() => setShowModalTecnologias(false)}>
                                        <i className="fa-solid fa-x"></i>
                                </button>
                                <ModalTecnologiasRequeridas categorias={categorias}></ModalTecnologiasRequeridas>
                            </div>
                        </div>
                    )}

                </>
            )} 

            
            

        </div>
      
    );
};
