import React, { useState, useEffect, useCallback } from 'react';
import { ModalSeguidosCandidato } from './ModalSeguidosCandidato';
import img from '../../resources/fondo.png';
import '../../styles/candidato/miperfil.css';

export const Seccion1PagePerfilCandidato = ({candidato, candidatoActivo}) => {

  const [numSeguidos, setNumSeguidos] = useState(0);
  const[empresas, setEmpresas]=useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showModalSeguidos, setShowModalSeguidos] = useState(false);
  const [showModalDenuncia, setShowModalDenuncia] = useState(false);
  const [pasoReporte, setPasoReporte] = useState(1); // 1: Selección, 2: Descripción
  const [motivoSeleccionado, setMotivoSeleccionado] = useState("");
  const [descripcionReporte, setDescripcionReporte] = useState("");

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

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const manejarShowModalDenuncia = () => {
    setShowModalDenuncia(true);
    setMenuVisible(!menuVisible);
    setPasoReporte(1);
    setMotivoSeleccionado("");
    setDescripcionReporte("");
  };

  const manejarCloseModalDenuncia = async () => {
    setShowModalDenuncia(false);
    setMenuVisible(!menuVisible);
  };

  const manejarSeleccionReporte = (motivo) => {
    setMotivoSeleccionado(motivo);
    setPasoReporte(2);

  };

  const enviarReporte = async () => {
    try {
        const response = await fetch("https://www.codemx.net/codemx/backend/candidato/denuncia_candidato_candidato.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                motivo: motivoSeleccionado,
                descripcion: descripcionReporte,
                idDenunciante: candidatoActivo, 
                idDenunciado: candidato.id,
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
            {/* Menú desplegable para pantallas pequeñas */}
            {menuVisible && (
                <div className="modal-overlay-opciones-perfil" onClick={toggleMenu}>
                    <div className="modal-content-opciones-perfil" onClick={(e) => e.stopPropagation()}>
                        <div className="divider"></div>
                        <button className="btn-opciones"  onClick={() => manejarShowModalDenuncia()}>
                            Reportar
                        </button>
                        <div className="divider"></div>
                        <button className="btn-opciones btn-cancelar"  onClick={toggleMenu}>
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>

        <div className="perfil-candidato-candidato">
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
            <div className="modal-overlay" onClick={() => manejarCloseModalSeguidos()}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <button className="close-button btn" onClick={() => manejarCloseModalSeguidos()}>
                            <i className="fa-solid fa-x"></i>
                    </button>
                    <ModalSeguidosCandidato empresas={empresas}/>
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
                                  ¿Por qué quieres reportar este usuario?
                              </div>

                              <div className="divider"></div>

                         
                              {/* Opciones de reporte a candidato*/}
                              <div className="modal-body-reportar">
                                  <button className="btn-opciones" onClick={() => manejarSeleccionReporte(4)}>
                                      Conducta Inapropiada u Ofensiva
                                  </button>
                                  <div className="divider"></div>

                                  <button className="btn-opciones" onClick={() => manejarSeleccionReporte(6)}>
                                      Spam o Mensajes No Deseados
                                  </button>
                                  <div className="divider"></div>

                                  <button className="btn-opciones" onClick={() => manejarSeleccionReporte(7)}>
                                      Acoso o Discriminación 
                                  </button>
                                  <div className="divider"></div>

                                  <button className="btn-opciones" onClick={() => manejarSeleccionReporte(9)}>
                                      Discriminación o Discurso de Odio
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
                                      Enviar Reporte
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
  )
}
