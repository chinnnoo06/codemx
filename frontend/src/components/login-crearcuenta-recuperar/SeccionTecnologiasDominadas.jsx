import React, { useState, useEffect } from 'react';
import '../../styles/login-crearcuenta-recuperar/form.css';
import { motion } from 'framer-motion';

export const SeccionTecnologiasDominadas = ({ tecnologias, seleccionadas = [], onSeleccionChange, tecnologiasVacante }) => {
  const [tecnologiasSeleccionadas, setTecnologiasSeleccionadas] = useState(seleccionadas);

  useEffect(() => {
    setTecnologiasSeleccionadas(seleccionadas);
  }, [seleccionadas]);

  const manejarSeleccion = (id) => {
    const actualizadas = tecnologiasSeleccionadas.includes(id)
      ? tecnologiasSeleccionadas.filter((item) => item !== id)
      : [...tecnologiasSeleccionadas, id];

    setTecnologiasSeleccionadas(actualizadas);
  };

  return (
    <div>
      {tecnologiasVacante === 1 ? (
        <>
          <h4 className='texto-color mt-4'>Agrega las tecnologías requeridas para la vacante</h4>
          <p className='texto-color'>
            Haz clic en las tecnologías para seleccionarlas. Las seleccionadas cambiarán de estilo.{' '}
            <span className="text-danger">*</span>
          </p>
        </>
      ) : (
        <>
          <h4 className='texto-color'>Agrega las tecnologías que dominas</h4>
          <p className='texto-color'>
            Haz clic en las tecnologías para seleccionarlas. Las seleccionadas cambiarán de estilo.{' '}
            <span className="text-danger">*</span>
          </p>
        </>
      )}
 

      {Object.entries(tecnologias.reduce((categorias, tecnologia) => {
        if (!categorias[tecnologia.categoria]) categorias[tecnologia.categoria] = [];
        categorias[tecnologia.categoria].push(tecnologia);
        return categorias;
      }, {})).map(([categoria, tecnologiasCategoria]) => (
        <div key={categoria} className="tecnologias mb-4">
          <h5 className="texto-color">{categoria}</h5>
          <div className="d-flex flex-wrap gap-2">
            {tecnologiasCategoria.map((tecnologia) => (
              <motion.button
                key={tecnologia.id}
                type="button"
                className={`btn ${
                  tecnologiasSeleccionadas.includes(tecnologia.id)
                    ? 'btn-tecnologia btn-tipouno'
                    : 'btn-tecnologia btn-tipodos'
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

      {tecnologiasVacante === 1 && (
      <div className="d-flex justify-content-between gap-4 mt-4 mb-4">
        <button className="btn btn-cancelar-vacante" onClick={() => onSeleccionChange(tecnologiasSeleccionadas)}>
          Cancelar
        </button>
        <button className="btn btn-publicar-vacante" onClick={() => onSeleccionChange(tecnologiasSeleccionadas)}>
          Guardar
        </button>
      </div>
      )}

    </div>
  );
};
