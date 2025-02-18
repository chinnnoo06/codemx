import React, { useState, useEffect, useCallback } from 'react';
import img from '../../resources/fondo.png';
import '../../styles/empresa/miperfil.css';
import { ModalSeguidoresPerfilEmpresa } from './ModalSeguidoresPerfilEmpresa';
import { ModalDetallesEmpresa } from './ModalDetallesEmpresa';

export const Seccion1PagePerfilEmpresa = ({ empresa, numPublicaciones }) => {
    const [showModalSeguidores, setShowModalSeguidores] = useState(false);
    const [numSeguidores, setNumSeguidores] = useState(0);
    const [numVacantes, setNumVacantes] = useState(0);
    const[seguidores, setSeguidores]=useState(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [showModalInfo, setShowModalInfo] = useState(false);

    // Función para obtener datos del backend
    const fetchData = useCallback(async () => {
        try {
            const Response = await fetch('https://www.codemx.net/codemx/backend/empresa/obtener_seguidores_vacantes.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idEmpresa: empresa.id }),
            });

            if (!Response.ok) {
                throw new Error('Error al obtener los datos');
            }
            const responseData= await Response.json();
            // Actualizar estados
            setNumSeguidores(responseData.cantidadSeguidores);
            setNumVacantes(responseData.cantidadVacantes);
            setSeguidores(responseData.seguidores)
        } catch (error) {
            console.error('Error al obtener los datos de seguidores y vacanets:', error);
        }
    }, [empresa.id]); 

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const manejarShowModalSeguidores = () => {
        setShowModalSeguidores(true);
    };

    const manejarCloseModalSeguidores = async () => {
        setShowModalSeguidores(false);
        fetchData();
    };

    const toggleMenu = () => {
      setMenuVisible(!menuVisible);
    };

    const manejarShowModalInfo = () => {
        setShowModalInfo(true);
    };

    const manejarCloseModalInfo = async () => {
        setShowModalInfo(false);
    };
    
  return (
     <div className="perfil-container-empresa">
             {/* Fondo de encabezado */}
            <div className="perfil-header-empresa position-relative">
                <img src={img} alt="Fondo" className="img-fluid rounded-top" />
                {/* Boton-repsonsive */}
                <div className="boton-perfil-empresa " onClick={toggleMenu}>
                     <i className="fa-solid fa-ellipsis ms-auto"></i>
                </div>
                {/* Menú desplegable para pantallas pequeñas */}
                {menuVisible && (
                    <div className="modal-overlay-opciones-perfil" onClick={toggleMenu}>
                        <div className="modal-content-opciones-perfil" onClick={(e) => e.stopPropagation()}>
                            <button className="btn-opciones" onClick={() => manejarShowModalInfo()}>
                                Ver Información
                            </button>
                            <div className="divider"></div>
                            <button className="btn-opciones btn-cancelar"  onClick={toggleMenu}>
                                Cancelar    
                            </button>
                        </div>
                    </div>
                )}
            </div>
     
             <div className="perfil-empresa">
                 {/* Información del usuario */}
                 <div className="perfil-body-empresa py-3 px-2">
                     <div className="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-start">
                         {/* Foto de perfil */}
                         <div className="foto-perfil-container-empresa mb-3 mb-md-0">
                             {empresa.logo && (
                                 <img
                                     src={`${empresa.logo}?t=${new Date().getTime()}`}
                                     alt="Perfil"
                                     className="foto-perfil-empresa rounded-circle"
                                 />
                             )}
                         </div>
    
                          
                         {/* Estadisticas*/}
                         <div className="estadisticas-perfil-empresa d-flex  gap-4  ">
                            <div className='d-flex flex-column align-items-center'  onClick={() => manejarShowModalSeguidores()}>
                                <p className='text-highlight'>{`${numSeguidores}`}</p>
                                <p >Seguidores</p> 
                            </div>
           
                            <div className='d-flex flex-column align-items-center'>
                                <p className='text-highlight'>{`${numVacantes}`}</p>
                                <p >Vacantes</p>
                            </div>
    
                            <div className='d-flex flex-column align-items-center'>
                                <p className='text-highlight'>{`${numPublicaciones}`}</p>
                                <p >Publicaciones</p>
                            </div>
    
                         </div>
    
                     </div>
     
                     {/* Detalles del usuario */}
                     <div className="datos-container-empresa mt-2">
                         <h2 >{`${empresa.nombre}`}</h2>
                         <p className='text-muted mt-2 mb-2'>{`${empresa.descripcion}`}</p>
                         <p className='text-muted mt-2 mb-2' >Especializados en el sector de {`${empresa.sector}`}</p>
                         <p className='text-muted mt-2 mb-2'>Somos una empresa denominda "{`${empresa.tamanio}`}"</p>
                         <p className='text-muted mt-2 mb-2'>Fundada el {`${empresa.fecha_creacion}`}</p>
    
    
                     </div>
                 </div>
             </div>
    
    
            {/* Modal Seguidores */}
            {showModalSeguidores && (
                <div className="modal-overlay" onClick={() => manejarCloseModalSeguidores()}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-button btn" onClick={() => manejarCloseModalSeguidores()}>
                                <i className="fa-solid fa-x"></i>
                        </button>
                        <ModalSeguidoresPerfilEmpresa seguidores={seguidores}/>
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
                        <ModalDetallesEmpresa empresa={empresa} manejarCloseModalForm={manejarCloseModalInfo}/>
                    </div>
                </div>
            )}

     
     
        </div>
  )
}
