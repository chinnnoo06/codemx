import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Seccion1PagePerfilCandidato } from '../../components/empresa/Seccion1PagePerfilCandidato'
import { Seccion2PagePerfilCandidato } from '../../components/empresa/Seccion2PagePerfilCandidato'
import { Seccion3PagePerfilCandidato } from '../../components/empresa/Seccion3PagePerfilCandidato'
import LoadingSpinner from '../../components/LoadingSpinner';

export const PagePerfilCandidato = ({empresa}) => {
    const location = useLocation();
    const { idCandidato } = location.state || {}; 
    const [candidato, setCandidato] = useState(null);
    const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://www.codemx.net/codemx/backend/empresa/obtener_perfil_de_candidato.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idCandidato: idCandidato })
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
    };

    fetchData();
  }, [idCandidato]);

  if (isLoading) {
    return <LoadingSpinner></LoadingSpinner> 
  }

  return (
        <>
            <div className='contenedor-todo'>
                <div className='seccion container mt-4 d-flex justify-content-center'>
                    <Seccion1PagePerfilCandidato candidato={candidato} idEmpresa={empresa.id}/>
                </div>
                <div className='seccion container mt-4 py-3 d-flex justify-content-center'>
                    <Seccion2PagePerfilCandidato candidato={candidato}/>
                </div>
                <div className='seccion container mt-4 mb-4 py-3 d-flex justify-content-center'>
                    <Seccion3PagePerfilCandidato candidato={candidato}/>
                </div>
            </div>
        </>
  );
};
