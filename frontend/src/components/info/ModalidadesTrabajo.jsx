import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const ModalidadesTrabajo = ({ distribucionVacantes }) => {
  // Convertir cantidad_vacantes a número
  const formattedData = distribucionVacantes.map(entry => ({
    ...entry,
    cantidad_vacantes: Number(entry.cantidad_vacantes), // Aseguramos que sea un número
  }));

  // Colores para el gráfico
  const COLORS = ['#F2A922', '#0088FE', '#00C49F'];

  // Obtener las modalidades y su cantidad
  const modalidad1 = distribucionVacantes[0]?.nombre_modalidad || 'N/D';
  const cantidad1 = distribucionVacantes[0]?.cantidad_vacantes || 0;
  
  const modalidad2 = distribucionVacantes[1]?.nombre_modalidad || 'N/D';
  const cantidad2 = distribucionVacantes[1]?.cantidad_vacantes || 0;

  const modalidad3 = distribucionVacantes[2]?.nombre_modalidad || 'N/D';
  const cantidad3 = distribucionVacantes[2]?.cantidad_vacantes || 0;

  return (
    <div>
      {/* Título y descripción */}
      <h4 className='sub-tituloinfo'>Distribución de Vacantes por Modalidad</h4>
      <p className="descripcion-grafica">
        Este gráfico representa cómo se distribuyen las vacantes según su modalidad de trabajo. La modalidad más común es <span className='resaltar'>{modalidad1}</span>, con un total de <span className='resaltar'>{cantidad1}</span> vacantes, lo que indica una alta demanda de esta modalidad. A continuación, encontramos la modalidad <span className='resaltar'>{modalidad2}</span> con <span className='resaltar'>{cantidad2}</span> vacantes, seguida por <span className='resaltar'>{modalidad3}</span> con <span className='resaltar'>{cantidad3}</span> vacantes. Este análisis ofrece una visión clara sobre las preferencias de modalidad de trabajo en el mercado.
      </p>

      {/* Gráfico de pastel */}
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={formattedData}
            dataKey="cantidad_vacantes"
            nameKey="nombre_modalidad"
            cx="50%" 
            cy="50%" 
            outerRadius={150} 
            label
          >
            {
              formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))
            }
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
