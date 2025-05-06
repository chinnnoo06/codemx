import React, { useState, useEffect, useCallback } from 'react';

export const PageInicioCandidato = ( {candidato} ) => {
  const [empresas, setEmpresas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      // Obtener las tecnologías dominadas por los usuarios
      const responseEmpresas = await fetch('https://www.codemx.net/codemx/backend/candidato/obtener_empresas_recomendadas.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idCandidato: candidato.id }),
      });

      if (!responseEmpresas.ok) {
        const errorDataEmpresas = await responseEmpresas.json();
        throw new Error(errorDataEmpresas.error || 'Error al obtener empresas');
      }

      const empresasData = await responseEmpresas.json();
      setEmpresas(empresasData.empresas); // Ajusta esto según la estructura de la respuesta

      setIsLoading(false);
    } catch (error) {
      console.error('Error al obtener los datos de las estadísticas:', error);
      setIsLoading(false);
    }
  }, []);
  
    useEffect(() => {
      fetchData();
    }, [fetchData]);
  
    console.log(empresas)

  return (
    <div>PageInicioCandidato</div>
  )
}
