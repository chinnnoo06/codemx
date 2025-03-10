import React, { useState, useEffect, useCallback } from 'react';
import img from '../../resources/fondo.png';
import '../../styles/candidato/miperfil.css';
import { ModalEditarPerfil } from './ModalEditarPerfil';
import CryptoJS from "crypto-js";
import { ModalSeguidos } from './ModalSeguidos';

export const Seccion1PageMiPerfil = ({ candidato }) => {
    const [showModalSeguidos, setShowModalSeguidos] = useState(false);
    const [showModalForm, setShowModalForm] = useState(false);
    const [numSeguidos, setNumSeguidos] = useState(0);
    const[empresas, setEmpresas]=useState(null);
    const [menuVisible, setMenuVisible] = useState(false);

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

            // Actualizar estados
            setNumSeguidos(seguidosData.cantidad);
            setEmpresas(seguidosData.empresas);
        } catch (error) {
            console.error('Error al obtener los datos de seguidores:', error);
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
        formData.append('idCandidato', candidato.id);
        formData.append('fotografia', file);
    
        try {
            const response = await fetch(
                'https://www.codemx.net/codemx/backend/candidato/actualizar_foto_perfil_candidato.php',
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
    <div className="perfil-container-candidato">
        {/* Fondo de encabezado */}
        <div className="perfil-header-candidato position-relative">
            <img src={img} alt="Fondo" className="img-fluid rounded-top" />
            {/* Boton-repsonsive */}
            <div className="boton-perfil-candidato" onClick={toggleMenu}>
                <i className="fa-solid fa-ellipsis ms-auto"></i>
            </div>
            {menuVisible && (
                <div className="modal-overlay-opciones-perfil" onClick={toggleMenu}>
                    <div className="modal-content-opciones-perfil" onClick={(e) => e.stopPropagation()}>
                        <button className="btn-opciones" onClick={() => manejarShowModalForm()}>
                            Actualizar Información
                        </button>
                        <div className="divider"></div>
                        <button className="btn-opciones" onClick={() => manejarCerrarSesion()}>
                            Cerrar Sesión
                        </button>
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
                        <label htmlFor="photoInput" className="btn btn-tipodos perfilfoto-edit-btn-candidato">
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
                </div>

                {/* Detalles del usuario */}
                <div className="datos-container-candidato ">
                    <h2 className='mt-2 mb-2'>{`${candidato.nombre} ${candidato.apellido}`}</h2>
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
                        {candidato.cv && (
                            <>
                                <a href={`${candidato.cv}?t=${new Date().getTime()}`} target="_blank" rel="noopener noreferrer" >
                                    <button className='btn btn-tipodos btn-sm'>
                                        Ver CV
                                    </button>
                                </a>
                            </>
                        )}
                    </div>
                </div>

            </div>
        </div>

        {/* Modal Seguidos */}
        {showModalSeguidos && (
            <div className="modal-overlay" onClick={() => manejarCloseModalForm()}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <button className="close-button btn" onClick={() => manejarCloseModalSeguidos()}>
                            <i className="fa-solid fa-x"></i>
                    </button>
                    <ModalSeguidos empresas={empresas} idCandidato={candidato.id} />
                </div>
            </div>
        )}

        {/* Modal Form */}
        {showModalForm && (
            <div className="modal-overlay" onClick={() => manejarCloseModalForm()}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <button className="close-button btn" onClick={() => manejarCloseModalForm()}>
                        <i className="fa-solid fa-x"></i>
                    </button>
                    <ModalEditarPerfil candidato={candidato} manejarCloseModalForm={manejarCloseModalForm}/>
                </div>
            </div>
        )}


    </div>

    
  );
};
