import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../../styles/candidato/seccioninicio.css';
import '../../styles/admin/secciongestionpost.css';
import LoadingSpinner from '../../components/LoadingSpinner';
import { SeccionPublicacion } from '../../components/admin/SeccionPublicacion';

export const PageGestionPublicacionesAdmin = () => {
  const [publicaciones, setPublicaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const sentinelRef = useRef();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Obtener publicaciones
      const responsePublicaciones = await fetch('https://www.codemx.net/codemx/backend/admin/obtener_publicaciones.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          page: page 
        })
      });

      if (!responsePublicaciones.ok) {
        throw new Error('Error al obtener publicaciones');
      }

      const publicacionesData = await responsePublicaciones.json();
      
      setPublicaciones(prev => {
        const newPublicaciones = publicacionesData.publicaciones.filter(newPublicacion => 
          !prev.some(prevPublicacion => prevPublicacion.ID === newPublicacion.ID)
        );
        return [...prev, ...newPublicaciones];
      });
      
      setHasMore(publicacionesData.publicaciones.length > 0);
      
    } catch (error) {
      console.error('Error al obtener datos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  // Configurar Intersection Observer
  useEffect(() => {
    if (isLoading || !hasMore) return;

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1 // Se dispara cuando el 10% del elemento es visible
    };

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage(prev => prev + 1);
      }
    }, options);

    if (sentinelRef.current) {
      observer.current.observe(sentinelRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [isLoading, hasMore]);

  // Efecto principal para cargar datos
  useEffect(() => {
    fetchData();
  }, [fetchData]);


  if (isLoading && page === 1) {
    return <LoadingSpinner />; 
  }
  
  console.log(publicaciones)
  return (
    <div className="contenedor-todo contenedor-seccion-post w-100">
      <div className="header d-flex flex-column w-100 py-4">
        <h2 className="titulo-seccion">Gestión de Publicaciones</h2>
        <span className="text-muted descripcion-seccion">
        Esta sección permite al administrador visualizar, revisar y moderar todas las publicaciones realizadas por las empresas en la plataforma. Aquí podrás identificar contenido inapropiado, eliminar publicaciones que infrinjan las normas comunitarias y acceder al perfil de la empresa responsable. Las publicaciones se muestran en orden cronológico, de la más reciente a la más antigua, para facilitar el monitoreo constante de la actividad en tiempo real.
        </span>
      </div>

    <div className="publicaciones-list pb-4">
        {publicaciones.length > 0 ? (
          publicaciones.map((publicacion) => (
            <div key={publicacion.ID} className="publicacion-item py-2">
              <SeccionPublicacion 
                publicacion={publicacion} 
                seccionInicio={1}
              />
            </div>
          ))
        ) : (
          !isLoading && <p>No hay publicaciones disponibles.</p>
        )}
        
        {isLoading && hasMore && <LoadingSpinner />}
        {!hasMore && <div className='text-center text-muted'>No hay más publicaciones para mostrar.</div>}
        
        {/* Elemento centinela para el Intersection Observer */}
        <div ref={sentinelRef} style={{ height: '10px' }} />
      </div>

    </div>
  );
};