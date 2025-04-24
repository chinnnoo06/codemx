import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Seccion1PagePerfilEmpresa } from '../../components/candidato/Seccion1PagePerfilEmpresa';
import { Seccion2PagePerfilEmpresa } from '../../components/candidato/Seccion2PagePerfilEmpresa';
import { SeccionPublicacion } from '../../components/candidato/SeccionPublicacion';
import { SeccionVacante } from '../../components/candidato/SeccionVacante';
import LoadingSpinner from '../../components/LoadingSpinner';


export const PagePerfilEmpresa = ({candidato}) => {

    const location = useLocation();
    const { idEmpresa } = location.state || {}; 
    const [empresa, setEmpresa] = useState(null);
    const [numPublicaciones, setNumPublicaciones] = useState(0);
    const [publicaciones, setPublicaciones] = useState(0);
    const [vacantes, setVacantes] = useState(0);
    const [seccionActiva, setSeccionActiva] = useState("perfil-publicaciones");
    const [publicacionSeleccionada, setPublicacionSeleccionada] = useState(null);
    const [vacanteSeleccionada, setVacanteSeleccionada] = useState(null);
    const [isLoading, setIsLoading] = useState(true); 
    const [mostrarVacantes, setMostrarVacantes] = useState(false);

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
            
            // Filtrar vacantes cuyo Estatus sea "inactiva"
            const vacantesInactivas = vacantesData.vacantes.filter(vacante => vacante.Estatus === "activa");
            setVacantes(vacantesInactivas);  // Solo se pasan vacantes inactivas
            setIsLoading(false);
            
        } catch (error) {
            console.error('Error al obtener el perfil de la empresa:', error);
            setIsLoading(false);
        }
            
    }, [idEmpresa]);
    

    // Función para obtener datos del backend
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const manejarMostrarSeccion = (publicacion) =>{
        setPublicacionSeleccionada(publicacion);
        setSeccionActiva("publicacion");

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

    useEffect(() => {
        if (location.state?.seccionActiva === "publicacion" && location.state?.idPublicacion && publicaciones.length > 0) {
            const publicacionEncontrada = publicaciones.find(publi => publi.ID === location.state.idPublicacion);
            if (publicacionEncontrada) {
                setPublicacionSeleccionada(publicacionEncontrada);
                setSeccionActiva("publicacion");
            }
        }
    
        if (location.state?.seccionActiva === "detalles-vacante" && location.state?.idVacante && vacantes.length > 0) {
            const vacanteEncontrada = vacantes.find(vac => vac.ID === location.state.idVacante);
            if (vacanteEncontrada) {
                setVacanteSeleccionada(vacanteEncontrada);
                setSeccionActiva("detalles-vacante");
            }
        }
    }, [location.state, publicaciones, vacantes]);
    
    const manejarOcultarSeccion = () => {
        setSeccionActiva("perfil-publicaciones");
    };

    const manejarOcultarSeccionVacante = () => {
        setSeccionActiva("perfil-publicaciones");
        window.scrollTo({
            top: 0,
            behavior: "smooth" 
        });
        setMostrarVacantes(true);
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
  

    if (isLoading) {
        return <LoadingSpinner></LoadingSpinner> 
    }

  return (
        <>
            {seccionActiva === "perfil-publicaciones" && (
                <div className='contenedor-todo'>
                    <div className='seccionn container mt-4 d-flex justify-content-center'>
                        <Seccion1PagePerfilEmpresa empresa={empresa} numPublicaciones={numPublicaciones} idCandidato={candidato.id}/>
                    </div>

                    <div className='seccionn container mt-4 mb-4 d-flex justify-content-center'>
                        <Seccion2PagePerfilEmpresa publicaciones={publicaciones} vacantes={vacantes} manejarMostrarSeccion={manejarMostrarSeccion} manejarMostrarSeccionVacante={manejarMostrarSeccionVacante} mostrarVacantes={mostrarVacantes}/>
                    </div>
                </div>
            )}

            {seccionActiva === "publicacion" && (
                <div className='contenedor-todo'>
                    <div className='seccionn container mt-4 mb-4 d-flex justify-content-center'>
                        <SeccionPublicacion empresa={empresa} candidato={candidato} idCandidato={candidato.id} publicacion={publicacionSeleccionada}  manejarOcultarSeccion={manejarOcultarSeccion}/>
                    </div>
                </div>
            )}

                  
            {seccionActiva === "detalles-vacante" && (
                <div className='contenedor-seccion-vacantes d-flex flex-column align-items-center w-100 '>
                    <div className='w-100 pt-4 pb-4'> 
                        <SeccionVacante idCandidato={candidato.id} vacante={vacanteSeleccionada} manejarOcultarSeccionVacante={manejarOcultarSeccionVacante} setVacanteSeleccionada={setVacanteSeleccionada} actualizarFetch={fetchData} candidato={candidato}/>
                    </div>
                </div>
    
            )}

      </>
  )
}
