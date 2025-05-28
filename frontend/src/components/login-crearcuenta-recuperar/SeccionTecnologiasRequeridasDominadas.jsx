import React, { useState, useEffect } from 'react';
import '../../styles/login-crearcuenta-recuperar/form.css';
import { motion } from 'framer-motion';

export const SeccionTecnologiasRequeridasDominadas = ({ tecnologias, seleccionadas = [], onSeleccionChange, tecnologiasVacante, esperarConfirmacion = false}) => {
  const [tecnologiasSeleccionadas, setTecnologiasSeleccionadas] = useState(seleccionadas);
  const [query, setQuery] = useState('');

  const buscar = (searchQuery) => {
    setQuery(searchQuery);
  };

  useEffect(() => {
    setTecnologiasSeleccionadas(seleccionadas);
  }, [seleccionadas]);

  const manejarSeleccion = (id) => {
    const actualizadas = tecnologiasSeleccionadas.includes(id)
      ? tecnologiasSeleccionadas.filter((item) => item !== id)
      : [...tecnologiasSeleccionadas, id];

    setTecnologiasSeleccionadas(actualizadas);
    if (!esperarConfirmacion) {
      onSeleccionChange(actualizadas);
    }
  };

  const manejarCerrar = () => {
    onSeleccionChange(tecnologiasSeleccionadas);
  };

  // Agrupar tecnologías por categoría
  const tecnologiasPorCategoria = tecnologias.reduce((categorias, tecnologia) => {
    if (!categorias[tecnologia.categoria]) categorias[tecnologia.categoria] = [];
    categorias[tecnologia.categoria].push(tecnologia);
    return categorias;
  }, {});

  return (
    <div>
      {tecnologiasVacante === 1 ? (
        <>
          <h4 className="texto-color mt-4">Agrega las tecnologías requeridas para la vacante</h4>
          <p className="texto-color">
            Haz clic en las tecnologías para seleccionarlas. Las seleccionadas cambiarán de estilo.{' '}
            <span className="text-danger">*</span>
          </p>
        </>
      ) : (
        <>
          <h4 className="texto-color">Agrega las tecnologías que dominas</h4>
          <p className="texto-color">
            Haz clic en las tecnologías para seleccionarlas. Las seleccionadas cambiarán de estilo.{' '}
            <span className="text-danger">*</span>
          </p>
        </>
      )}

      <div className="input-group position-relative mb-4 ">
        <span className="search-icon position-absolute top-50 start-0 translate-middle-y ms-2 text-muted">
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
        // Filtrar tecnologías dentro de la categoría según query
        const tecnologiasFiltradas = tecnologiasCategoria.filter((t) =>
          t.tecnologia.toLowerCase().includes(query.toLowerCase())
        );

        if (tecnologiasFiltradas.length === 0) return null;

        return (
          <div key={categoria} className="tecnologias mb-4">
            <h5 className="texto-color">{categoria}</h5>
            <div className="d-flex flex-wrap gap-2">
              {tecnologiasFiltradas.map((tecnologia) => (
                <motion.button
                  key={tecnologia.id}
                  type="button"
                  className={`btn ${
                    tecnologiasSeleccionadas.includes(tecnologia.id) ? ' btn-tipouno' : ' btn-tipodos'
                  }`}
                  onClick={() => manejarSeleccion(tecnologia.id)}
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

      {tecnologiasVacante === 1 && (
        <div className="d-flex justify-content-between gap-4 mt-4 mb-4">
          <button className="btn btn-cancelar-vacante" onClick={manejarCerrar}>
            Cancelar
          </button>
          <button className="btn btn-publicar-vacante" onClick={manejarCerrar}>
            Guardar
          </button>
        </div>
      )}
    </div>
  );
};
