import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/admin/secciongestionusuarios.css';
import { Seccion1PageGestionUsuariosAdmin } from '../../components/admin/Seccion1PageGestionUsuariosAdmin';

export const PageGestionUsuariosAdmin = () => {
  const [candidatos, setCandidatos] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState("candidatos");
  const [isLoading, setIsLoading] = useState(true); 

  const fetchData = useCallback(async () => {
    try {
      const Response = await fetch('https://www.codemx.net/codemx/backend/admin/obtener_usuarios.php', {
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

      setCandidatos(responseData.candidatos);
      setEmpresas(responseData.empresas);
      setIsLoading(false);
    } catch (error) {
      console.error('Error al obtener los datos:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtrar según tipoUsuario y searchQuery
  const usuariosFiltrados = (tipoUsuario === 'candidatos' ? candidatos : empresas).filter(usuario => {
    if (!searchQuery) return true;
    const nombre = tipoUsuario === 'candidatos'
      ? `${usuario.Nombre} ${usuario.Apellido}`.toLowerCase()
      : usuario.Nombre.toLowerCase();
    return nombre.includes(searchQuery.toLowerCase());
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className='contenedor-todo contenedor-seccion-gestionusuarios w-100'>
      <div className='header flex-column py-4'>
         <h2 className='titulo-seccion'> Gestión de Usuarios </h2>
        <div className="input-group position-relative">
          <span
            className="search-icon position-absolute top-50 start-0 translate-middle-y ms-2 text-muted"
          >
            <i className="fa fa-search"></i>
          </span>
          <input
            type="text"
            name="query"
            placeholder="Buscar..."
            className="form-control rounded input-busqueda"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className='contenedor-seleccionar'>
          <div className="d-flex align-items-center gap-3 mt-3">

            <button
              className={`btn ${tipoUsuario === 'candidatos' ? 'btn-tipouno' : 'btn-tipodos'} btn-sm d-flex align-items-center gap-2`}
              onClick={() => setTipoUsuario('candidatos')}
            >
              Mostrar Candidatos
            </button>

            <button
              className={`btn ${tipoUsuario === 'empresas' ? 'btn-tipouno' : 'btn-tipodos'} btn-sm d-flex align-items-center gap-2`}
              onClick={() => setTipoUsuario('empresas')}
            >
              Mostrar Empresas
            </button>
          </div>
        </div>
      </div>

      <div className='w-100 pb-4'>
        <Seccion1PageGestionUsuariosAdmin
          usuarios={usuariosFiltrados}
          tipoUsuario={tipoUsuario}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
};

