import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; 
import img from '../../resources/fondo.png';
import '../../styles/candidato/miperfil.css';
import { ModalSeguidosCandidato } from './ModalSeguidosCandidato';
import { ModalDetallesCandidato } from './ModalDetallesCandidato';
import { ModalCalifiaciones, ModalCalificaciones } from './ModalCalificaciones';

export const Seccion1PagePerfilCandidato = ({candidato, actualizarFetch}) => {
    const [numSeguidos, setNumSeguidos] = useState(0);
    const[empresas, setEmpresas]=useState(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [showModalSeguidos, setShowModalSeguidos] = useState(false);
    const [showModalInfo, setShowModalInfo] = useState(false);
    const [calificaciones, setCalificaciones] = useState(null);
    const [promedioCalificacion, setPromedioCalificacion] = useState(null);
    const [showModalCalificaciones, setShowModalCalificaciones] = useState(false);
    const [estadoTemporal, setEstadoTemporal] = useState(candidato.Estado_Cuenta);
    const [isLoading, setIsLoading] = useState(false); 

    // Función para obtener datos del backend
    const fetchData = useCallback(async () => {
        try {
            const seguidosResponse = await fetch('https://www.codemx.net/codemx/backend/candidato/obtener_seguidos.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idCandidato: candidato.id }),
            });

            if (!seguidosResponse.ok) {
                throw new Error('Error al obtener los datos');
            }
            const seguidosData = await seguidosResponse.json();

            // Fetch para obtener la calificacion del candidato
            const califiacionResponse = await fetch(
                'https://www.codemx.net/codemx/backend/candidato/obtener_calificaciones_candidato.php',
                {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idCandidato: candidato.id}),
                }
            );
    
            if (!califiacionResponse.ok) {
                const errorDataCalificacion = await califiacionResponse.json();
                throw new Error(errorDataCalificacion.error || 'Error desconocido al obtener estado del candidato');
            }
    
            const califiacionData = await califiacionResponse.json();

            // Actualizar estados
            setNumSeguidos(seguidosData.cantidad);
            setEmpresas(seguidosData.empresas);
            setCalificaciones(califiacionData.calificaciones);
            setPromedioCalificacion(califiacionData.promedio);
        } catch (error) {
            console.error('Error al obtener los datos:', error);
        }
    }, [candidato.id]); // Dependencia: candidato.id

    useEffect(() => {
        fetchData();
    }, [fetchData]); 


    const manejarShowModalSeguidos = () => {
      setShowModalSeguidos(true);
    };

    const manejarCloseModalSeguidos = async () => {
        setShowModalSeguidos(false);
        fetchData();
    };

    const manejarShowModalInfo = () => {
        setShowModalInfo(true);
    };

    const manejarCloseModalInfo = async () => {
        setShowModalInfo(false);
    };

    const toggleMenu = () => {
      setMenuVisible(!menuVisible);
    };
    
    const cambiarEstatus = async (estado) => {
        if (isLoading) return;
        setIsLoading(true);
        setEstadoTemporal(estado);
        try {
            const response = await fetch("https://www.codemx.net/codemx/backend/admin/cambiar_estado.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                idCandidato: candidato.id,
                nuevoEstado: estado 
            }),
            });

            const result = await response.json();

            if (result.success) {
            actualizarFetch();
            } else {
            console.error("Error al cambiar estado:", result.message);
            }
        } catch (error) {
            console.error("Error en la petición:", error);
        } finally {
            setIsLoading(false);
        }
    };

  return (
     <div className="perfil-container-candidato">
            {/* Fondo de encabezado */}
            <div className="perfil-header-candidato position-relative">
                <img src={img} alt="Fondo" className="img-fluid rounded-top" />
                {/* Boton-repsonsive */}
                <div className="boton-perfil-candidato " onClick={toggleMenu}>
                    <i className="fa-solid fa-ellipsis ms-auto"></i>
                </div>
                {menuVisible && (
                <div className="modal-overlay-opciones-perfil" onClick={toggleMenu}>
                    <div className="modal-content-opciones-perfil" onClick={(e) => e.stopPropagation()}>
                        <button className="btn-opciones" onClick={() => manejarShowModalInfo()}>
                            Ver Información
                        </button>
                        <div className="divider"></div>
                        <div className="divider"></div>
                        <button className="btn-opciones btn-cancelar"  onClick={toggleMenu}>
                            Cancelar    
                        </button>
                    </div>
                </div>
            )}
            </div>
    
            <div className="perfil-candidato">
                {/* Información del usuario */}
                <div className="perfil-body-candidato py-3 px-2">
                    <div className="d-flex flex-column flex-md-row justify-content-between ">
                        {/* Foto de perfil */}
                        <div className="foto-perfil-container-candidato mb-3 mb-md-0">
                            {candidato.fotografia && (
                                <img
                                    src={`${candidato.fotografia}?t=${new Date().getTime()}`}
                                    alt="Perfil"
                                    className="foto-perfil-candidato rounded-circle"
                                />
                            )}
                        </div>

                    </div>
    
                    {/* Detalles del usuario */}
                    <div className="datos-container-candidato">
                        <div className='d-flex align-items-center gap-3 mt-2 mb-2'>
                            <h2>{`${candidato.nombre} ${candidato.apellido}`}</h2>

                            <div className='contenedor-prom d-flex align-items-center gap-1' onClick={() => setShowModalCalificaciones(true)}>
                                <h4 className='text-muted'>{promedioCalificacion}</h4>
                                <i
                                    className={`fa fa-star text-warning`}
                                    aria-hidden="true"
                                    style={{ cursor: 'pointer' }}
                                ></i>
                            </div>
                    
                        </div>
                        
                        {candidato.universidad !== "Otra" &&
                            candidato.universidad !== "No estudio" && (
                                <p className="text-muted">{`Estudiante de ${candidato.universidad}`}</p>
                            )}
                        <p
                            className="text-highlight mt-2 mb-2"
                            onClick={() => manejarShowModalSeguidos()}
                        >{`Siguiendo: ${numSeguidos}`}</p>
    

                        {/* Botones */}
                        <div className="botones-perfil-candidato d-flex gap-2 mt-2">
                            <button
                                className={`btn ${estadoTemporal == "1" ? 'btn-tipodos' : 'btn-tipouno'} btn-sm`}
                                onClick={() => cambiarEstatus(estadoTemporal == "1" ? 0 : 1)}
                                disabled={isLoading}
                            >
                                {isLoading
                                    ? 'Cargando...'
                                    : estadoTemporal == "1"
                                    ? 'Desactivar Cuenta'
                                    : 'Activar Cuenta'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Seguidos */}
            {showModalSeguidos && (
                <div className="modal-overlay" onClick={() => manejarCloseModalSeguidos()}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-button btn" onClick={() => manejarCloseModalSeguidos()}>
                                <i className="fa-solid fa-x"></i>
                        </button>
                        <ModalSeguidosCandidato empresas={empresas}/>
                    </div>
                </div>
            )}
    
            {/* Modal Info */}
            {showModalInfo && (
                <div className="modal-overlay" onClick={() => manejarCloseModalInfo()}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-button btn" onClick={() => manejarCloseModalInfo()}>
                            <i className="fa-solid fa-x"></i>
                        </button>
                        <ModalDetallesCandidato candidato={candidato} manejarCloseModalForm={manejarCloseModalInfo}/>
                    </div>
                </div>
            )}

            {/* Modal Calificaciones */}
            {showModalCalificaciones && (
                <div className="modal-overlay" onClick={() => setShowModalCalificaciones(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-button btn" onClick={() => setShowModalCalificaciones(false)}>
                            <i className="fa-solid fa-x"></i>
                        </button>
                        <ModalCalifiaciones calificaciones={calificaciones}/>
                    </div>
                </div>
            )}
        
    
    
        </div>
  )
}
