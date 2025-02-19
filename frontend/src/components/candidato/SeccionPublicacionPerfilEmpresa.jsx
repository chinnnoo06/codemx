import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../../styles/empresa/publicacion.css';
import { ModalLikes } from './ModalLikes';
import { ModalDislikes } from './ModalDislikes';
import { ModalComentarios} from './ModalComentarios';

export const SeccionPublicacionPerfilEmpresa = ({ empresa, idCandidato, publicacion, manejarOcultarSeccion}) => {
    const [likes, setLikes] = useState(0);
    const [numLikes, setNumLikes] = useState(0);
    const [dislikes, setDislikes] = useState(0);
    const [numDislikes, setNumDislikes] = useState(0);
    const [comentarios, setComentarios] = useState(0);
    const [numComentarios, setNumComentarios] = useState(0);
    const [showModalLikes, setShowModalLikes] = useState(false);
    const [showModalDislikes, setShowModalDislikes] = useState(false);
    const [showModalComentarios, setShowModalComentarios] = useState(false);
    const navigate = useNavigate(); // Hook para redirigir a otra página

    const fetchData = useCallback(async () => {
          try {
              // Realiza la solicitud al backend enviando el session_id desencriptado
              const response = await fetch("https://www.codemx.net/codemx/backend/empresa/obtener_likes_dislikes_comentarios.php", {
                  method: "POST",
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ idPublicacion: publicacion.ID }), 
              });
  
              if (!response.ok) {
                  throw new Error('Error al obtener los datos');
              }
              const responseData = await response.json();
  
              // Actualizar estados
              setLikes(responseData.likes);
              setNumLikes(responseData.cantidadLikes);
              setDislikes(responseData.dislikes);
              setNumDislikes(responseData.cantidadDislikes);
              setComentarios(responseData.comentarios);
              setNumComentarios(responseData.cantidadComentarios);
  
          } catch (error) {
              console.error("Error al obtener reacciones de la publicación:", error);
          }
  
      }, [publicacion.ID]); 
  
  
      useEffect(() => {
          fetchData();
      }, [fetchData]);

    const manejarShowModalLikes = () => {
        setShowModalLikes(true);
    };

    const manejarCloseModalLikes = async () => {
        setShowModalLikes(false);
    };

    const manejarShowModalDislikes = () => {
        setShowModalDislikes(true);
    };

    const manejarCloseModalDislikes= async () => {
        setShowModalDislikes(false);
    };

    const manejarShowModalComentarios = () => {
        setShowModalComentarios (true);
    };

    const manejarCloseModalComentarios = async () => {
        setShowModalComentarios (false);
    };

    // Función para redirigir al perfil del candidato
    const irAlPerfilCandidato = (idCandidato) => {
        navigate(`/usuario-candidato/perfil-candidato`, { 
            state: { idCandidato: idCandidato }
        });
    };

    const irAlPerfilEmpresa = (idEmpresaPerfil) => {
        manejarOcultarSeccion();
        navigate(`/usuario-candidato/perfil-empresa`, { 
            state: { idEmpresa: idEmpresaPerfil}
        });
    };

    const irAMiPerfil = () => {
      navigate(`/usuario-candidato/miperfil-candidato`);  
    };


  return (
    <div className='contenedor'>

        <>
        <div className='boton d-flex align-items-center mb-2'>
            <button className="btn btn-volver d-flex align-items-center" onClick={() => manejarOcultarSeccion("perfil-publicaciones")}>
                <i className="fa-solid fa-arrow-left me-2"></i> Volver a publicaciones
            </button>
        </div>

        <div className="contenedor-publicacion d-flex flex-column justify-content-between">
            <div className='seccion-usuario d-flex align-items-center gap-2 px-1 '>
                <img src={`${empresa.logo}?t=${new Date().getTime()}`} alt="Imagen de la publicación" className="img-perfil" onClick={() => irAlPerfilEmpresa(empresa.id)}/>
                <p className='usuario-nombre m-0 align-self-center' onClick={() => irAlPerfilEmpresa(empresa.id)}>{empresa.nombre}</p>
            </div>
            <div className='seccion-img'>
                <img src={`${publicacion.Img}?t=${new Date().getTime()}`} alt="Imagen de la publicación" className="img-detalle" />
            </div>
            <div className='seccion-reacciones text-start d-flex gap-4  px-1'>
                <div className='likes'>
                    <i className="fa-solid fa-thumbs-up pe-2"></i>
                    {publicacion.Ocultar_MeGusta == 0 && numLikes}
                </div>
                <div className='dislikes' onClick={() => manejarShowModalDislikes()}>    
                    <i className="fa-solid fa-thumbs-down pe-2"></i>
                    {publicacion.Ocultar_MeGusta == 0 && numDislikes}
                </div>
                {publicacion.Sin_Comentarios == 0 && (
                    <div className='comentarios' onClick={() => manejarShowModalComentarios()}>    
                        <i className="fa-solid fa-comment pe-2"></i>
                        {numComentarios}
                    </div>
                )}
  
            </div>
            <div className='seccion-descripcion text-start d-flex flex-column'>
                <p className='descripcion'> <span className='usuario-nombre'>{empresa.nombre}</span> {publicacion.Contenido}</p>
                <span className="comentario-tiempo">{new Date(publicacion.Fecha_Publicacion).toLocaleString()}</span>
            </div>


        </div>

        {/* Modal Likes */}
        {showModalLikes && (
            <div className="modal-overlay" onClick={() => manejarCloseModalLikes()}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <button className="close-button btn" onClick={() => manejarCloseModalLikes()}>
                            <i className="fa-solid fa-x"></i>
                    </button>
                    <ModalLikes likes={likes} irAlPerfilCandidato={irAlPerfilCandidato} irAMiPerfil={irAMiPerfil} idCandidato={idCandidato}/>
                </div>
            </div>
        )}

        {/* Modal Disikes */}
        {showModalDislikes && (
            <div className="modal-overlay" onClick={() => manejarCloseModalDislikes()}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <button className="close-button btn" onClick={() => manejarCloseModalDislikes()}>
                            <i className="fa-solid fa-x"></i>
                    </button>
                    <ModalDislikes dislikes={dislikes} irAlPerfilCandidato={irAlPerfilCandidato} irAMiPerfil={irAMiPerfil} idCandidato={idCandidato} />
                </div>
            </div>
        )}

        {/* Modal Comentarios */}
        {showModalComentarios && (
            <div className="modal-overlay" onClick={() => manejarCloseModalComentarios()}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <button className="close-button btn" onClick={() => manejarCloseModalComentarios()}>
                            <i className="fa-solid fa-x"></i>
                    </button>
                    <ModalComentarios comentarios={comentarios} publicacion={publicacion} fetchData={fetchData} irAlPerfilCandidato={irAlPerfilCandidato} irAlPerfilEmpresa={irAlPerfilEmpresa} irAMiPerfil={irAMiPerfil} idCandidato={idCandidato}/>
                </div>
            </div>
        )}

        </>
  </div>
  )
}
