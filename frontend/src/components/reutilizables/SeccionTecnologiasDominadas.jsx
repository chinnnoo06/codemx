import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const SeccionTecnologiasDominadas = ({ tecnologias, seleccionadas = [], onSeleccionChange }) => {
  const [tecnologiasSeleccionadas, setTecnologiasSeleccionadas] = useState(seleccionadas);

  useEffect(() => {
    setTecnologiasSeleccionadas(seleccionadas);
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
    onSeleccionChange(actualizadas); // Propaga los cambios al componente padre
  };

  return (
    <div>
      <h4>Agrega las tecnologías que dominas</h4>
      <p>
        Haz clic en las tecnologías para seleccionarlas. Las seleccionadas cambiarán de estilo.{' '}
        <span className="text-danger">*</span>
      </p>

      {Object.entries(tecnologiasPorCategoria).map(([categoria, tecnologiasCategoria]) => (
        <div key={categoria} className="mb-4">
          <h5 className="text-primary">{categoria}</h5>
          <div className="d-flex flex-wrap gap-2">
            {tecnologiasCategoria.map((tecnologia) => (
              <motion.button
                key={tecnologia.id}
                type="button"
                className={`btn ${
                  tecnologiasSeleccionadas.includes(tecnologia.id)
                    ? 'btn-warning'
                    : 'btn-outline-warning'
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
      ))}
    </div>
  );
};
