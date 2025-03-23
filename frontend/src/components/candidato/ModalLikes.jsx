import React, { useState } from 'react';
import '../../styles/empresa/publicacion.css';

export const ModalLikes = ({likes, irAlPerfilCandidato, irAMiPerfil, idCandidato}) => {
    const [query, setQuery] = useState('');

    // Función para filtrar seguidores
    const buscar = (searchQuery) => {
        setQuery(searchQuery);
    };

    const usuariosFiltrados = likes.filter((candidato) =>
        `${candidato.Nombre} ${candidato.Apellido}`.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="container container-modal">
             <h5 className="mb-3 text-center titulo-modal">Likes</h5>
            {/* Barra de búsqueda */}
            <div className="input-group mb-4 position-relative">
            <span className="search-icon position-absolute top-50 start-0 translate-middle-y ms-2 text-muted">
                <i className="fa fa-search"></i>
            </span>
            <input
                type="text"
                name="query"
                placeholder="Buscar Usuario"
                className="form-control rounded input-busqueda"
                value={query}
                onChange={(e) => buscar(e.target.value)}
            />
            </div>
    
            {/* Lista de seguidores */}
            <div className="usuario-reaccion-list">
            {usuariosFiltrados && usuariosFiltrados.length > 0 ? (
                usuariosFiltrados.map((candidato) => {
                const nombreCompleto = `${candidato.Nombre} ${candidato.Apellido}`;;
                
                return (
                    <div
                    key={candidato.ID}
                    onClick={() => {
                      if (candidato.ID == idCandidato) {
                          irAMiPerfil();
                      } 
                      if (candidato.ID != idCandidato) {
                        irAlPerfilCandidato(candidato.ID);
                      }
                    }}
                    className="usuario-reaccion-item d-flex align-items-center mb-3"
                    >
                    <img
                        src={candidato.Fotografia}
                        alt={candidato.Nombre}
                        className="usuario-reaccion-foto rounded-circle me-3"
                    />
    
                    <span className="usuario-reaccion-nombre">{nombreCompleto} {candidato.id}</span>
                    </div>
                );
                })
            ) : (
                <p>La publicacación no tiene likes</p>
            )}
            </div>
        </div>
    )
}
