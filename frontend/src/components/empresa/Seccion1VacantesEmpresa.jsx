import React from 'react'
import '../../styles/empresa/seccionvacantesempresa.css';

export const Seccion1VacantesEmpresa = ({empresa, vacantes, manejarMostrarSeccionVacante}) => {
  return (
    <>
        {vacantes && vacantes.length > 0 ? (
            <div className='contenedor-vacantes w-100'>
                {vacantes.map((vacante, index) => (
                    <div key={index} className='vacante d-flex align-items-center pt-3 pb-3' onClick={() => manejarMostrarSeccionVacante(vacante)}>

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
                            
                            <h5 className='nombre-empresa'>{empresa.nombre}</h5>
                            
                            <div className='datos d-flex'>
                                <span className='estado-vacante text-muted'>{vacante.Estado_Vacante}, México</span>
                                <span className='direccion-vacante text-muted'>{vacante.Ubicacion}</span>
                                <span className='modalidad-vacante text-muted'>({vacante.Modalidad_Vacante})</span>
                            </div>
                        </div>

                    </div>
                ))}
            </div>
        ) : (
            <div className='contenedor-sin-vacantes'>
                <div className='sin-vacantes d-flex flex-column justify-content-center align-items-center'>
                    <i className="fa-solid fa-briefcase icono-vacante mb-2"></i> 
                    <h2 className="texto-no-vacantes">Aún no hay vacantes</h2>
                </div>
            </div>
        )}
    </>
  )
}
