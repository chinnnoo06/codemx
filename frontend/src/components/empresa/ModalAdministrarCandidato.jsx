import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; 

export const ModalAdministrarCandidato = ({ candidato, tecnologiasRequeridas, idVacante, idEmpresa, setShowModalAdministrar, fetchDataVacante, actualizarFetch, vacante, setVacanteSeleccionada }) => {
  const [tecnologiasDominadas, setTecnologiasDominadas] = useState([]);
  const [estadoCandidato, setEstadoCandidato] = useState(null);
  const [showModalConfirmacion, setShowModalConfirmacion] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const [actionType, setActionType] = useState(null);
  const navigate = useNavigate(); // Hook para redirigir a otra página

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
            body: JSON.stringify({ idCandidato: candidato.ID }),
          }
        );

        if (!tecnologiasDominadasResponse.ok) {
          const errorDataTecnologiasDominadas = await tecnologiasDominadasResponse.json();
          throw new Error(errorDataTecnologiasDominadas.error || 'Error desconocido al obtener tecnologías dominadas');
        }

        const tecnologiasDominadasData = await tecnologiasDominadasResponse.json();

        // Fetch para obtener el estado del candidato
        const estadoResponse = await fetch(
          'https://www.codemx.net/codemx/backend/empresa/obtener_estado_candidato.php',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idCandidato: candidato.ID, idVacante }),
          }
        );

        if (!estadoResponse.ok) {
          const errorDataEstado = await estadoResponse.json();
          throw new Error(errorDataEstado.error || 'Error desconocido al obtener estado del candidato');
        }

        const estadoData = await estadoResponse.json();

        // Guardamos las tecnologías dominadas por el candidato y el estado del candidato
        setTecnologiasDominadas(tecnologiasDominadasData.tecnologias_dominadas);
        setEstadoCandidato(estadoData.estado_candidato);

      } catch (error) {
        // Manejo de errores
        console.error('Error al obtener los datos:', error);
        setEstadoCandidato(null); // Asignamos null si hay un error
      }

  }, [candidato.ID, idVacante]);

  // Llamamos a fetchData en useEffect
  useEffect(() => {
      fetchData();
  }, [fetchData]);
      
  // Filtramos las tecnologías requeridas por la vacante que el candidato también domina
  const tecnologiasCoincidentes = tecnologiasRequeridas.filter(tecnologia =>
    tecnologiasDominadas.some(dominada => dominada.id_tecnologia === tecnologia.id_tecnologia)
  );

  const irAlPerfil = (idCandidato) => {
    navigate(`/usuario-empresa/perfil-candidato`, { 
        state: { idCandidato }
    });
  };

  const eliminarPostulacion = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        'https://www.codemx.net/codemx/backend/empresa/eliminar_postulacion.php',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idCandidato: candidato.ID, idVacante, idEmpresa }),
        }
      );

      const result = await response.json();

      if (result.success) {
        fetchDataVacante();
        vacante.Cantidad_Postulados = parseInt(vacante.Cantidad_Postulados, 10); // Convertimos a número
        vacante.Cantidad_Postulados -= 1;
        setVacanteSeleccionada(vacante); 

        actualizarFetch(); 
        setShowModalAdministrar(false);
      } else {
        // Mostrar el mensaje de error desde el backend
        console.log(`Hubo un error al eliminar la postulación: ${result.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al eliminar la postulación:', error);
      alert('Hubo un error al eliminar la postulación');
    }finally {
      setIsLoading(false);
    }
  };

  const cambiarEstado = async (estadoNuevo) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        'https://www.codemx.net/codemx/backend/empresa/cambiar_estado_candidato_vacante.php',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idCandidato: candidato.ID, idVacante, estadoNuevo }),
        }
      );

      const result = await response.json();

      if (result.success) {
        fetchData();
      } else {
        // Mostrar el mensaje de error desde el backend
        console.log(`Hubo un error al eliminar cambiar el estado del candidato: ${result.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al eliminar al cambiar estado del cnadidato:', error);
    }finally {
      setIsLoading(false);
    }
  };

  const manejarShowModalConfirmacion = (actionType) => {
    setActionType(actionType);
    setShowModalConfirmacion(true);
  };

  const manejarCloseModalConfirmacion = () => {
      setShowModalConfirmacion(false);
  };

  const confirmarAccion = () => {
    switch (actionType) {
      case 'eliminar':
        eliminarPostulacion();
        break;
      case 'rechazar':
        cambiarEstado(2);
        break;
      case 'aceptar':
        cambiarEstado(3);
        break;
      case 'noContratar':
        cambiarEstado(5);
        break;
      case 'contratar':
        cambiarEstado(4);
        break;
      default:
        break;
    }
    manejarCloseModalConfirmacion();
  };

  const getConfirmationMessage = () => {
    switch (actionType) {
      case 'eliminar':
        return "¿Seguro que deseas eliminar la postulación de este candidato?";
      case 'rechazar':
        return "¿Seguro que deseas rechazar la postulación de este candidato?";
      case 'aceptar':
        return "¿Seguro que deseas aceptar la postulación de este candidato?";
      case 'noContratar':
        return "¿Seguro que no deseas contratar a este candidato?";
      case 'contratar':
        return "¿Seguro que deseas contratar a este candidato?";
      default:
        return "¿Seguro que deseas realizar esta acción?";
    }
  };

  return (
    <div className="container container-modal">
      {/* Información del usuario */}
      <div className="contenedor-perfil-postulado mb-3 d-flex align-items-center">
        {/* Foto de perfil */}
        <div className="fila-foto">
          {candidato.Fotografia && (
            <img
              src={`${candidato.Fotografia}?t=${new Date().getTime()}`}
              alt="Perfil"
              className="foto-candidato rounded-circle"
              onClick={() => irAlPerfil(candidato.ID)}
            />
          )}
        </div>

        {/* Detalles del usuario */}
        <div className="fila-info">
          <h4 className="candidato-postulado-nombre mt-2 mb-2">{`${candidato.Nombre} ${candidato.Apellido}`}</h4> 
          {candidato.universidad !== "Otra" &&
            candidato.universidad !== "No estudio" && (
                <span className="universidad-postulado text-muted">{`Estudiante de ${candidato.Universidad}`}</span>
            )}
          
          {/* Tecnologías coincidencias */}
          {tecnologiasCoincidentes.length > 0 ? (
            <div className="tecnologias-coincidentes d-flex gap-2 mt-2">
                {tecnologiasCoincidentes.map((tecnologia) => (
                  <span className="technology-tag" key={tecnologia.id_tecnologia}>{tecnologia.nombre_tecnologia}</span>
                ))}
            </div>
          ) : (
            <p>No hay tecnologías dominadas que coincidan con las requeridas para esta vacante.</p>
          )}
        </div>
      </div>
      
      {/* Estado del candidato */}
      <div className='manejar-estado'>
        <div className='d-flex gap-2'>
          <h4>Estado actual del candidato: </h4>
          <span className='text-muted'>{estadoCandidato}</span>
        </div>

        {/* Contenedor de los botones, alineándolos de manera horizontal */}
        <div className="d-flex justify-content-between mt-2 ">
          {/* Icono para eliminar la postulación */}
          <button className="btn btn-eliminar-vacante" onClick={() => manejarShowModalConfirmacion('eliminar')}>
            <i className="fa-solid fa-trash"></i> Eliminar Postulación
          </button>

          {/* Botones "Rechazar" y "Aceptar" en estado "En revisión" */}
          {estadoCandidato === "En revisión" && (
            <>
              <button className='btn btn-estado-candidato' onClick={() => manejarShowModalConfirmacion('rechazar')}>{isLoading ? 'Cargando...' : 'Rechazar'}</button>
              <button className='btn btn-estado-candidato' onClick={() => manejarShowModalConfirmacion('aceptar')}>{isLoading ? 'Cargando...' : 'Aceptar'}</button>
            </>
          )}

          {estadoCandidato === "Aceptada" && (
            <>
              <button className='btn btn-estado-candidato' onClick={() => manejarShowModalConfirmacion('noContratar')}>{isLoading ? 'Cargando...' : 'No Contratar'}</button>
              <button className='btn btn-estado-candidato' onClick={() => manejarShowModalConfirmacion('contratar')}>{isLoading ? 'Cargando...' : 'Contratar'}</button>
            </>
          )}
        </div>
      </div>

      {/*Modal Confirmacion*/}
      {showModalConfirmacion && (
        <div className="modal-overlay-confirmacion" onClick={manejarCloseModalConfirmacion}>
            <div className="modal-content-confirmacion" onClick={(e) => e.stopPropagation()}>
                <p>{getConfirmationMessage()}</p>

                <div className="d-flex justify-content-between mt-3">
                  <button
                    className="btn btn-tipodos btn-sm"
                    onClick={manejarCloseModalConfirmacion}
                  >
                      Cancelar
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={confirmarAccion}
                  >
                      {isLoading ? 'Cargando...' : 'Confirmar'}
                  </button>
                </div>
            </div>
        </div>
      )}


    </div>
);

};
