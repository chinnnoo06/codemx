import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { SeccionListaVacantes } from '../../components/admin/SeccionListaVacantes';
import { SeccionVacante } from '../../components/admin/SeccionVacante';
import '../../styles/admin/secciongestionpost.css';
import '../../styles/empresa/seccionvacantes.css';

// Función throttle para optimizar el evento de scroll
function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  return function() {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function() {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}

export const PageGestionVacantesAdmin = () => {
  const [vacantes, setVacantes] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [seccionActiva, setSeccionActiva] = useState("vacantes");
  const [vacanteSeleccionada, setVacanteSeleccionada] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Función para cargar las vacantes
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('https://www.codemx.net/codemx/backend/admin/obtener_vacantes.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page: page }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error desconocido');
      }
      
      const vacantesData = await response.json();
      
      setVacantes(prev => {
        const newVacantes = vacantesData.vacantes.filter(newVacante => 
          !prev.some(prevVacante => prevVacante.ID === newVacante.ID)
        );
        return [...prev, ...newVacantes];
      });
      
      setHasMore(vacantesData.vacantes.length > 0);
    } catch (error) {
      console.error('Error al obtener los datos de vacantes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  // Efecto principal para cargar datos
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Manejo del scroll con throttle
  const handleScroll = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
    const scrollThreshold = document.documentElement.scrollHeight - 400;
    
    if (scrollPosition >= scrollThreshold) {
      setPage(prev => prev + 1);
    }
  }, [isLoading, hasMore]);

  // Efecto para el scroll con throttle
  useEffect(() => {
    const throttledScroll = throttle(handleScroll, 500);
    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [handleScroll]);

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
    window.scrollTo({
      top: 0,
      behavior: "smooth" 
    });
  };

  if (isLoading && page === 1) {
    return <LoadingSpinner />; 
  }

  console.log(vacantes)

  return (
    <div className='contenedor-seccion-vacantes d-flex flex-column align-items-center w-100'>
      {seccionActiva === "vacantes" && (
        <div className='header d-flex flex-column w-100 py-4'>
          <h2 className='titulo-seccion'>Gestión de Vacantes</h2>
          <span className='text-muted descripcion-seccion'>
             Esta sección permite al administrador visualizar, revisar y moderar todas las vacantes publicadas por las empresas en la plataforma. Aquí podrás identificar contenido inapropiado, eliminar vacantes que infrinjan las normas comunitarias y acceder al perfil de la empresa responsable. Las vacantes se muestran en orden cronológico, de la más reciente a la más antigua, para facilitar el monitoreo constante de la actividad en tiempo real.
          </span>
        </div>
      )}

      {seccionActiva === "vacantes" && (
        <div className='w-100 pb-4'>
          <SeccionListaVacantes 
            vacantes={vacantes} 
            manejarMostrarSeccionVacante={manejarMostrarSeccionVacante}
          />
          {isLoading && hasMore && <LoadingSpinner />}
          {!hasMore && <div className='text-center text-muted'>No hay más vacantes para mostrar.</div>}
        </div>
      )}
  
      {seccionActiva === "detalles-vacante" && (
        <div className='w-100 pt-4 pb-4'> 
          <SeccionVacante 
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