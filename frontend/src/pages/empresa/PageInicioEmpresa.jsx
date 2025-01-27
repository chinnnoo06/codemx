import React, { useState, useEffect, useCallback } from 'react';
import { Seccion1PageInicio } from '../../components/empresa/Seccion1PageInicio'
import { Seccion2PageInicio } from '../../components/empresa/Seccion2PageInicio'

export const PageInicioEmpresa = ({empresa}) => {
    const [numPublicaciones, setNumPublicaciones] = useState(0);
    const [publicaciones, setPublicaciones] = useState(0);

    // Función para obtener datos del backend
    const fetchData = useCallback(async () => {
        try {
            const Response = await fetch('https://www.codemx.net/codemx/backend/empresa/obtener_publicaciones.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idEmpresa: empresa.id }),
            });

            if (!Response.ok) {
                throw new Error('Error al obtener los datos');
            }
            const publicacionesData= await Response.json();

            // Actualizar estados
            setPublicaciones(publicacionesData.publicaciones);
            setNumPublicaciones(publicacionesData.cantidad);
        } catch (error) {
            console.error('Error al obtener los datos de publicaciones:', error);
        }
    }, [empresa.id]); // Dependencia: candidato.id

    useEffect(() => {
        fetchData();
    }, [fetchData]);
      
  return (
      <>
      <div className='contenedor-todo'>
          <div className='seccionn container mt-4 d-flex justify-content-center'>
              <Seccion1PageInicio empresa={empresa} numPublicaciones={numPublicaciones}/>
          </div>

          <div className='seccionn container mt-4 mb-4 py-3 d-flex justify-content-center'>
              <Seccion2PageInicio empresa={empresa} publicaciones={publicaciones} fetchData={fetchData}/>
          </div>
      </div>

      </>
  )
}
