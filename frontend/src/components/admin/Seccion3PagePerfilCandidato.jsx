import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import '../../styles/candidato/miperfiltecnologiasdominadas.css';

export const Seccion3PagePerfilCandidato = ({candidato}) => {
  const [tecnologiasDominadas, setTecnologiasDominadas] = useState([]);
  const [tecnologias, setTecnologias] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tecnologiasDominadasResponse = await fetch(
          'https://www.codemx.net/codemx/backend/candidato/obtener_tecnologias_dominadas.php',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idCandidato: candidato.id }),
          }
        );
        const tecnologiasDominadasData = await tecnologiasDominadasResponse.json();
  
        const tecnologiasResponse = await fetch(
          'https://www.codemx.net/codemx/backend/config/obtener_tecnologias.php'
        );
        const tecnologiasData = await tecnologiasResponse.json();
  
        setTecnologiasDominadas(tecnologiasDominadasData.tecnologias_dominadas || []);
        setTecnologias(tecnologiasData);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };
  
    fetchData();
  }, [candidato.id]);

  const tecnologiasPorCategoria = tecnologias.reduce((categorias, tecnologia) => {
    // Verificar si la tecnología está dominada
    const tecnologiaDominada = tecnologiasDominadas.find(
      (dom) => parseInt(dom.id_tecnologia, 10) === parseInt(tecnologia.id, 10)
    );
  
    if (tecnologiaDominada) {
      const { categoria } = tecnologia; 
      if (!categorias[categoria]) categorias[categoria] = [];
      categorias[categoria].push({
        ...tecnologiaDominada,
        nombre_tecnologia: tecnologia.tecnologia, 
      });
    }
  
    return categorias;
  }, {});


  return (
    <div className='tecnologias-container px-2'>
       <div className="d-flex justify-content-between align-items-center">
          <h2 className="text-center mb-2">Tecnologías Dominadas</h2>
        </div>

        <div className="card mb-2 shadow-sm">
          {Object.entries(tecnologiasPorCategoria).map(([categoria, tecnologiasCategoria]) => (
            <div key={categoria} className="mb-2 body">
              <h5 className="titulos">{categoria}</h5>
              <div className="d-flex flex-wrap gap-2">
                {tecnologiasCategoria.map((tecnologia) => (
                  <motion.div
                    key={tecnologia.nombre_tecnologia}
                    className="btn-tecnologia"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                  >
                    {tecnologia.nombre_tecnologia}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
              
    </div>
  )
}
