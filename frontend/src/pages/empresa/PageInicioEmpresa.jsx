import React, { useState, useEffect, useCallback } from 'react';
import { Seccion1PageInicio } from '../../components/empresa/Seccion1PageInicio'
import { Seccion2PageInicio } from '../../components/empresa/Seccion2PageInicio'
import { SeccionPublicacion } from '../../components/empresa/SeccionPublicacion';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useLocation } from 'react-router-dom';

export const PageInicioEmpresa = ({empresa}) => {
    const [numPublicaciones, setNumPublicaciones] = useState(0);
    const [publicaciones, setPublicaciones] = useState(0);
    const [seccionActiva, setSeccionActiva] = useState("perfil-publicaciones");
    const [publicacionSeleccionada, setPublicacionSeleccionada] = useState(null);
    const empresaActiva = empresa.id;
    const [isLoading, setIsLoading] = useState(true); 
    const location = useLocation();

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
            setIsLoading(false);
        } catch (error) {
            console.error('Error al obtener los datos de publicaciones:', error);
            setIsLoading(false);
        }
    }, [empresa.id]); 

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    
    useEffect(() => {
        if (location.state?.seccionActiva === "publicacion" && location.state?.idPublicacion && publicaciones.length > 0) {
            const publicacionEncontrada = publicaciones.find(publi => publi.ID === location.state.idPublicacion);
            if (publicacionEncontrada) {
                setPublicacionSeleccionada(publicacionEncontrada);
                setSeccionActiva("publicacion");
            }
        }

    }, [location.state, publicaciones]);

    const manejarMostrarSeccion = (publicacion) =>{
        setPublicacionSeleccionada(publicacion);
        setSeccionActiva("publicacion");

        // Esperar a que React renderice la sección antes de hacer scroll
        setTimeout(() => {
            requestAnimationFrame(() => {
                const seccion = document.getElementById("seccion-publicacion");
                if (seccion) {
                    const rect = seccion.getBoundingClientRect();
                    const scrollPosition = window.scrollY + rect.top - (window.innerHeight / 2) + (rect.height / 2);
                    window.scrollTo({
                        top: scrollPosition,
                        behavior: "smooth"
                    });
                }
            });
        }, 100); 
    }

    const manejarOcultarSeccion = () => {
        setSeccionActiva("perfil-publicaciones");
        setTimeout(() => {
            fetchData(); // 🔹 Asegura que se recargan los datos de publicaciones
        }, 500);
        window.scrollTo({
            top: 0,
            behavior: "smooth" 
        });
    };

    if (isLoading) {
        return <LoadingSpinner></LoadingSpinner> 
    }
      
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
                <div className='seccionn container mt-4 mb-4 d-flex justify-content-center' id="seccion-publicacion">
                    <SeccionPublicacion empresa={empresa} publicacion={publicacionSeleccionada}  manejarOcultarSeccion={manejarOcultarSeccion} actualizarFetch={fetchData} setPublicacionSeleccionada={setPublicacionSeleccionada} empresaActiva={empresaActiva}/>
                </div>
            </div>
        )}

      </>
  )
}
