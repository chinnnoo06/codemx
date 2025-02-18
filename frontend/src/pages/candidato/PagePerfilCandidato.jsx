import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Seccion1PagePerfilCandidato } from '../../components/candidato/Seccion1PagePerfilCandidato'
import { Seccion2PagePerfilCandidato } from '../../components/candidato/Seccion2PagePerfilCandidato'
import { Seccion3PagePerfilCandidato } from '../../components/candidato/Seccion3PagePerfilCandidato'

export const PagePerfilCandidato = ({candidatoActivo}) => {
    const location = useLocation();
    const { idCandidato } = location.state || {}; 
    const [candidato, setCandidato] = useState(null);

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
      } catch (error) {
        console.error('Error al obtener el perfil del candidato:', error);
      }
    };

    fetchData();
  }, [idCandidato]);

  if (!candidato) {
    return <div>Cargando perfil...</div>; 
  }

  return (
        <>
            <div className='contenedor-todo'>
                <div className='seccion container mt-4 d-flex justify-content-center'>
                    <Seccion1PagePerfilCandidato candidato={candidato} candidatoActivo={candidatoActivo.id}/>
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
