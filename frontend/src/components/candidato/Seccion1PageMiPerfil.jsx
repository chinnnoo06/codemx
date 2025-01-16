import React, { useState, useEffect } from 'react';
import img from '../../resources/fondo.png';
import '../../styles/candidato/miperfil.css';
import { ModalEditarPerfil } from './ModalEditarPerfil';
import CryptoJS from "crypto-js";

export const Seccion1PageMiPerfil = ({ candidato }) => {
    const [showModalSeguidos, setShowModalSeguidos] = useState(false);
    const [showModalForm, setShowModalForm] = useState(false);
    const [numSeguidos, setNumSeguidos] = useState(0);

    useEffect(() => {
        // Función para obtener datos del backend
        const fetchData = async () => {
            try {
                // Fetch para obtener las cuentas que sigue el candidato
                const seguidosResponse = await fetch('https://www.codemx.net/codemx/backend/candidato/obtener_seguidos.php');
                if (!seguidosResponse.ok) {
                    throw new Error('Error al obtener los datos');
                }
                const seguidosData = await seguidosResponse.json();
                console.log('Datos del candidato:', seguidosData); 

                // Actualizar estados
                setNumSeguidos(seguidosData);

            } catch (error) {
                console.error('Error al obtener los datos de seguidores:', error);
            }
            };

            fetchData();
        }, []);

    const manejarShowModalSeguidos = () => {
        setShowModalSeguidos(true);
    };

    const manejarCloseModalSeguidos = async () => {
        setShowModalSeguidos(false);
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

    const manejarSubidaCv = async (file) => {
        const formData = new FormData();
        formData.append('idCandidato', candidato.id);
        formData.append('cv', file);
    
        try {
            const response = await fetch(
                'https://www.codemx.net/codemx/backend/candidato/actualizar_cv_candidato.php',
                {
                    method: 'POST',
                    body: formData,
                }
            );
    
            const result = await response.json();
            if (result.success) {
                window.location.reload(); // Recarga la página
                alert('CV subido exitosamente');
;
            } else {
                alert('Error al actualizar el cv:', result.error);
            }
        } catch (error) {
            alert('Error al enviar la solicitud:', error);
        }
    };
    


  return (
    <div className="perfil-container">
      {/* Fondo de encabezado */}
      <div className="perfil-header">
        <img src={img} alt="Fondo" className="img-fluid rounded-top" />
      </div>

      {/* Información del usuario */}
      <div className="perfil-body d-flex flex-column align-items-center text-center py-4 px-4">
        {/* Foto de perfil */}
        <div className="foto-perfil-container">
            {candidato.fotografia && (
                <img
                src={candidato.fotografia}
                alt="Perfil"
                className="foto-perfil rounded-circle"
                />
            )}
            <label htmlFor="photoInput" className="btn perfilfoto-edit-btn">
                <i className="fa-solid fa-camera"></i>
            </label>
            <input type="file" id="photoInput" className="d-none"
                accept=".jpg, .jpeg, .png" 
                onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                        manejarSubidaFoto(file);
                    }
                }}
            />
        </div>

        {/* Detalles del usuario */}
        <div className="detalles-perfil mt-4">
            <h2>{`${candidato.nombre} ${candidato.apellido}`}</h2>

            <p className="text-muted">{`Fecha de nacimiento: ${candidato.fecha_nacimiento}`}</p>

            {candidato.sexo !== "Prefiero No Decirlo" && (
                <p className="text-muted">{`Género: ${candidato.sexo}`}</p>
            )}

            {candidato.universidad !== "Otra" && candidato.universidad !== "No estudio" && (
                <p className="text-muted">{`Universidad: ${candidato.universidad}`}</p>
            )}

            <p className="text-muted">{`Tiempo estimado para graduarse: ${candidato.tiempo_restante}`}</p>
    

            <p className="text-muted">{`Modalidad de trabajo preferida: ${candidato.modalidad_trabajo}`}</p>


            <p className="text-muted">{`Dirección: ${candidato.direccion}, ${candidato.estado}`}</p>
    

            <p className="text-muted">{`Teléfono: ${candidato.telefono}`}</p>

            <p className="text-muted">{`Siguiendo: ${numSeguidos}`}</p>

            <p className="text-muted">
                {candidato.cv ? (
                    <>
                        CV: <a href={candidato.cv} target="_blank" rel="noopener noreferrer" className="cv-link">Ver PDF</a>
                    </>
                ) : (
                    "Sube tu currículum"
                )}
                <label htmlFor="cvInput" className="btn">
                    {candidato.cv ? (
                        <i className="fa-solid fa-pen"></i>
                    ) : (
                        <i className="fa-solid fa-upload"></i>
                    )}
                </label>
                <input 
                    type="file" 
                    id="cvInput" 
                    className="d-none" 
                    accept=".pdf"
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                            manejarSubidaCv(file);
                        }
                    }}
                />
            </p>
                
        </div>

        {/* Botones */}
        <div className="botones-perfil mt-4 d-flex justify-content-center gap-3">
          <button className="btn btn-tipodos" onClick={manejarShowModalSeguidos}>Seguidos</button>
          <button className="btn btn-tipodos" onClick={manejarShowModalForm}>Actualizar información</button>
          <button className="btn btn-danger" onClick={manejarCerrarSesion}>Cerrar Sesión</button>
        </div>
      </div>

    {/* Modal Seguidos */}
    {showModalSeguidos && (
        <div className="modal-overlay">
            <div className="modal-content">
        
            </div>
        </div>
    )}

    {/* Modal Seguidos */}
    {showModalForm && (
        <div className="modal-overlay">
            <div className="modal-content ">
                <button className="close-button btn" onClick={() => manejarCloseModalForm()}>
                    <i class="fa-solid fa-x"></i>
                </button>
                <ModalEditarPerfil candidato={candidato} manejarCloseModalForm={manejarCloseModalForm}/>
            </div>
        </div>
    )}


    </div>

    
  );
};
