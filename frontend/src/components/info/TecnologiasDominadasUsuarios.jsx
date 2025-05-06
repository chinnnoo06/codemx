import React, { useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const truncateText = (text, maxLength = 15) => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

export const TecnologiasDominadasUsuarios = ({ tecnologiasDominadas }) => {
  const chartRef = useRef();
  const descRef = useRef();

  const truncatedTecnologias = tecnologiasDominadas.map(tecnologia => ({
    ...tecnologia,
    nombre: truncateText(tecnologia.nombre),
  }));

  const tecnologiaMasDominada = tecnologiasDominadas[0]?.nombre || 'N/D';
  const cantidadMasDominada = tecnologiasDominadas[0]?.cantidad || 0;
  const totalTecnologias = tecnologiasDominadas.length;
  const segundaTecnologia = tecnologiasDominadas[1]?.nombre || 'N/D';
  const cantidadSegundaTecnologia = tecnologiasDominadas[1]?.cantidad || 0;
  const maxCantidad = Math.max(...tecnologiasDominadas.map(t => t.cantidad));

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
    pdf.text('TECNOLOGÍAS DOMINADA POR LOS CANDIDATOS', 10, 13);
  
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
  
    // === CAPTURA DE IMÁGENES ===  
    const chartCanvas = await html2canvas(chartRef.current, { scale: 3 });
    const chartImg = chartCanvas.toDataURL('image/png');
  
    // === CONTENIDO ===
    let y = 35;
    
    // Descripción
    pdf.setFontSize(11);
    pdf.setTextColor(colorTexto);
    pdf.setFont('helvetica', 'normal');

    const textoDescripcion = `En esta gráfica se presentan las tecnologías dominadas por los candidatos registrados en la plataforma. Cada barra representa el número de personas que dominan una tecnología específica. La tecnología más destacada en nuestra plataforma es ${tecnologiaMasDominada}, con ${cantidadMasDominada} candidatos que la dominan, lo que refleja la alta demanda y relevancia de esta habilidad en el mercado actual. Entre las tecnologías más destacadas, también encontramos ${segundaTecnologia}, que tiene una cantidad de ${cantidadSegundaTecnologia} candidatos. Esto nos da una clara indicación de las tendencias tecnológicas predominantes dentro de los perfiles de los candidatos. Además, la diversidad de habilidades técnicas es notable, con tecnologías de diferentes áreas representadas, como el desarrollo web, bases de datos y frameworks modernos. En total, se destacan ${totalTecnologias} tecnologías diferentes, lo que muestra una amplia gama de especializaciones dentro de la comunidad de candidatos. Este dato es clave para las empresas que buscan perfiles con una variedad de competencias, ya que les permite identificar rápidamente qué tecnologías están más dominadas y cuáles podrían ser áreas de oportunidad para la capacitación y el crecimiento de su equipo. La información proporcionada por esta gráfica es útil para ajustarse a las demandas actuales del mercado.`;


    const textoDividido = pdf.splitTextToSize(textoDescripcion, 190);
    pdf.text(textoDividido, 10, y); 
    y += 55;  
  
    // Gráfica como imagen
    pdf.addImage(chartImg, 'PNG', 10, y, 190, 100); y += 105;
  
    // Footer en la primera (y única) página
    agregarFooter();
  
    pdf.save('Tecnologias_Dominadas.pdf');
  };
  

  return (
    <>
      <div className='d-flex justify-content-between'>
        <h4 className='sub-tituloinfo'>Tecnologías Dominadas por los Candidatos</h4>
        <button 
          onClick={handleDownload} 
          className='btn boton-descargar'
          title="Descargar PDF"
        >
          <i className="fa-solid fa-download"></i>
        </button>
      </div>

      {/* Descripción con estilos visibles */}
      <p className="descripcion-grafica" ref={descRef}>
        En esta gráfica se presentan las tecnologías dominadas por los candidatos registrados en la plataforma. Cada barra representa el número de personas que dominan una tecnología específica. La tecnología más destacada en nuestra plataforma es <span className='resaltar'>{tecnologiaMasDominada}</span>, con <span className='resaltar'>{cantidadMasDominada}</span> candidatos que la dominan, lo que refleja la alta demanda y relevancia de esta habilidad en el mercado actual.
        Entre las tecnologías más destacadas, también encontramos <span className='resaltar'>{segundaTecnologia}</span>, que tiene una cantidad de <span className='resaltar'>{cantidadSegundaTecnologia}</span> candidatos. Esto nos da una clara indicación de las tendencias tecnológicas predominantes dentro de los perfiles de los candidatos. Además, la diversidad de habilidades técnicas es notable, con tecnologías de diferentes áreas representadas, como el desarrollo web, bases de datos y frameworks modernos.
        En total, se destacan <span className='resaltar'>{totalTecnologias}</span> tecnologías diferentes, lo que muestra una amplia gama de especializaciones dentro de la comunidad de candidatos. Este dato es clave para las empresas que buscan perfiles con una variedad de competencias, ya que les permite identificar rápidamente qué tecnologías están más dominadas y cuáles podrían ser áreas de oportunidad para la capacitación y el crecimiento de su equipo.
        La información proporcionada por esta gráfica es útil para ajustarse a las demandas actuales del mercado.
      </p>

      {/* Gráfica */}
      <div ref={chartRef}>
        <ResponsiveContainer width="100%" height={450}>
          <BarChart data={truncatedTecnologias} margin={{ top: 20, right: 0, bottom: 60, left: -42 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="nombre" 
              angle={-45}
              textAnchor="end"
              interval={0}
              tick={{ fontSize: 12 }}
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
};
