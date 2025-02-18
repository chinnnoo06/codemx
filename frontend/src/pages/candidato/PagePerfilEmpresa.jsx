import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Seccion1PagePerfilEmpresa } from '../../components/candidato/Seccion1PagePerfilEmpresa';
import { Seccion2PagePerfilEmpresa } from '../../components/candidato/Seccion2PagePerfilEmpresa';
import { SeccionPublicacionPerfilEmpresa } from '../../components/candidato/SeccionPublicacionPerfilEmpresa';


export const PagePerfilEmpresa = ({candidato}) => {

    const location = useLocation();
    const { idEmpresa } = location.state || {}; 
    const [empresa, setEmpresa] = useState(null);
    const [numPublicaciones, setNumPublicaciones] = useState(0);
    const [publicaciones, setPublicaciones] = useState(0);
    const [seccionActiva, setSeccionActiva] = useState("perfil-publicaciones");
    const [publicacionSeleccionada, setPublicacionSeleccionada] = useState(null);

    // Función para obtener datos del backend
    useEffect(() => {
        const fetchData = async () => {
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
    
            if (!responseDatos.ok ) {
            throw new Error('Error al obtener los datos');
            }
            if (!responsePublicaciones.ok ) {
            throw new Error('Error al obtener las publicaciones');
            }

    
            const empresaData = await responseDatos.json();
            const publicacionesData = await responsePublicaciones.json();
            setEmpresa(empresaData);

            setPublicaciones(publicacionesData.publicaciones);
            setNumPublicaciones(publicacionesData.cantidad);
        } catch (error) {
            console.error('Error al obtener el perfil de la empresa:', error);
        }
        };
    
        fetchData();
    }, [idEmpresa]);
    
    const manejarMostrarSeccion = (publicacion) =>{
        setPublicacionSeleccionada(publicacion);
        setSeccionActiva("publicacion");

        window.scrollTo({
            top: 100,
            behavior: "smooth" 
        });
    }

    const manejarOcultarSeccion = () => {
        setSeccionActiva("perfil-publicaciones");
    };

    if (!empresa) {
        return <div>Cargando perfil...</div>;
    }
      
   

  return (
        <>
            {seccionActiva === "perfil-publicaciones" && (
                <div className='contenedor-todo'>
                    <div className='seccionn container mt-4 d-flex justify-content-center'>
                        <Seccion1PagePerfilEmpresa empresa={empresa} numPublicaciones={numPublicaciones} idCandidato={candidato.id}/>
                    </div>

                    <div className='seccionn container mt-4 mb-4 d-flex justify-content-center'>
                        <Seccion2PagePerfilEmpresa empresa={empresa} publicaciones={publicaciones}  manejarMostrarSeccion={manejarMostrarSeccion}/>
                    </div>
                </div>
            )}

            {seccionActiva === "publicacion" && (
                <div className='contenedor-todo'>
                    <div className='seccionn container mt-4 mb-4 d-flex justify-content-center'>
                        <SeccionPublicacionPerfilEmpresa empresa={empresa} idCandidato={candidato.id} publicacion={publicacionSeleccionada}  manejarOcultarSeccion={manejarOcultarSeccion}/>
                    </div>
                </div>
            )}

      </>
  )
}
