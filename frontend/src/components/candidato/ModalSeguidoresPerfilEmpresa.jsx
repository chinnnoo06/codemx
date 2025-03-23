import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 

export const ModalSeguidoresPerfilEmpresa = ({ seguidores, idCandidato }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate(); // Hook para redirigir a otra página

   // Función para filtrar seguidores
   const buscar = (searchQuery) => {
    setQuery(searchQuery);
  };

  const seguidoresFiltrados = seguidores.filter((candidato) =>
    `${candidato.Nombre} ${candidato.Apellido}`.toLowerCase().includes(query.toLowerCase())
  );

  // Función para redirigir al perfil del candidato
  const irAlPerfilCandidato = (idCandidato) => {
    navigate(`/usuario-candidato/perfil-candidato`, { 
        state: { idCandidato: idCandidato }
    });
  };

  const irAMiPerfil= () => {
    navigate(`/usuario-candidato/miperfil-candidato`);
  };


return (
    <div className="container container-mdoal">
      <h5 className="mb-3 text-center titulo-modal">Seguidores</h5>
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
      <div className="seguidores-list">
        {seguidoresFiltrados && seguidoresFiltrados.length > 0 ? (
          seguidoresFiltrados.map((candidato) => {
            const nombreCompleto = `${candidato.Nombre} ${candidato.Apellido}`;
            const nombreTruncado =
              nombreCompleto.length > 20
                ? `${nombreCompleto.substring(0, 17)}...`
                : nombreCompleto;

            return (
              <div
                key={candidato.ID}
                onClick={() => {
                    if (candidato.ID === idCandidato) {
                        irAMiPerfil()
                    } else {
                      irAlPerfilCandidato(candidato.ID)
                    }
                }}
                className="seguidor-item d-flex align-items-center mb-3"
              >
                <img
                  src={candidato.Fotografia}
                  alt={candidato.Nombre}
                  className="seguidor-foto rounded-circle me-3"
                />

                <span className="seguidor-nombre">{nombreTruncado}</span>
              </div>
            );
          })
        ) : (
          <p>No tienes seguidores.</p>
        )}
      </div>


    </div>
  );
}
