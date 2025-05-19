import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Seccion1PagePerfilCandidato } from '../../components/admin/Seccion1PagePerfilCandidato';
import { Seccion2PagePerfilCandidato } from '../../components/admin/Seccion2PagePerfilCandidato';
import { Seccion3PagePerfilCandidato } from '../../components/admin/Seccion3PagePerfilCandidato';
import LoadingSpinner from '../../components/LoadingSpinner';

export const PagePerfilCandidato = () => {
  const location = useLocation();
  const { idCandidato } = location.state || {}; 
  const [candidato, setCandidato] = useState(null);
  const [isLoading, setIsLoading] = useState(true); 

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('https://www.codemx.net/codemx/backend/empresa/obtener_perfil_de_candidato.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idCandidato })
      });

      if (!response.ok) {
        throw new Error('Error al obtener los datos');
      }

      const candidatoData = await response.json();
      setCandidato(candidatoData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error al obtener el perfil del candidato:', error);
      setIsLoading(false);
    }
  }, [idCandidato]); 

  // Ejecutar solo una vez
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className='contenedor-todo'>
      <div className='seccion container mt-4 d-flex justify-content-center'>
        <Seccion1PagePerfilCandidato candidato={candidato} actualizarFetch={fetchData} />
      </div>
      <div className='seccion container mt-4 py-3 d-flex justify-content-center'>
        <Seccion2PagePerfilCandidato candidato={candidato} />
      </div>
      <div className='seccion container mt-4 mb-4 py-3 d-flex justify-content-center'>
        <Seccion3PagePerfilCandidato candidato={candidato} />
      </div>
    </div>
  );
};
