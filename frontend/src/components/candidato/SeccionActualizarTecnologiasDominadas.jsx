import React, { useState, useEffect } from 'react';
import '../../styles/candidato/miperfiltecnologiasdominadas.css';
import { motion } from 'framer-motion';

export const SeccionActualizarTecnologiasDominadas = ({candidato, tecnologias, seleccionadas = [], actualizarTecnologiasDominadas, manejarMostrarSeccion}) => {
  const [tecnologiasSeleccionadas, setTecnologiasSeleccionadas] = useState([]);
  const [query, setQuery] = useState('');

  const buscar = (searchQuery) => {
    setQuery(searchQuery);
  };

  useEffect(() => {
    setTecnologiasSeleccionadas(seleccionadas.map((id) => parseInt(id, 10)));
  }, [seleccionadas]);

  // Agrupar tecnologías por categoría
  const tecnologiasPorCategoria = tecnologias.reduce((categorias, tecnologia) => {
    const { categoria } = tecnologia;
    if (!categorias[categoria]) categorias[categoria] = [];
    categorias[categoria].push(tecnologia);
    return categorias;
  }, {});

  const manejarSeleccion = (id) => {
    const actualizadas = tecnologiasSeleccionadas.includes(id)
      ? tecnologiasSeleccionadas.filter((item) => item !== id)
      : [...tecnologiasSeleccionadas, id];

    setTecnologiasSeleccionadas(actualizadas);
  };

  const manejarGuardar = async () => {
    try {
      const payload = {
        idCandidato: candidato.id,
        tecnologiasSeleccionadas,
      };

      console.log('Datos enviados al servidor:', payload);

      const response = await fetch(
        'https://www.codemx.net/codemx/backend/candidato/actualizar_tecnologias_seleccionadas.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (result.success) {
        actualizarTecnologiasDominadas(tecnologiasSeleccionadas);
      } else {
        alert('Error al actualizar las tecnologias.');
      }
    } catch (error) {
      console.error('Error al guardar las tecnologias:', error);
      alert('Error al guardar las tecnologias.');
    }
    manejarMostrarSeccion('Ver-Tecnologias');
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <h2 className="text-center mb-2">Tecnologías Dominadas</h2>
      </div>

      <div className="card mb-4 shadow-sm">
        <div className="input-group position-relative barrabusqueda">
          <span className="search-icon position-absolute top-50 start-0 translate-middle-y ms-3 text-muted">
            <i className="fa fa-search"></i>
          </span>
          <input
            type="text"
            name="query"
            placeholder="Buscar Tecnologia"
            className="form-control rounded input-busqueda"
            value={query}
            onChange={(e) => buscar(e.target.value)}
          />
        </div>

        {Object.entries(tecnologiasPorCategoria).map(([categoria, tecnologiasCategoria]) => {
          const tecnologiasFiltradas = tecnologiasCategoria.filter((t) =>
            t.tecnologia.toLowerCase().includes(query.toLowerCase())
          );

          if (tecnologiasFiltradas.length === 0) return null;

          return (
            <div key={categoria} className="mb-2 body">
              <h5 className="titulos">{categoria}</h5>
              <div className="d-flex flex-wrap gap-2">
                {tecnologiasFiltradas.map((tecnologia) => (
                  <motion.button
                    key={tecnologia.id}
                    type="button"
                    className={`btn ${
                      tecnologiasSeleccionadas.includes(parseInt(tecnologia.id, 10))
                        ? 'btn-tipouno'
                        : 'btn-tipodos'
                    }`}
                    onClick={() => manejarSeleccion(parseInt(tecnologia.id, 10))}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                  >
                    {tecnologia.tecnologia}
                  </motion.button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        className="btn btn-tipodos btn-sm"
        onClick={() => manejarGuardar()}
      >
        Actualizar Tecnologias
      </button>
    </div>
  );
};
