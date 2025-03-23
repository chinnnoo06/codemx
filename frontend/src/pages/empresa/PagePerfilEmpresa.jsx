import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Seccion1PagePerfilEmpresa } from '../../components/empresa/Seccion1PagePerfilEmpresa'
import { Seccion2PagePerfilEmpresa } from '../../components/empresa/Seccion2PagePerfilEmpresa'
import { SeccionPublicacion } from '../../components/empresa/SeccionPublicacion';
import { SeccionVacante } from '../../components/empresa/SeccionVacante';

export const PagePerfilEmpresa = ({empresaActiva}) => {
    const location = useLocation();
    const { idEmpresa } = location.state || {}; 
    const [empresa, setEmpresa] = useState(null);
    const [numPublicaciones, setNumPublicaciones] = useState(0);
    const [publicaciones, setPublicaciones] = useState(0);
    const [vacantes, setVacantes] = useState(0);
    const [seccionActiva, setSeccionActiva] = useState("perfil-publicaciones");
    const [publicacionSeleccionada, setPublicacionSeleccionada] = useState(null);
    const [vacanteSeleccionada, setVacanteSeleccionada] = useState(null);

    // Función para obtener datos del backend
    const fetchData = useCallback(async () => {
        try {
            const responseDatos = await fetch('https://www.codemx.net/codemx/backend/empresa/obtener_perfil_de_empresa.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idEmpresa: idEmpresa })
            });

            const responsePublicaciones = await fetch('https://www.codemx.net/codemx/backend/empresa/obtener_publicaciones_empresa.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idEmpresa: idEmpresa })
            });

            const responseVacantes = await fetch('https://www.codemx.net/codemx/backend/empresa/obtener_vacantes_empresa.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idEmpresa: idEmpresa })
            });
    
            if (!responseDatos.ok ) {
                throw new Error('Error al obtener los datos');
            }
            if (!responsePublicaciones.ok ) {
                throw new Error('Error al obtener las publicaciones');
            }
            if (!responseVacantes.ok ) {
                throw new Error('Error al obtener las vacantes');
            }

    
            const empresaData = await responseDatos.json();
            const publicacionesData = await responsePublicaciones.json();
            const vacantesData = await responseVacantes.json();

            setEmpresa(empresaData);
            setPublicaciones(publicacionesData.publicaciones);
            setNumPublicaciones(publicacionesData.cantidad);
            setVacantes(vacantesData.vacantes);
        } catch (error) {
            console.error('Error al obtener el perfil de la empresa:', error);
        }
            
    }, [idEmpresa]);
    

    // Función para obtener datos del backend
    useEffect(() => {
        fetchData();
    }, [fetchData]);
  
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
    };

    const manejarOcultarSeccionVacante = () => {
      setSeccionActiva("vacantes");
      window.scrollTo({
          top: 0,
          behavior: "smooth" 
      });
    };

    const manejarMostrarSeccionVacante = (vacante) => {
        setVacanteSeleccionada(vacante);
        setSeccionActiva("detalles-vacante");

        
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
    };

    if (!empresa) {
      return <div>Cargando perfil...</div>;
    }
    
  

  return (
      <div className='contenedor-todo'>

        {seccionActiva === "perfil-publicaciones" && (
            <div className='contenedor-todo'>
                <div className='seccionn container mt-4 d-flex justify-content-center'>
                    <Seccion1PagePerfilEmpresa empresa={empresa} numPublicaciones={numPublicaciones}/>
                </div>

                <div className='seccionn container mt-4 mb-4 d-flex justify-content-center'>
                    <Seccion2PagePerfilEmpresa empresa={empresa} publicaciones={publicaciones} vacantes={vacantes} manejarMostrarSeccion={manejarMostrarSeccion} manejarMostrarSeccionVacante={manejarMostrarSeccionVacante}/>
                </div>
            </div>
        )}

        {seccionActiva === "publicacion" && (
            <div className='contenedor-todo'>
                <div className='seccionn container mt-5 mb-4 d-flex justify-content-center'>
                    <SeccionPublicacion empresa={empresa} publicacion={publicacionSeleccionada}  manejarOcultarSeccion={manejarOcultarSeccion} empresaActiva={empresaActiva}/>
                </div>
            </div>
        )}
        
        {seccionActiva === "detalles-vacante" && (
            <div className='contenedor-seccion-vacantes d-flex flex-column align-items-center w-100 '>
                <div className='w-100 pt-4 pb-4'> 
                    <SeccionVacante empresa={empresa} vacante={vacanteSeleccionada} manejarOcultarSeccionVacante={manejarOcultarSeccionVacante} setVacanteSeleccionada={setVacanteSeleccionada} actualizarFetch={fetchData} empresaActiva={empresaActiva}/>
                </div>
            </div>

        )}

      </div>
  )
}
