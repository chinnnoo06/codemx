import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const SeccionTecnologiasDominadas = ({ tecnologias, seleccionadas = [], onSeleccionChange }) => {
  const [tecnologiasSeleccionadas, setTecnologiasSeleccionadas] = useState(seleccionadas);

  // Sincronizar el estado interno con las tecnologías seleccionadas recibidas
  useEffect(() => {
    setTecnologiasSeleccionadas(seleccionadas);
  }, [seleccionadas]);

  const manejarSeleccion = (id) => {
    const actualizadas = tecnologiasSeleccionadas.includes(id)
      ? tecnologiasSeleccionadas.filter((item) => item !== id)
      : [...tecnologiasSeleccionadas, id];

    setTecnologiasSeleccionadas(actualizadas);
    onSeleccionChange(actualizadas); // Propaga los cambios al componente padre
  };

  return (
    <div>
      <h4>Agrega las tecnologías que dominas </h4>
      <p>Haz clic en las tecnologías para seleccionarlas. Las seleccionadas cambiarán de estilo. <span className="text-danger">*</span></p>

      <div className="d-flex flex-wrap gap-2">
        {tecnologias.map((tecnologia) => (
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
  );
};
