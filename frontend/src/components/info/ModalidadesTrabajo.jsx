import React, { useRef } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const ModalidadesTrabajo = ({ distribucionVacantes }) => {
  const chartRef = useRef();
  const descRef = useRef();

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


  const handleDownload = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const colorTitulo = '#F2A922';
    const colorTexto = '#0B1C26';
  
    pdf.setFont('helvetica');
  
    // === HEADER ===
    pdf.setFillColor(colorTexto);
    pdf.rect(0, 0, 210, 20, 'F');
  
    pdf.setTextColor(colorTitulo);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DISTRIBUCIÓN DE VACANTES POR MODALIDAD', 10, 13);
  
    const logoBaseX = 175;
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor('#dde1e9');
    pdf.text('CODE', logoBaseX, 13);
    const textWidth = pdf.getTextWidth('CODE');
    pdf.setTextColor('#F2A922');
    pdf.text('MX', logoBaseX + textWidth, 13);
  
    // === FOOTER FUNCTION ===
    const agregarFooter = () => {
      const footerY = 285;
      pdf.setDrawColor(230);
      pdf.line(10, footerY - 5, 200, footerY - 5);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(colorTitulo);
      pdf.text('CODEMX - ¡El inicio de tu vida profesional!', 10, footerY);
    };
  
   // === CAPTURA DE IMAGEN DE LA GRÁFICA ===
   const chartCanvas = await html2canvas(chartRef.current, { scale: 3 });
   const chartImg = chartCanvas.toDataURL('image/png');

   // === CONTENIDO ===
   let y = 35;
   
   // Descripción
   pdf.setFontSize(11);
   pdf.setTextColor(colorTexto);
   pdf.setFont('helvetica', 'normal');

   const textoDescripcion = `Este gráfico representa cómo se distribuyen las vacantes según su modalidad de trabajo. La modalidad más común es ${modalidad1}, con un total de ${cantidad1} vacantes, lo que indica una alta demanda de esta modalidad. A continuación, encontramos la modalidad ${modalidad2} con ${cantidad2} vacantes, seguida por ${modalidad3} con ${cantidad3} vacantes. Este análisis ofrece una visión clara sobre las preferencias de modalidad de trabajo en el mercado.`;
   
   const textoDividido = pdf.splitTextToSize(textoDescripcion, 190);
   pdf.text(textoDividido, 10, y); 
   y += 25;  
 
   // Gráfica como imagen
   pdf.addImage(chartImg, 'PNG', 10, y, 190, 120); y += 105;

 
   // Footer en la primera (y única) página
   agregarFooter();
  
    pdf.save('Modalidad_Vacantes.pdf');
  };


  return (
    <div>
      {/* Título y descripción */}
      <div className='d-flex justify-content-between'>
        <h4 className='sub-tituloinfo'>Distribución de Vacantes por Modalidad</h4>
        <button 
          onClick={handleDownload} 
          className='btn boton-descargar'
          title="Descargar PDF"
        >
          <i className="fa-solid fa-download"></i>
        </button>
      </div>

      <p className="descripcion-grafica" ref={descRef}>
        Este gráfico representa cómo se distribuyen las vacantes según su modalidad de trabajo. La modalidad más común es <span className='resaltar'>{modalidad1}</span>, con un total de <span className='resaltar'>{cantidad1}</span> vacantes, lo que indica una alta demanda de esta modalidad. A continuación, encontramos la modalidad <span className='resaltar'>{modalidad2}</span> con <span className='resaltar'>{cantidad2}</span> vacantes, seguida por <span className='resaltar'>{modalidad3}</span> con <span className='resaltar'>{cantidad3}</span> vacantes. Este análisis ofrece una visión clara sobre las preferencias de modalidad de trabajo en el mercado.
      </p>

      <div ref={chartRef} style={{ width: '1200px', height: '600px', position: 'absolute', left: '-9999px', top: 0 }}>
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

      <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
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

    </div>
  );
};
