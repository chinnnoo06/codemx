import React, { useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Función para truncar el texto a un máximo de 20 caracteres
const truncateText = (text, maxLength = 15) => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export const TecnologiasRequeridasVacantes = ({ tecnologiasSolicitadas }) => {
  const chartRef = useRef();
  const descRef = useRef();

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

  const maxCantidad = Math.max(...tecnologiasSolicitadas.map(t => t.cantidad));


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
    pdf.text('TECNOLOGÍAS REQUERIDAS POR LAS EMPRESAS', 10, 13);
  
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

   const textoDescripcion = `En esta gráfica se presentan las tecnologías más solicitadas por las empresas en sus vacantes. Cada barra representa el número de veces que una tecnología ha sido mencionada en las ofertas de trabajo. La tecnología más requerida en nuestra plataforma es ${tecnologiaMasSolicitada}, con ${cantidadMasSolicitada} menciones, lo que refleja la alta demanda de esta habilidad en el mercado laboral actual. Entre las tecnologías más destacadas, también encontramos ${segundaTecnologia}, que tiene una cantidad de ${cantidadSegundaTecnologia} menciones. Esto nos da una clara indicación de las áreas de conocimiento que las empresas están buscando en sus candidatos. En total, se destacan ${totalTecnologias} tecnologías diferentes, lo que muestra la variedad de habilidades que se requieren en el mercado. Este dato es clave para las empresas que buscan perfiles con competencias técnicas diversas, ya que les permite identificar rápidamente qué tecnologías están más demandadas y cuáles podrían ser áreas de oportunidad para la capacitación de sus equipos.`;
   
   const textoDividido = pdf.splitTextToSize(textoDescripcion, 190);
   pdf.text(textoDividido, 10, y); 
   y += 55;  
 
   // Gráfica como imagen
   pdf.addImage(chartImg, 'PNG', 10, y, 190, 120); y += 105;

 
   // Footer en la primera (y única) página
   agregarFooter();
  
    pdf.save('Tecnologias_Requeridas.pdf');
  };

  return (
    <>


        {/* Gráfico de tecnologías dominadas */}
        <div className='d-flex justify-content-between'>
          <h4 className='sub-tituloinfo'>Tecnologías Requeridas por las Empresas </h4>
          <button 
            onClick={handleDownload} 
            className='btn boton-descargar'
            title="Descargar PDF"
          >
            <i className="fa-solid fa-download"></i>
          </button>
        </div>
        

        <p className="descripcion-grafica" ref={descRef}>
          En esta gráfica se presentan las tecnologías más solicitadas por las empresas en sus vacantes. Cada barra representa el número de veces que una tecnología ha sido mencionada en las ofertas de trabajo. La tecnología más requerida en nuestra plataforma es <span className='resaltar'>{tecnologiaMasSolicitada}</span>, con <span className='resaltar'>{cantidadMasSolicitada}</span> menciones, lo que refleja la alta demanda de esta habilidad en el mercado laboral actual.

          Entre las tecnologías más destacadas, también encontramos <span className='resaltar'>{segundaTecnologia}</span>, que tiene una cantidad de <span className='resaltar'>{cantidadSegundaTecnologia}</span> menciones. Esto nos da una clara indicación de las áreas de conocimiento que las empresas están buscando en sus candidatos. 

          En total, se destacan <span className='resaltar'>{totalTecnologias}</span> tecnologías diferentes, lo que muestra la variedad de habilidades que se requieren en el mercado. Este dato es clave para las empresas que buscan perfiles con competencias técnicas diversas, ya que les permite identificar rápidamente qué tecnologías están más demandadas y cuáles podrían ser áreas de oportunidad para la capacitación de sus equipos.
        </p>

        <div ref={chartRef} style={{ width: '1600px', height: '600px', position: 'absolute', left: '-9999px', top: 0 }}>
          <ResponsiveContainer width="100%" height={450}>
            <BarChart data={truncatedTecnologias} margin={{ top: 20, right: 20, bottom: 60, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="nombre" 
                angle={-45} // Rotar las etiquetas del eje X 45 grados
                textAnchor="end" // Alineación de las etiquetas rotadas
                interval={0} // Asegura que todas las etiquetas sean visibles
                tick={{ fontSize: 12 }} // Tamaño de las etiquetas por defecto
              />
              <YAxis 
                domain={[0, maxCantidad]} 
                ticks={[...Array(maxCantidad + 1).keys()].filter(n => n % 1 === 0)} 
              />

              <Tooltip />

              <Bar dataKey="cantidad" fill="#F2A922" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ width: '100%', height: 450 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={truncatedTecnologias} margin={{ top: 20, right: 20, bottom: 60, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="nombre" 
                  angle={-45} // Rotar las etiquetas del eje X 45 grados
                  textAnchor="end" // Alineación de las etiquetas rotadas
                  interval={0} // Asegura que todas las etiquetas sean visibles
                  tick={{ fontSize: 12 }} // Tamaño de las etiquetas por defecto
                />
                <YAxis 
                  domain={[0, maxCantidad]} 
                  ticks={[...Array(maxCantidad + 1).keys()].filter(n => n % 1 === 0)} 
                />

                <Tooltip />

                <Bar dataKey="cantidad" fill="#F2A922" />
              </BarChart>
            </ResponsiveContainer>
          </div>

    </>
  );
}
