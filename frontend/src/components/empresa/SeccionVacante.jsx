import React, { useState, useEffect, useCallback } from 'react';

export const SeccionVacante = ({empresa, vacante, manejarOcultarSeccionVacante, actualizarFetch, setVacanteSeleccionada}) => {

    const [requisitos, setRequisitos] = useState([]);
    const [responsabilidades, setResponsabilidades] = useState([]);

     // Función para obtener datos del backend
    const fetchData = useCallback(async () => {
        try {
            const Response = await fetch('https://www.codemx.net/codemx/backend/empresa/obtener_requisitos_responsabilidades_vacante.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idVacante: vacante.ID }),
            });

            if (!Response.ok) {
                const errorData = await Response.json();
                throw new Error(errorData.error || 'Error desconocido');
            }
            const responseData= await Response.json();

            // Actualizar estados
            setRequisitos(responseData.requisitos);
            setResponsabilidades(responseData.responsabilidades);

        } catch (error) {
            console.error('Error al obtener los requisitos y requerimientos de la vacante:', error);
        }
    }, [empresa.id]); 

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
  return (
    <>
        <div className='vacante-detalle  d-flex justify-content-column flex-column  pt-3 pb-3'>

            <div className='informacion-principal d-flex align-items-center mb-4'>
                {/* Logo de la empresa */}
                <div className='fila-foto'>
                    <img
                        src={`${empresa.logo}?t=${new Date().getTime()}`}
                        alt="Perfil"
                        className="foto-perfil-empresa rounded-circle"
                    />
                </div>

                {/* Información de la vacante */}
                <div className='fila-info'>
                    <div className='d-flex justify-content-between align-items-start '>
                        <h4 className='titulo-vacante'>{vacante.Titulo}</h4>

                        {/* Número de postulados (se acomoda según pantalla) */}
                        <div className="postulados d-flex align-items-center">
                            <i className="fa-solid fa-users text-muted me-2"></i>
                            <span className="text-muted">{vacante.Cantidad_Postulados} postulados</span>
                        </div>
                    </div>
                    
                    <div className='datos d-flex'>
                        <span className='estado-vacante text-muted'>{vacante.Estado_Vacante}, México</span>
                        <span className='direccion-vacante text-muted'>{vacante.Ubicacion}</span>
                        <span className='modalidad-vacante text-muted'>({vacante.Modalidad_Vacante})</span>
                    </div>

                   
                </div>
            </div>

            <div className='informacion-detallada '>
                <div className='descripcion mb-4'>
                    <h5 className='subtitulo-descripcion'>Descripción de la vacante</h5>
                    <span>{vacante.Descripcion}</span>
                </div>
                <div className='requisitos mb-4'>
                    <h5 className='subtitulo-descripcion'>Descripción de la vacante</h5>
                    <span>{vacante.Descripcion}</span>
                </div>

            </div>
           

        </div>
    </>
  )
}
