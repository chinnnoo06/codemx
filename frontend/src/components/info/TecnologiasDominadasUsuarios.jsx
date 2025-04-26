import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Función para truncar el texto a un máximo de 20 caracteres
const truncateText = (text, maxLength = 15) => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export const TecnologiasDominadasUsuarios = ({ tecnologiasDominadas }) => {
  // Recortar los nombres de las tecnologías antes de pasarlos a la gráfica
  const truncatedTecnologias = tecnologiasDominadas.map(tecnologia => ({
    ...tecnologia,
    nombre: truncateText(tecnologia.nombre),
  }));

  // Obtener los datos relevantes para el párrafo
  const tecnologiaMasDominada = tecnologiasDominadas[0]?.nombre || 'N/D';
  const cantidadMasDominada = tecnologiasDominadas[0]?.cantidad || 0;
  const totalTecnologias = tecnologiasDominadas.length;
  
  // Si hay al menos 2 tecnologías, podemos mostrar las 2 más comunes
  const segundaTecnologia = tecnologiasDominadas[1]?.nombre || 'N/D';
  const cantidadSegundaTecnologia = tecnologiasDominadas[1]?.cantidad || 0;

  return (
    <>


        {/* Gráfico de tecnologías dominadas */}
        <h4 className='sub-tituloinfo'>Tecnologías Dominadas por los Candidatos</h4>

        {/* Descripción de los datos */}
        <p className="descripcion-grafica">
          En esta gráfica se presentan las tecnologías dominadas por los candidatos registrados en la plataforma. Cada barra representa el número de personas que dominan una tecnología específica. La tecnología más destacada en nuestra plataforma es <span className='resaltar'>{tecnologiaMasDominada}</span>, con <span className='resaltar'>{cantidadMasDominada}</span> candidatos que la dominan, lo que refleja la alta demanda y relevancia de esta habilidad en el mercado actual.

          Entre las tecnologías más destacadas, también encontramos <span className='resaltar'>{segundaTecnologia}</span>, que tiene una cantidad de <span className='resaltar'>{cantidadSegundaTecnologia}</span> candidatos. Esto nos da una clara indicación de las tendencias tecnológicas predominantes dentro de los perfiles de los candidatos. Además, la diversidad de habilidades técnicas es notable, con tecnologías de diferentes áreas representadas, como el desarrollo web, bases de datos y frameworks modernos.

          En total, se destacan <span className='resaltar'>{totalTecnologias}</span> tecnologías diferentes, lo que muestra una amplia gama de especializaciones dentro de la comunidad de candidatos. Este dato es clave para las empresas que buscan perfiles con una variedad de competencias, ya que les permite identificar rápidamente qué tecnologías están más dominadas y cuáles podrían ser áreas de oportunidad para la capacitación y el crecimiento de su equipo.

          La información proporcionada por esta gráfica es útil para ajustarse a las demandas actuales del mercado.
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
