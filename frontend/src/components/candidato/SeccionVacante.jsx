import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../../styles/empresa/vacante.css';
import { ModalTecnologiasRequeridas } from './ModalTecnologiasRequeridas';
import LoadingSpinner from '../LoadingSpinner';

 
export const SeccionVacante = ({idCandidato, vacante, manejarOcultarSeccionVacante, setVacanteSeleccionada, actualizarFetch}) => {
    const [requisitos, setRequisitos] = useState([]);
    const [responsabilidades, setResponsabilidades] = useState([]);
    const [candidatos, setCandidatos] = useState([]);
    const [showModalOpciones, setShowModalOpciones] = useState(false);
    const [showModalTecnologias, setShowModalTecnologias] = useState(false);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true); 
    const [tecnologiasRequeridas, setTecnologiasRequeridas] = useState([]);
    const [categorias, setCategorias] = useState({});
    const [estadoCandidato, setEstadoCandidato] = useState(null);
    const [vacanteGuardada, setVacanteGuardada] = useState(false);
    const [showModalDenuncia, setShowModalDenuncia] = useState(false);
    const [pasoReporte, setPasoReporte] = useState(1); // 1: Selección, 2: Descripción
    const [motivoSeleccionado, setMotivoSeleccionado] = useState("");
    const [descripcionReporte, setDescripcionReporte] = useState("");

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
            setTecnologiasRequeridas(tecnologiasDataTecnologiasRequeridas);
            setCategorias(categoriasAgrupadas);


            // Fetch para obtener el estado del candidato
            const estadoResponse = await fetch(
                'https://www.codemx.net/codemx/backend/empresa/obtener_estado_candidato.php',
                {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idCandidato, idVacante: vacante.ID }),
                }
            );
    
            if (!estadoResponse.ok) {
                const errorDataEstado = await estadoResponse.json();
                throw new Error(errorDataEstado.error || 'Error desconocido al obtener estado del candidato');
            }
    
            const estadoData = await estadoResponse.json();
    
            // Guardamos las tecnologías dominadas por el candidato y el estado del candidato
            setEstadoCandidato(estadoData.estado_candidato);

            // Fetch para obtener el estado del candidato
            const vacanteGuardadaResponse = await fetch(
                'https://www.codemx.net/codemx/backend/candidato/obtener_estado_vacante_guardada.php',
                {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idCandidato: idCandidato, idVacante: vacante.ID }),
                }
            );
    
            if (!vacanteGuardadaResponse .ok) {
                const errorDataVacanteGuardada = await vacanteGuardadaResponse .json();
                throw new Error(errorDataVacanteGuardada.error || 'Error desconocido al obtener si la vacante esta guardada o no por el candidato');
            }
    
            const vacanteGuardadaData = await vacanteGuardadaResponse.json();
    
            // Guardamos las tecnologías dominadas por el candidato y el estado del candidato
            setVacanteGuardada(vacanteGuardadaData);

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

    // Función para filtrar seguidores
    const buscar = (searchQuery) => {
        setQuery(searchQuery);
    };

    const usuariosFiltrados = candidatos.filter((candidato) =>
        `${candidato.Nombre} ${candidato.Apellido}`.toLowerCase().includes(query.toLowerCase())
    );

    
    const cambiarEstadoVacanteGuardada = async () => {
        try {
            const response = await fetch("https://www.codemx.net/codemx/backend/candidato/cambiar_estado_vacante_guardada.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ idCandidato, idVacante: vacante.ID }),
            });

            const result = await response.json();

            if (result.success) {
                setVacanteGuardada((prevState) => !prevState);  // Cambiar estado
                actualizarFetch();
            } else {
                console.error("Error al guardar o desguardar la vacante:", result.message);
            }
        } catch (error) {
            console.error("Error en la petición:", error);
        } 
    };

    const postularse = async () => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const response = await fetch("https://www.codemx.net/codemx/backend/candidato/postularse_vacante.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ idCandidato, idVacante: vacante.ID }),
            });

            const result = await response.json();

            if (result.success) {
                fetchData();
                vacante.Cantidad_Postulados = parseInt(vacante.Cantidad_Postulados, 10); // Convertimos a número
                vacante.Cantidad_Postulados += 1;
                setVacanteSeleccionada(vacante); 

                actualizarFetch(); 
            } else {
                console.error("Error al guardar o desguardar la vacante:", result.message);
            }
        } catch (error) {
            console.error("Error en la petición:", error);
        } finally {
            setIsLoading(false);
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
                    idVacante: vacante.ID,
                    idDenunciante: idCandidato, 
                    idDenunciado: vacante.Empresa_ID,
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
    const irAlPerfil = (idCandidato) => {
        navigate(`/usuario-candidato/perfil-candidato`, { 
            state: { idCandidato: idCandidato }
        });
    };

    if (isLoading) {
        return <LoadingSpinner></LoadingSpinner> 
    }

    return (
        <div> 
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
                        <div className='postularse-guardar d-flex align-items-center gap-4 mt-2'>
                            {estadoCandidato != null ?(
                                <div className='btn-estado-postulacion'>
                                    {estadoCandidato}
                                </div>
                            ) : (
                                <button className='btn btn-tipouno btn-sm' onClick={postularse}>
                                    {isLoading ? 'Cargando...' : 'Postularse'}
                                </button>
                            )}
                
                            {vacanteGuardada == false ?(
                                <i className="fa-regular fa-bookmark icono-guardar" onClick={cambiarEstadoVacanteGuardada}></i>
                            ): (
                                <i className="fa-solid fa-bookmark icono-guardar" onClick={cambiarEstadoVacanteGuardada}></i>
                            )}
                            
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
                <div className="modal-overlay-opciones">
                    <div className="modal-content-opciones" onClick={(e) => e.stopPropagation()}>
                        <div className="botones d-flex flex-column align-items-center">
        
                            <button className="btn-opciones btn-eliminar" onClick={() => manejarShowModalDenuncia()}>
                                Reportar
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
            {showModalTecnologias && (
                <div className="modal-overlay" onClick={() => setShowModalTecnologias(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-button btn" onClick={() => setShowModalTecnologias(false)}>
                                <i className="fa-solid fa-x"></i>
                        </button>
                        <ModalTecnologiasRequeridas tecnologiasRequeridas={tecnologiasRequeridas} categorias={categorias} idCandidato={idCandidato}></ModalTecnologiasRequeridas>
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
                                        ¿Por qué quieres reportar esta vacante?
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

                                        <button className="btn-opciones" onClick={() => manejarSeleccionReporte(6)}>
                                            Oferta de Empleo Inexistente o Fradulenta
                                        </button>
                                        <div className="divider"></div>

                                        <button className="btn-opciones" onClick={() => manejarSeleccionReporte(7)}>
                                            Conducta Profesional No Ética
                                        </button>
                                        <div className="divider"></div>

                                        <button className="btn-opciones" onClick={() => manejarSeleccionReporte(8)}>
                                            Acoso Laboral o Sexual
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

        </div>
      
    );
};
