import React, { useState } from 'react';
import '../../styles/empresa/miperfil.css';

export const ModalSeguidores = ({ seguidores, idEmpresa, fetchSeguidores }) => {
  const [query, setQuery] = useState('');
  const [seguidorAEliminar, setSeguidorAEliminar] = useState(null);

  // Función para eliminar seguimiento
  const toggleSeguir = async (idCandidato) => {
    try {
      const response = await fetch(
        'https://www.codemx.net/codemx/backend/empresa/eliminar_seguimiento.php', // Ruta a tu API
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idEmpresa, idCandidato }),
        }
      );

      const result = await response.json();

      if (result.success) {
        fetchSeguidores(); // Actualiza la lista de seguidores
      } else {
        alert('No se pudo eliminar el seguimiento.');
      }
    } catch (error) {
      console.error('Error al eliminar seguimiento:', error);
      alert('Ocurrió un error al intentar eliminar el seguimiento.');
    }

    setSeguidorAEliminar(null);
  };

  // Función para filtrar seguidores
  const buscar = (searchQuery) => {
    setQuery(searchQuery);


  };

  const seguidoresFiltrados = seguidores.filter((candidato) =>
    `${candidato.Nombre} ${candidato.Apellido}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="container">
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
                className="seguidor-item d-flex align-items-center mb-3"
              >
                <img
                  src={candidato.Fotografia}
                  alt={candidato.Nombre}
                  className="seguidor-foto rounded-circle me-3"
                />

                <span className="seguidor-nombre">{nombreTruncado}</span>

                {candidato.ID && (
                  <button
                    className={`btn btn-eliminar-seguidor ms-auto`}
                    onClick={() => setSeguidorAEliminar(candidato)} 
                  >
                    Eliminar
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <p>No tienes seguidores.</p>
        )}
      </div>

      <div className='modal-confirmacion'>
      {seguidorAEliminar && (
        <div className="modal-overlay-confirmacion">
          <div className="modal-content-confirmacion">
   
            <p>
              ¿Seguro que quieres eliminar el siguimiento de <span className='text-highlight'>{`${seguidorAEliminar.Nombre} ${seguidorAEliminar.Apellido}`}</span>?
            </p>
            <div className="d-flex justify-content-between mt-3">
              <button
                className="btn btn-tipodos btn-sm"
                onClick={() => setSeguidorAEliminar(null)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => toggleSeguir(seguidorAEliminar.ID)} 
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
