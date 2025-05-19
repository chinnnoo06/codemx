import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../../styles/candidato/seccioninicio.css';
import LoadingSpinner from '../../components/LoadingSpinner';
import { SeccionPublicacion } from '../../components/candidato/SeccionPublicacion';

export const PageInicioCandidato = ({ candidato }) => {
  const [empresas, setEmpresas] = useState([]);
  const [publicaciones, setPublicaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProceso, setIsLoadingProceso] = useState(false);
  const [seguimientoEstado, setSeguimientoEstado] = useState({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const observer = useRef();
  const sentinelRef = useRef();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Obtener empresas recomendadas
      const responseEmpresas = await fetch('https://www.codemx.net/codemx/backend/candidato/obtener_empresas_recomendadas.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idCandidato: candidato.id }),
      });

      if (!responseEmpresas.ok) {
        throw new Error('Error al obtener empresas');
      }

      const empresasData = await responseEmpresas.json();
      setEmpresas(empresasData.empresas);

      // Inicializar estado de seguimiento
      const estadoSeguimiento = {};
      empresasData.empresas.forEach((empresa) => {
        estadoSeguimiento[empresa.ID] = false;
      });
      setSeguimientoEstado(estadoSeguimiento);
      
      // Obtener publicaciones
      const responsePublicaciones = await fetch('https://www.codemx.net/codemx/backend/candidato/obtener_publicaciones_inicio.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          empresas: empresasData.empresas, 
          idCandidato: candidato.id, 
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
  }, [candidato.id, page]);

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

  const irAlPerfilEmpresa = (idEmpresaPerfil) => {
    navigate(`/usuario-candidato/perfil-empresa`, { 
      state: { idEmpresa: idEmpresaPerfil }
    });
  };

  const toggleSeguir = async (idEmpresa) => {
    if (isLoadingProceso) return;
    setIsLoadingProceso(true);
    
    try {
      const seguir = !seguimientoEstado[idEmpresa];
      const url = seguir
        ? 'https://www.codemx.net/codemx/backend/candidato/seguir.php'
        : 'https://www.codemx.net/codemx/backend/candidato/dejar_seguir.php';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idCandidato: candidato.id, idEmpresa }),
      });

      const result = await response.json();

      if (result.success) {
        setSeguimientoEstado(prev => ({
          ...prev,
          [idEmpresa]: seguir,
        }));
      }
    } catch (error) {
      console.error('Error al cambiar seguimiento:', error);
    } finally {
      setIsLoadingProceso(false);
    }
  };

  if (isLoading && page === 1) {
    return <LoadingSpinner />; 
  }
  
  console.log(publicaciones)
  return (
    <div className="contenedor-todo contenedor-seccion-notificaciones w-100">
      <div className="header d-flex flex-column w-100 py-4">
        <h2 className="titulo-seccion">Podría Interesarte</h2>
        <span className="text-muted descripcion-seccion">
          Las empresas y publicaciones mostradas aquí son recomendadas para ti, basadas en tus intereses y actividades previas.
        </span>
      </div>

      <div className="empresas-scroll-container">
        <div className="empresas-scroll d-flex">
          {empresas.map((empresa) => (
            <div key={empresa.ID} className="empresa-card d-flex align-items-center flex-column">
              <img
                src={`${empresa.Logo}?t=${new Date().getTime()}`}
                alt={empresa.Nombre}
                className="empresa-logo-card rounded-circle mb-2"
                onClick={() => irAlPerfilEmpresa(empresa.ID)}
                loading="lazy" 
              />
              <span className="empresa-nombre-card">{empresa.Nombre}</span>
              <button 
                className={`btn ${seguimientoEstado[empresa.ID] ? 'btn-tipouno' : 'btn-tipodos'} btn-sm seguir`} 
                onClick={() => toggleSeguir(empresa.ID)}
                disabled={isLoadingProceso}
              >
                {seguimientoEstado[empresa.ID] ? 'Dejar de seguir' : 'Seguir'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="publicaciones-list py-4">
        {publicaciones.length > 0 ? (
          publicaciones.map((publicacion) => (
            <div key={publicacion.ID} className="publicacion-item py-2">
              <SeccionPublicacion 
                publicacion={publicacion} 
                candidato={candidato} 
                idCandidato={candidato.id}
                seccionInicio={1}
                toggleSeguir={toggleSeguir}
                seguimientoEstado={seguimientoEstado}
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