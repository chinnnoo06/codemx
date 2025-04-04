import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { SeccionListaVacantes } from '../../components/candidato/SeccionListaVacantes';
import { SeccionVacante } from '../../components/candidato/SeccionVacante';

export const PageRecomendacionesCandidato = ({candidato}) => {
  const [vacantes, setVacantes] = useState([]); // Mantener el estado de las vacantes
  const [isLoading, setIsLoading] = useState(true); 
  const [seccionActiva, setSeccionActiva] = useState("vacantes-recomendadas");
  const [vacanteSeleccionada, setVacanteSeleccionada] = useState(null);
  const [page, setPage] = useState(1); // Página inicial
  const [hasMore, setHasMore] = useState(true); // Para saber si hay más vacantes que cargar

  // Función para cargar las vacantes
  const fetchData = useCallback(async () => {
    try {
        const response = await fetch('https://www.codemx.net/codemx/backend/candidato/recomendaciones.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idCandidato: candidato.id, page: page }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error desconocido');
        }
        const vacantesData = await response.json();

        // Si ya no hay más vacantes, establecer hasMore como false
        if (vacantesData.vacantes.length === 0) {
            setHasMore(false);
        } else {
            // Filtrar duplicados y agregar las nuevas vacantes
            setVacantes((prevVacantes) => {
                const newVacantes = vacantesData.vacantes.filter(newVacante => 
                    !prevVacantes.some(prevVacante => prevVacante.ID === newVacante.ID)
                );
                return [...prevVacantes, ...newVacantes];
            });
        }
        setIsLoading(false);
    } catch (error) {
        console.error('Error al obtener los datos de vacantes:', error);
        setIsLoading(false);
    }
  }, [candidato.id, page]);

  // Cargar más vacantes cuando el usuario llega al final de la página
  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage((prevPage) => prevPage + 1); // Incrementar la página
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (page > 1) { // Solo cargar más cuando la página cambia
      fetchData();
    }
  }, [page, fetchData]);

  // Detectar el scroll y cargar más vacantes cuando el usuario llega al final
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.scrollHeight - 400 // Umbral de 100px antes de llegar al final
      ) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isLoading, hasMore]);

  const manejarOcultarSeccionVacante = () => {
    setSeccionActiva("vacantes-recomendadas");
    window.scrollTo({
        top: 0,
        behavior: "smooth" 
    });
  };

  const manejarMostrarSeccionVacante = (vacante) => {
      setVacanteSeleccionada(vacante);
      setSeccionActiva("detalles-vacante");
  };

  if (isLoading && page === 1) {
    return <LoadingSpinner></LoadingSpinner>; 
  }

  console.log(vacantes)

  return (
     <div className='contenedor-seccion-vacantes d-flex flex-column align-items-center w-100 '>
        {seccionActiva === "vacantes-recomendadas" && (
            <div className='header d-flex flex-column w-100 py-4'>
                <h2 className='titulo-seccion'> Vacantes Recomendadas </h2>
                <span className='text-muted descripcion-seccion'>
                  Las siguientes vacantes de empleo que se muestran son recomendaciones que se obtuvieron con nuestro sistema de recomendación de vacantes, el cual te muestra vacantes de empleo que concuerdan con la modalidad de trabajo que tu prefieres, y que las tecnologías requeridas de las vacantes también se alineen con tus tecnologías dominadas que indicaste en tu perfil.
                </span>
            </div>
        )}

        {seccionActiva === "vacantes-recomendadas" && (
            <div className='w-100 pb-4'>
                <SeccionListaVacantes 
                  vacantes={vacantes} 
                  manejarMostrarSeccionVacante={manejarMostrarSeccionVacante}
                  recomendaciones={1}
                />
                {isLoading && hasMore && <LoadingSpinner />} {/* Spinner al cargar más vacantes */}
                {!hasMore && <div className='text-center text-muted'>No hay más vacantes para mostrar.</div>}
            </div>
        )}
  
        {seccionActiva === "detalles-vacante" && (
            <div className='w-100 pt-4 pb-4'> 
                <SeccionVacante 
                  idCandidato={candidato.id} 
                  vacante={vacanteSeleccionada} 
                  manejarOcultarSeccionVacante={manejarOcultarSeccionVacante} 
                  setVacanteSeleccionada={setVacanteSeleccionada} 
                  actualizarFetch={fetchData}
                />
            </div>
        )}
    </div>
  );
};