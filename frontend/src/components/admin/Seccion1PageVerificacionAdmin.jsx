import React, { useState } from 'react';
import '../../styles/admin/seccionverificar.css';

export const Seccion1PageVerificacionAdmin = ({ solicitudes, fectData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showModalConfirmacion, setShowModalConfirmacion] = useState(false); 
  const [showModalExito, setShowModalExito] = useState(false); 
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null); // Empresa seleccionada para verificar
  const [accionSeleccionada, setAccionSeleccionada] = useState(''); // Acción seleccionada (verificar o noVerificar)

  // Mostrar la modal de confirmación
  const manejarShowModalConfirmacion = (idEmpresa, empresaNombre, email, accion) => {
    setEmpresaSeleccionada({ idEmpresa, empresaNombre, email });
    setAccionSeleccionada(accion); // Establecemos si la acción es verificar o no verificar
    setShowModalConfirmacion(true);
  };

  // Cerrar la modal de confirmación
  const manejarCloseModalConfirmacion = () => {
    setShowModalConfirmacion(false);
    setEmpresaSeleccionada(null);
    setAccionSeleccionada('');
  };

  // Mostrar la modal de éxito
  const manejarShowModalExito = () => {
    setShowModalExito(true);
  };

  // Cerrar la modal de éxito
  const manejarCloseModalExito = () => {
    setShowModalExito(false);
  };

  const verificar = async () => {
    if (isLoading || !empresaSeleccionada) return;
    setIsLoading(true);
    const { idEmpresa, empresaNombre, email } = empresaSeleccionada;

    try {
      const response = await fetch("https://www.codemx.net/codemx/backend/login-crearcuenta/rfc_rachazado.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idEmpresa,
          empresaNombre,
          email
        }),
      });

      const result = await response.json();

      if (result.success) {
        fectData(); // Actualizar los datos después de la verificación
        manejarShowModalExito(); // Mostrar modal de éxito
      } else {
        console.error("Error al enviar", result.error);
        alert(`Error al enviar: ${result.error || "Error desconocido"}`);
      }
    } catch (error) {
      console.error("Error al enviar:", error);
      alert("Hubo un error al verificar la empresa.");
    } finally {
      setIsLoading(false);
      manejarCloseModalConfirmacion(); 
    }
  };

  const noVerificar = async () => {
    if (isLoading || !empresaSeleccionada) return;
    setIsLoading(true);
    const { idEmpresa, empresaNombre, email } = empresaSeleccionada;

    console.log(idEmpresa, empresaNombre, email);

    try {
      const response = await fetch("https://www.codemx.net/codemx/backend/admin/no_verificar_empresa.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idEmpresa,
          empresaNombre,
          email
        }),
      });

      const result = await response.json();

      if (result.success) {
        fectData(); // Actualizar los datos después de la verificación
        manejarShowModalExito(); // Mostrar modal de éxito
      } else {
        console.error("Error al enviar:", result.error);
        alert(`Error al enviar reporte: ${result.error || "Error desconocido"}`);
      }
    } catch (error) {
      console.error("Error al enviar:", error);
      alert("Hubo un error al no verificar la empresa.");
    } finally {
      setIsLoading(false); // Restablecer el estado a no cargando
      manejarCloseModalConfirmacion(); // Cerrar modal de confirmación
    }
  };

  return (
    <>
      {solicitudes && solicitudes.length > 0 ? (
        <div className='contenedor-solicitudes w-100'>
          {solicitudes.map((solicitud, index) => (
            <div key={index} className='solicitud d-flex flex-column gap-3 pt-3 pb-3'>
              {/* Encabezado con logo e información básica */}
              <div className='fila-1-solicitudes d-flex justify-content-start'>
                <img
                  src={`${solicitud.Logo}?t=${new Date().getTime()}`}
                  alt="Logo empresa"
                  className="foto-perfil-empresa-solicitudes rounded-circle"
                />
                <div className='datos-empresa'>
                  <h4 className='card-title mb-1'>{solicitud.Nombre}</h4>
                  <p className='text-muted mb-2'>{solicitud.Descripcion}</p>
                  <div className='d-flex flex-wrap gap-2'>
                    <span className='badge bg-span'>{solicitud.Sector}</span>
                    <span className='badge bg-span'>{solicitud.Tamanio}</span>
                  </div>
                </div>
              </div>

              {/* Información detallada en formato de tabla */}
              <div className='fila-2-solicitudes mb-3'>

                <div className='info-item'>
                  <span className='info-label'>Teléfono:</span>
                  <span className='info-value'>{solicitud.Telefono}</span>
                </div>

          
                <div className='info-item'>
                  <span className='info-label'>Email:</span>
                  <span className='info-value'>{solicitud.Email}</span>
                </div>

    
                <div className='info-item'>
                  <span className='info-label'>RFC:</span>
                  <span className='info-value'>{solicitud.RFC}</span>
                </div>
    
        
                <div className='info-item'>
                  <span className='info-label'>Fecha Registro:</span>
                  <span className='info-value'>{solicitud.Fecha_Registro}</span>
                </div>
          
              
                <div className='info-item'>
                  <span className='info-label'>RFC Verificado:</span>
                  <span className={`info-value ${solicitud.RFC_Verificado === '1' ? 'text-success' : 'text-danger'}`}>
                    {solicitud.RFC_Verificado === '1' ? 'Sí' : 'No'}
                  </span>
                </div>
            
          
                <div className='info-item'>
                  <span className='info-label'>Correo Verificado:</span>
                  <span className={`info-value ${solicitud.Correo_Verificado === '1' ? 'text-success' : 'text-danger'}`}>
                    {solicitud.Correo_Verificado === '1' ? 'Sí' : 'No'}
                  </span>
                </div>
           
              </div>

              {/* Botones de acción */}
              <div className='d-flex justify-content-end gap-2'>
                <button
                  className={`btn btn-tipouno btn-sm px-4 ${isLoading || solicitud.RFC_Rechazado === '1' ? 'disabled' : ''}`}
                  onClick={() => manejarShowModalConfirmacion(solicitud.Empresa_ID, solicitud.Nombre, solicitud.Email, 'verificar')}
                  disabled={isLoading || solicitud.RFC_Rechazado === '1'}
                >
                  {isLoading ? 'Verificando...' : 'Verificar'}
                </button>
                <button
                  className={`btn btn-tipodos btn-sm px-4 ${isLoading || solicitud.RFC_Rechazado === '1' ? 'disabled' : ''}`}
                  onClick={() => manejarShowModalConfirmacion(solicitud.Empresa_ID, solicitud.Nombre, solicitud.Email, 'noVerificar')}
                  disabled={isLoading || solicitud.RFC_Rechazado === '1'}
                >
                  {isLoading ? 'Verificando...' : 'Rechazar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className='contenedor-sin-solicitudes'>
          <div className='sin-solicitudes d-flex flex-column justify-content-center align-items-center'>
            <i className="fa-solid fa-globe icono-solicitud"></i>
            <h2 className="texto-no-solicitudes">No hay solicitudes por el momento</h2>
          </div>
        </div>
      )}

      {/* Modal de Confirmación */}
      {showModalConfirmacion && (
        <div className="modal-overlay-confirmacion" onClick={manejarCloseModalConfirmacion}>
          <div className="modal-content-confirmacion" onClick={(e) => e.stopPropagation()}>
            <p>{accionSeleccionada === 'verificar' ? '¿Seguro que quieres verificar a esta empresa?' : '¿Seguro que quieres rechazar a esta empresa?'}</p>
            <div className="d-flex justify-content-between mt-3">
              <button
                className="btn btn-tipodos btn-sm"
                onClick={manejarCloseModalConfirmacion}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={accionSeleccionada === 'verificar' ? verificar : noVerificar}
              >
                {isLoading ? 'Cargando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Éxito */}
      {showModalExito && (
        <div className="modal-overlay-confirmacion" onClick={manejarCloseModalExito}>
          <div className="modal-content-confirmacion" onClick={(e) => e.stopPropagation()}>
            <p>{accionSeleccionada === 'verificar' ? '¡La empresa ha sido verificada correctamente!' : '¡La empresa ha sido rechazada correctamente!'}</p>
            <button className="btn btn-tipodos btn-sm" onClick={manejarCloseModalExito}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
};
