import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/admin/secciondenuncias.css';
import { Seccion1PageDenunciaAdmin } from '../../components/admin/Seccion1PageDenunciaAdmin';
import { Seccion2PageDenunciaAdmin } from '../../components/admin/Seccion2PageDenunciaAdmin';

export const PageDenunciasAdmin = () => {
  const [denuncias, setDenuncias] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [isLoading, setIsLoading] = useState(true); 
  const [seccionActiva, setSeccionActiva] = useState("denuncias");
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const Response = await fetch('https://www.codemx.net/codemx/backend/admin/obtener_denuncias.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(),
      });

      if (!Response.ok) {
        const errorData = await Response.json();
        throw new Error(errorData.error || 'Error desconocido');
      }
      const responseData = await Response.json();
      
      setDenuncias(responseData.denuncias);
      setSolicitudes(responseData.solicitudes);
      setIsLoading(false);
    } catch (error) {
      console.error('Error al obtener los datos:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Función para normalizar texto (quitar acentos y poner en minúsculas)
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // Estados válidos para búsqueda
  const estadosValidos = {
    'en revision': true,
    'resuelta': true,
    'rechazada': true
  };

  // Función para determinar si la búsqueda es por estado
  const isEstadoSearch = (query) => {
    return estadosValidos[normalizeText(query)] !== undefined;
  };

  // Función para filtrar denuncias
  const denunciasFiltradas = denuncias.filter(d => {
    const query = normalizeText(searchQuery);
    
    if (isEstadoSearch(searchQuery)) {
      // Búsqueda por estado
      return normalizeText(d.Estado || '') === normalizeText(searchQuery);
    } else {
      // Búsqueda por nombre (comportamiento original)
      return (
        (d.Nombre_Denunciante && normalizeText(d.Nombre_Denunciante).includes(query)) ||
        (d.Apellido_Denunciante && normalizeText(d.Apellido_Denunciante).includes(query)) ||
        (d.Nombre_Denunciado && normalizeText(d.Nombre_Denunciado).includes(query)) ||
        (d.Apellido_Denunciado && normalizeText(d.Apellido_Denunciado).includes(query))
      );
    }
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className='contenedor-todo contenedor-denuncias w-100'>
      <div className='header flex-column py-4'>
        <h2 className='titulo-seccion'> Gestión de Denuncias </h2>
        <span className='text-muted descripcion-seccion'>
          Esta sección permite al administrador visualizar, revisar y moderar todas las vacantes publicadas por las empresas en la plataforma. Aquí podrás identificar contenido inapropiado, eliminar vacantes que infrinjan las normas comunitarias y acceder al perfil de la empresa responsable. Las vacantes se muestran en orden cronológico, de la más reciente a la más antigua, para facilitar el monitoreo constante de la actividad en tiempo real.
        </span>

        <div className="d-flex align-items-center gap-3 mt-3">
          <button
            className={`btn ${seccionActiva === 'denuncias' ? 'btn-tipouno' : 'btn-tipodos'} btn-sm d-flex align-items-center gap-2`}
            onClick={() => setSeccionActiva('denuncias')}
          >
            Denuncias
          </button>

          <button
            className={`btn ${seccionActiva === 'solicitudes' ? 'btn-tipouno' : 'btn-tipodos'} btn-sm d-flex align-items-center gap-2`}
            onClick={() => setSeccionActiva('solicitudes')}
          >
            Revisiones de Calificaciones
          </button>
        </div>

        {seccionActiva === "denuncias" && (
          <div className="input-group position-relative mt-3">
            <span className="search-icon position-absolute top-50 start-0 translate-middle-y ms-2 text-muted">
              <i className="fa fa-search"></i>
            </span>
            <input
              type="text"
              name="query"
              placeholder="Buscar por nombre o estado (En revisión, Resuelta, Rechazada)..."
              className="form-control rounded input-busqueda"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {seccionActiva === "denuncias" && (
        <div className='w-100 pb-4'>
          <Seccion1PageDenunciaAdmin denuncias={denunciasFiltradas} actualizarFetch={fetchData} />
        </div>
      )}

      {seccionActiva === "solicitudes" && (
        <div className='w-100 pb-4'>
          <Seccion2PageDenunciaAdmin solicitudes={solicitudes} actualizarFetch={fetchData}/>
        </div>
      )}
    </div>
  );
};