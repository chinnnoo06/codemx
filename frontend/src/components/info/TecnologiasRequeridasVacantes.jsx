import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Función para truncar el texto a un máximo de 20 caracteres
const truncateText = (text, maxLength = 15) => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export const TecnologiasRequeridasVacantes = ({ tecnologiasSolicitadas }) => {
  // Recortar los nombres de las tecnologías antes de pasarlos a la gráfica
  const truncatedTecnologias = tecnologiasSolicitadas.map(tecnologia => ({
    ...tecnologia,
    nombre: truncateText(tecnologia.nombre),
  }));

  // Obtener los datos relevantes para el párrafo
  const tecnologiaMasSolicitada = tecnologiasSolicitadas[0]?.nombre || 'N/D';
  const cantidadMasSolicitada = tecnologiasSolicitadas[0]?.cantidad || 0;
  const totalTecnologias = tecnologiasSolicitadas.length;
  
  // Si hay al menos 2 tecnologías, podemos mostrar las 2 más comunes
  const segundaTecnologia = tecnologiasSolicitadas[1]?.nombre || 'N/D';
  const cantidadSegundaTecnologia = tecnologiasSolicitadas[1]?.cantidad || 0;

  return (
    <>


        {/* Gráfico de tecnologías dominadas */}
        <h4 className='sub-tituloinfo'>Tecnologías Requeridas por las Empresas </h4>

        <p className="descripcion-grafica">
          En esta gráfica se presentan las tecnologías más solicitadas por las empresas en sus vacantes. Cada barra representa el número de veces que una tecnología ha sido mencionada en las ofertas de trabajo. La tecnología más requerida en nuestra plataforma es <span className='resaltar'>{tecnologiaMasSolicitada}</span>, con <span className='resaltar'>{cantidadMasSolicitada}</span> menciones, lo que refleja la alta demanda de esta habilidad en el mercado laboral actual.

          Entre las tecnologías más destacadas, también encontramos <span className='resaltar'>{segundaTecnologia}</span>, que tiene una cantidad de <span className='resaltar'>{cantidadSegundaTecnologia}</span> menciones. Esto nos da una clara indicación de las áreas de conocimiento que las empresas están buscando en sus candidatos. 

          En total, se destacan <span className='resaltar'>{totalTecnologias}</span> tecnologías diferentes, lo que muestra la variedad de habilidades que se requieren en el mercado. Este dato es clave para las empresas que buscan perfiles con competencias técnicas diversas, ya que les permite identificar rápidamente qué tecnologías están más demandadas y cuáles podrían ser áreas de oportunidad para la capacitación de sus equipos.
        </p>


        <ResponsiveContainer width="100%" height={450}>
          <BarChart data={truncatedTecnologias} margin={{ top: 20, right: 0, bottom: 60, left: -42 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="nombre" 
              angle={-45} // Rotar las etiquetas del eje X 45 grados
              textAnchor="end" // Alineación de las etiquetas rotadas
              interval={0} // Asegura que todas las etiquetas sean visibles
              tick={{ fontSize: 12 }} // Tamaño de las etiquetas por defecto
            />
            <YAxis />
            <Tooltip />

            <Bar dataKey="cantidad" fill="#F2A922" />
          </BarChart>
        </ResponsiveContainer>
    </>
  );
}
