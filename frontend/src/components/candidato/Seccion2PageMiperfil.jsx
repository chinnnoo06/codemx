import React, { useState, useEffect } from 'react';
import '../../styles/candidato/miperfil.css';
import '../../styles/candidato/miperfilexperencias.css';
import { SeccionActualizarExperenciasLaborales } from './SeccionActualizarExperenciasLaborales';

export const Seccion2PageMiperfil = ({ candidato }) => {
  const [experencias, setExperencias] = useState([]);
  const [mostrarSeccion, setMostrarSeccion] = useState("Ver-Experencias")


  const manejarMostrarSeccion = (estado) => {
    setMostrarSeccion(estado);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const experenciasResponse = await fetch(
          'https://www.codemx.net/codemx/backend/candidato/obtener_experencias_proyectos.php',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idCandidato: candidato.id }),
          }
        );

        if (!experenciasResponse.ok) {
          throw new Error('Error al obtener los datos');
        }

        const experenciasData = await experenciasResponse.json();
        setExperencias(experenciasData.experiencias || []);
      } catch (error) {
        console.error('Error al obtener los datos de experiencias:', error);
      }
    };

    fetchData();
  }, [candidato.id]);

  const manejarActualizacionExperiencias = (nuevasExperiencias) => {
    const experienciasFormateadas = nuevasExperiencias.map((exp) => ({
      id: exp.id || null, // Asegura que el ID esté presente o sea nulo si es una nueva experiencia
      experiencia: {
        Empresa: exp.empresa,
        Duracion: exp.tiempo,
      },
      proyectos: exp.proyectos.map((proj) => ({
        id: proj.id || null, // Igual con los proyectos
        Nombre: proj.nombre,
        Descripcion: proj.descripcion,
      })),
    }));
    
    setExperencias(experienciasFormateadas);
    manejarMostrarSeccion("Ver-Experencias");
  };
  

  return (
    <div className="experencias-container px-2">

      {mostrarSeccion === "Ver-Experencias" ? (

        <>
          <div className='d-flex justify-content-between align-items-center'>
            <h2 className="text-center mb-2">Experiencia Laboral</h2>
            {experencias.length > 0 && (
              <button className='btn btn-actualizar mb-2' onClick={() => manejarMostrarSeccion("Editar-Experencias")}>
                Actualizar
              </button>
            )}
          </div>

          {experencias.length > 0 ? (
          experencias.map((exp, expIndex) => (
            <div key={expIndex} className="card mb-2 shadow-sm">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="experencia-titulo">Experiencia #{expIndex + 1}</h5>
                <span className="badge duracion">Duración: {exp.experiencia.Duracion} meses</span>
              </div>
              <div className="card-body ">
                <div className="mb-2">
                  <h5 className="titulos">Empresa</h5>
                  <p className="text-muted">{exp.experiencia.Empresa}</p>
                </div>

                <h5 className="titulos">Proyectos</h5>
                {exp.proyectos.length > 0 ? (
                  exp.proyectos.map((proj, projIndex) => (
                    <div key={projIndex} className="card mb-3 seccion-proyecto">
                      <div className="card-body ">
                        <h6 className="num-proyecto">
                          Proyecto #{projIndex + 1}: {proj.Nombre}
                        </h6>
                        <p className="card-text text-muted descripcion">{proj.Descripcion}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted">No hay proyectos disponibles.</p>
                )}
              </div>
            </div>
          ))
          ) : (
          <div className="d-flex flex-column justify-content-center align-items-center mt-2">
            <p>No hay experiencias laborales registradas.</p>
            <button className='btn btn-actualizar mb-2' onClick={() => manejarMostrarSeccion("Editar-Experencias")} >
                Actualizar
            </button>
          </div>
          )}
        </>

      ) : (
        <div>
          <form className="form">
            <SeccionActualizarExperenciasLaborales
              candidato={candidato}
              manejarMostrarSeccion={manejarMostrarSeccion}
              experienciasIniciales={experencias}
              actualizarExperiencias={manejarActualizacionExperiencias}
            />
          </form>
        </div>
      )}
      
    </div>
  );
};
