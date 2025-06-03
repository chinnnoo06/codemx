import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/seccioninformacion.css';
import { TecnologiasDominadasUsuarios } from '../../components/info/TecnologiasDominadasUsuarios';
import { TecnologiasRequeridasVacantes } from '../../components/info/TecnologiasRequeridasVacantes';
import { ModalidadesTrabajo } from '../../components/info/ModalidadesTrabajo';

export const PageInformacion = () => {
  const [tecnologiasDominadas, setTecnologiasDominadas] = useState([]);
  const [tecnologiasSolicitadas, setTecnologiasSolicitadas] = useState([]);
  const [distribucionVacantes, setDistribucionVacantes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      // Obtener las tecnologías dominadas por los usuarios
      const responseTecnologiasDominadas = await fetch('https://www.codemx.net/codemx/backend/config/tecnologias_dominadas_usuarios.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!responseTecnologiasDominadas.ok) {
        const errorData = await responseTecnologiasDominadas.json();
        throw new Error(errorData.error || 'Error al obtener tecnologías dominadas');
      }

      const tecnologiasDominadasData = await responseTecnologiasDominadas.json();
      setTecnologiasDominadas(tecnologiasDominadasData.tecnologias); // Ajusta esto según la estructura de la respuesta

      // Obtener las tecnologías solicitadas por las empresas en sus vacantes
      const responseTecnologiasSolicitadas = await fetch('https://www.codemx.net/codemx/backend/config/tecnologias_requeridas_vacantes.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!responseTecnologiasSolicitadas.ok) {
        const errorData = await responseTecnologiasSolicitadas.json();
        throw new Error(errorData.error || 'Error al obtener tecnologías solicitadas');
      }

      const tecnologiasSolicitadasData = await responseTecnologiasSolicitadas.json();
      setTecnologiasSolicitadas(tecnologiasSolicitadasData.tecnologias); // Ajusta esto según la estructura de la respuesta

      // Obtener la distribución de las vacantes por modalidad de trabajo
      const responseDistribucionVacantes = await fetch('https://www.codemx.net/codemx/backend/config/modalidad_trabajo.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!responseDistribucionVacantes.ok) {
        const errorData = await responseDistribucionVacantes.json();
        throw new Error(errorData.error || 'Error al obtener distribución de vacantes');
      }

      const distribucionVacantesData = await responseDistribucionVacantes.json();
      setDistribucionVacantes(distribucionVacantesData.distribucion_vacantes); // Ajusta esto según la estructura de la respuesta

      setIsLoading(false);
    } catch (error) {
      console.error('Error al obtener los datos de las estadísticas:', error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return <LoadingSpinner />; // Mostrar el spinner mientras se cargan los datos
  }

  return (
    <div className='contenedor-todo contenedor-seccion-informacion w-100'>
        <div className='header d-flex flex-column w-100 py-4'>
            <h2 className='titulo-seccion'> Centro de Información </h2>
            <span className='text-muted descripcion-seccion'>
            Aquí podrás ver un resumen completo de las tecnologías dominadas por los usuarios de la plataforma, las tecnologías más solicitadas por las empresas en sus vacantes y la distribución de las vacantes según su modalidad de trabajo (presencial, remoto, híbrido).
            </span>

        </div>

        <div className='w-100 pb-4'>
            <TecnologiasDominadasUsuarios 
                tecnologiasDominadas={tecnologiasDominadas}
            />                
        </div>

        <div className='w-100 pb-4'>
            <TecnologiasRequeridasVacantes 
                tecnologiasSolicitadas={tecnologiasSolicitadas}
            />                
        </div>

        <div className='w-100 pb-4'>
            <ModalidadesTrabajo 
                distribucionVacantes={distribucionVacantes}
            />                
        </div>
  
    </div>
  );
};
