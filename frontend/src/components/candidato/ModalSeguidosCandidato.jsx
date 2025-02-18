import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 

export const ModalSeguidosCandidato = ({ empresas}) => {
  const [empresasState, setEmpresasState] = useState(empresas);
  const [query, setQuery] = useState('');
  const navigate = useNavigate(); // Hook para redirigir a otra página

  const buscar = (searchQuery) => {
    setQuery(searchQuery);
    const resultados = empresas.filter((empresa) =>
        empresa.Nombre.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setEmpresasState(
        resultados.map((empresa) => ({ ...empresa, isFollowing: true }))
    );
  };

    const irAlPerfilEmpresa = (idEmpresaPerfil) => {
        navigate(`/usuario-candidato/perfil-empresa`, { 
            state: { idEmpresa: idEmpresaPerfil}
        });
    };

  return (
    <div className="container">
        <h5 className="mb-3 text-center titulo-modal">Seguidos</h5>
        {/* Barra de búsqueda */}
        <div className="input-group mb-4 position-relative">
            {/* Icono de búsqueda */}
            <span
                className="search-icon position-absolute top-50 start-0 translate-middle-y ms-2 text-muted"
            >
                <i className="fa fa-search"></i>
            </span>
            <input
                type="text"
                name="query"
                placeholder="Buscar Usuario"
                className="form-control rounded input-busqueda"
                value={query}
                onChange={(e) => buscar(e.target.value) }
            />
        </div>


        <div className="empresas-list">
            {empresasState && empresasState.length > 0 ? (
                empresasState.map((empresa) => (
                    <div
                        key={empresa.ID}
                        onClick={() => {irAlPerfilEmpresa(empresa.ID)}}
                        className="empresa-item d-flex align-items-center mb-3"
                    >
                        <img 
                            src={`${empresa.Logo}?t=${new Date().getTime()}`}
                            alt={empresa.Nombre}
                            className="empresa-logo rounded-circle me-3"/>
                        <span className="empresa-nombre">
                            {empresa.Nombre.length > 17 ? `${empresa.Nombre.substring(0, 17)}...` : empresa.Nombre}
                        </span>
                    </div>
                ))
            ) : (
                <p>No estás siguiendo a ninguna empresa.</p>
            )}
        </div>
    </div>
  )
}
