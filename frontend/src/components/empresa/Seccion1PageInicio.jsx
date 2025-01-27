import React, { useState, useEffect, useCallback } from 'react';
import img from '../../resources/fondo.png';
import '../../styles/empresa/miperfil.css';
import CryptoJS from "crypto-js";
import { ModalEditarPerfil } from './ModalEditarPerfil';
import { ModalSeguidores } from './ModalSeguidores';

export const Seccion1PageInicio = ({empresa, numPublicaciones}) => {
    const [showModalSeguidores, setShowModalSeguidores] = useState(false);
    const [showModalForm, setShowModalForm] = useState(false);
    const [numSeguidores, setNumSeguidores] = useState(0);
    const [numVacantes, setNumVacantes] = useState(0);
    const[seguidores, setSeguidores]=useState(null);
    const [menuVisible, setMenuVisible] = useState(false);

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
    }, [empresa.id]); // Dependencia: candidato.id

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

    const manejarShowModalForm = () => {
        setShowModalForm(true);
    };

    const manejarCloseModalForm = async () => {
        setShowModalForm(false);
    };

    const manejarCerrarSesion = async () => {
        const secretKey = process.env.REACT_APP_SECRET_KEY; // Clave secreta definida en tu archivo .env
        const encryptedSessionId = localStorage.getItem("session_id"); // Obtén el session_id cifrado

        if (!encryptedSessionId) {
            console.error("No se encontró el session_id en el localStorage.");
            return;
        }

        // Desencripta el session_id
        const sessionId = CryptoJS.AES.decrypt(encryptedSessionId, secretKey).toString(CryptoJS.enc.Utf8);
        try {
            const response = await fetch("https://www.codemx.net/codemx/backend/config/cerrar_sesion.php", {
                method: "POST",
                body: JSON.stringify({ session_id: sessionId }), 
            });
            const result = await response.json(); 
            if (result.success) {
                alert(result.message); 
                window.location.href = 'https://www.codemx.net/codemx/frontend/build';
            } else {
                alert('Error al cerrar la sesión: ' + result.error);
            }
        } catch (error) {
            alert('Error al comunicarse con el servidor: ' + error.message);
        }
    };
    


    const manejarSubidaFoto = async (file) => {
        const formData = new FormData();
        formData.append('idEmpresa', empresa.id);
        formData.append('logo', file);
    
        try {
            const response = await fetch(
                'https://www.codemx.net/codemx/backend/empresa/actualizar_foto_perfil_empresa.php',
                {
                    method: 'POST',
                    body: formData,
                }
            );
    
            const result = await response.json();
            if (result.success) {
                alert('Foto de perfil subida exitosamente');
                window.location.reload(); // Recarga la página
            } else {
                alert('Error al actualizar la foto:', result.error);
            }
        } catch (error) {
            alert('Error al enviar la solicitud:', error);
        }
    };

    const toggleMenu = () => {
        setMenuVisible(!menuVisible);
    };
      
 return (
     <div className="perfil-container">
         {/* Fondo de encabezado */}
        <div className="perfil-header position-relative">
            <img src={img} alt="Fondo" className="img-fluid rounded-top" />
            {/* Boton-repsonsive */}
            <div className="boton-responsive-perfil " onClick={toggleMenu}>
                <i className="fa-solid fa-gear"></i>
            </div>
            {/* Menú desplegable para pantallas pequeñas */}
            {menuVisible && (
                <div className="opciones-responsive align-items-center">
                    <p onClick={() => manejarShowModalForm()}>Actualizar Información</p>
                    <p onClick={() => manejarCerrarSesion()}>Cerrar Sesión</p>
                </div>
            )}
        </div>
 
         <div className="perfil-empresa">
             {/* Información del usuario */}
             <div className="perfil-body py-3 px-2">
                 <div className="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-start">
                     {/* Foto de perfil */}
                     <div className="foto-perfil-container mb-3 mb-md-0">
                         {empresa.logo && (
                             <img
                                 src={`${empresa.logo}?t=${new Date().getTime()}`}
                                 alt="Perfil"
                                 className="foto-perfil rounded-circle"
                             />
                         )}
                         <label htmlFor="photoInput" className="btn btn-tipodos perfilfoto-edit-btn">
                             <i className="fa-solid fa-camera"></i>
                         </label>
                         <input
                             type="file"
                             id="photoInput"
                             className="d-none"
                             accept=".jpg, .jpeg, .png"
                             onChange={(e) => {
                                 const file = e.target.files[0];
                                 if (file) {
                                     manejarSubidaFoto(file);
                                 }
                             }}
                         />
                     </div>

                      
                     {/* Estadisticas*/}
                     <div className="estadisticas-perfil d-flex  gap-4  ">
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
 
                     {/* Botones */}
                     <div className="botones-perfil d-flex flex-column gap-2 mt-3 mt-md-0">
                         <button
                             className="btn btn-tipodos btn-sm"
                             onClick={() => manejarShowModalForm()}
                         >
                             Actualizar información
                         </button>
                         <button
                             className="btn btn-danger btn-sm"
                             onClick={() => manejarCerrarSesion()}
                         >
                             Cerrar Sesión
                         </button>
                     </div>
                 </div>
 
                 {/* Detalles del usuario */}
                 <div className="datos-container mt-2">
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
            <div className="modal-overlay">
                <div className="modal-content">
                    <button className="close-button btn" onClick={() => manejarCloseModalSeguidores()}>
                            <i className="fa-solid fa-x"></i>
                    </button>
                    <ModalSeguidores seguidores={seguidores} idEmpresa={empresa.id} fetchSeguidores={fetchData}/>
                </div>
            </div>
        )}

        {/* Modal Form */}
        {showModalForm && (
            <div className="modal-overlay">
                <div className="modal-content ">
                    <button className="close-button btn" onClick={() => manejarCloseModalForm()}>
                        <i className="fa-solid fa-x"></i>
                    </button>
                    <ModalEditarPerfil empresa={empresa} manejarCloseModalForm={manejarCloseModalForm}/>
                </div>
            </div>
        )}

 
 
     </div>
 
     
   );
}
