import React, { useState, useEffect, useCallback } from 'react';
import { Seccion1PageInicio } from '../../components/empresa/Seccion1PageInicio'
import { Seccion2PageInicio } from '../../components/empresa/Seccion2PageInicio'
import { SeccionPublicacion } from '../../components/empresa/SeccionPublicacion';

export const PageInicioEmpresa = ({empresa}) => {
    const [numPublicaciones, setNumPublicaciones] = useState(0);
    const [publicaciones, setPublicaciones] = useState(0);
    const [seccionActiva, setSeccionActiva] = useState("perfil-publicaciones");
    const [publicacionSeleccionada, setPublicacionSeleccionada] = useState(null);

    // Función para obtener datos del backend
    const fetchData = useCallback(async () => {
        try {
            const Response = await fetch('https://www.codemx.net/codemx/backend/empresa/obtener_publicaciones_empresa.php', {
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
    }, [empresa.id]); 

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const manejarMostrarSeccion = (publicacion) =>{
        setPublicacionSeleccionada(publicacion);
        setSeccionActiva("publicacion");

        window.scrollTo({
            top: 100,
            behavior: "smooth" 
        });
    }

    const manejarOcultarSeccion = (publicacion) => {
        setSeccionActiva("perfil-publicaciones");
        setTimeout(() => {
            fetchData(); // 🔹 Asegura que se recargan los datos de publicaciones
        }, 500);
    };
      
  return (
      <>
      
        {seccionActiva === "perfil-publicaciones" && (
            <div className='contenedor-todo'>
                <div className='seccionn container mt-4 d-flex justify-content-center'>
                    <Seccion1PageInicio empresa={empresa} numPublicaciones={numPublicaciones}/>
                </div>

                <div className='seccionn container mt-4 mb-4 d-flex justify-content-center'>
                    <Seccion2PageInicio empresa={empresa} publicaciones={publicaciones} fetchData={fetchData} manejarMostrarSeccion={manejarMostrarSeccion}/>
                </div>
            </div>
        )}

        {seccionActiva === "publicacion" && (
            <div className='contenedor-todo'>
                <div className='seccionn container mt-4 mb-4 d-flex justify-content-center'>
                    <SeccionPublicacion empresa={empresa} publicacion={publicacionSeleccionada}  manejarOcultarSeccion={manejarOcultarSeccion} actualizarFetch={fetchData} setPublicacionSeleccionada={setPublicacionSeleccionada}/>
                </div>
            </div>
        )}

      </>
  )
}
