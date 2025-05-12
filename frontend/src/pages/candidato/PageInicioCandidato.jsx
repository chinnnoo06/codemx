import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../../styles/candidato/seccioninicio.css';
import LoadingSpinner from '../../components/LoadingSpinner';
import { SeccionPublicacion } from '../../components/candidato/SeccionPublicacion';

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

export const PageInicioCandidato = ({ candidato }) => {
const [empresas, setEmpresas] = useState([]);
  const [publicaciones, setPublicaciones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProceso, setIsLoadingProceso] = useState(false);
  const [seguimientoEstado, setSeguimientoEstado] = useState({}); // Mapa de empresas seguidas
  const [page, setPage] = useState(1); // Página inicial
  const [hasMore, setHasMore] = useState(true); // Para saber si hay más publicaciones que cargar
  const navigate = useNavigate(); 

  const fetchData = useCallback(async () => {
    try {
      // Obtener las empresas recomendadas para el candidato
      const responseEmpresas = await fetch('https://www.codemx.net/codemx/backend/candidato/obtener_empresas_recomendadas.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idCandidato: candidato.id }),
      });

      if (!responseEmpresas.ok) {
        const errorDataEmpresas = await responseEmpresas.json();
        throw new Error(errorDataEmpresas.error || 'Error al obtener empresas');
      }

      const empresasData = await responseEmpresas.json();
      setEmpresas(empresasData.empresas);

      // Inicializar el estado de seguimiento para cada empresa
      const estadoSeguimiento = {};
      empresasData.empresas.forEach((empresa) => {
        estadoSeguimiento[empresa.ID] = false; // Inicializa en "no seguido"
      });

      setSeguimientoEstado(estadoSeguimiento);
      
      // Ahora obtenemos las publicaciones
      const responsePublicaciones = await fetch('https://www.codemx.net/codemx/backend/candidato/obtener_publicaciones_inicio.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ empresas: empresasData.empresas, idCandidato: candidato.id, page: page })
      });

      if (!responsePublicaciones.ok) {
        throw new Error('Error al obtener las publicaciones');
      }

      const publicacionesData = await responsePublicaciones.json();
      
      setPublicaciones(prev => {
        const newPublicaciones = publicacionesData.publicaciones.filter(newPublicacion => 
          !prev.some(prevPublicacion => prevPublicacion.ID === newPublicacion.ID)
        );
        return [...prev, ...newPublicaciones];
      });
      
      setHasMore(publicacionesData.publicaciones.length > 0);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error al obtener los datos de las estadísticas:', error);
      setIsLoading(false);
    }
  }, [candidato.id, page]);

  // Efecto principal para cargar datos
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Manejo del scroll con throttle
  const handleScroll = useCallback(() => {
    if (isLoading || !hasMore) return;
    
    const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
    const scrollThreshold = document.documentElement.scrollHeight - 800;
    
    if (scrollPosition >= scrollThreshold) {
      setPage(prev => prev + 1);
    }
  }, [isLoading, hasMore]);

  // Efecto para el scroll con throttle
  useEffect(() => {
    const throttledScroll = throttle(handleScroll, 100);
    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [handleScroll]);

  const irAlPerfilEmpresa = (idEmpresaPerfil) => {
      navigate(`/usuario-candidato/perfil-empresa`, { 
            state: { idEmpresa: idEmpresaPerfil}
        });
  };

  const toggleSeguir = async (idEmpresa) => {
    if (isLoadingProceso) return;
    setIsLoadingProceso(true);
    
    try {
        const seguir = !seguimientoEstado[idEmpresa]; // Cambiar el estado de seguimiento
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

        if (!result.success) {
          alert('No se pudo actualizar el seguimiento.');
        } else {
          // Actualizar el estado de seguimiento para la empresa
          setSeguimientoEstado((prevState) => ({
            ...prevState,
            [idEmpresa]: seguir,
          }));
        }
    } catch (error) {
        console.error('Error al cambiar el estado de seguimiento:', error);
        alert('Ocurrió un error al intentar cambiar el estado de seguimiento.');
    } finally {
        setIsLoadingProceso(false);
    }
  };

  if (isLoading && page === 1) {
    return <LoadingSpinner></LoadingSpinner>; 
  }
  
  console.log(publicaciones);

  return (
    <div className="contenedor-todo contenedor-seccion-notificaciones w-100">
      <div className="header d-flex flex-column w-100 py-4">
        <h2 className="titulo-seccion">Podría Interesarte</h2>
        <span className="text-muted descripcion-seccion">
          Las empresas y publicaciones mostradas aquí son recomendadas para ti, basadas en tus intereses y actividades previas. ¡Descubre nuevas oportunidades y conéctate con ellas!
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
              />
              <span className="empresa-nombre-card">{empresa.Nombre}</span>
              <button 
                className={`btn ${seguimientoEstado[empresa.ID] ? 'btn-tipouno' : 'btn-tipodos'} btn-sm seguir`} 
                onClick={() => toggleSeguir(empresa.ID)}
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
        {isLoading && hasMore && <LoadingSpinner />} {/* Spinner al cargar más */}
        {!hasMore && <div className='text-center text-muted'>No hay más publicaciones para mostrar.</div>}
      </div>
    </div>
  );
};
