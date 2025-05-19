import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Seccion1PageVerificacionAdmin } from '../../components/admin/Seccion1PageVerificacionAdmin';
import '../../styles/admin/seccionverificar.css';

export const PageVerificacionAdmin = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      // Obtener las tecnologías dominadas por los usuarios
      const response = await fetch('https://www.codemx.net/codemx/backend/admin/obtener_solicitudes.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener solicitudes');
      }

      const responseData = await response.json();
      setSolicitudes(responseData.solicitudes);

      setIsLoading(false);
    } catch (error) {
      console.error('Error al obtener los datos de las solicitudes:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return <LoadingSpinner />; // Mostrar el spinner mientras se cargan los datos
  }

  console.log(solicitudes)

  return (
    <div className='contenedor-todo contenedor-seccion-solicitudes w-100'>
        <div className='header d-flex flex-column w-100 py-4'>
            <h2 className='titulo-seccion'> Verificación de Empresas </h2>
            <span className='text-muted descripcion-seccion'>
              A continuación se presentan las empresas que no han completado la verificación de su información legal. Es importante que validen su RFC para asegurar que su documentación esté en regla y cumpla con las normativas fiscales del país. Para realizar la verificación, deben acceder al portal del SAT y confirmar la autenticidad de su RFC. Se muestran los datos detallados de cada empresa, incluyendo nombre, sector, tamaño, contacto y RFC, para que los administradores puedan tomar las acciones necesarias.
            </span>

            <div className="d-flex align-items-center gap-3 mt-3">
                {/* Ir al sitio web del SAT */}
                <a
                  href="https://agsc.siat.sat.gob.mx/PTSC/ValidaRFC/index.jsf" // Cambia esta URL por la del sitio
                  className="btn btn-tipodos btn-sm d-flex align-items-center gap-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa-solid fa-paper-plane"></i>
                  <span>Ir al sitio web</span>
                </a>
            </div>

        </div>

        <div className='w-100 pb-4'>
            <Seccion1PageVerificacionAdmin 
                solicitudes={solicitudes} fectData={fetchData}
            />                
        </div>
    </div>
  );
};
