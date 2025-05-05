import React from 'react'

export const SeccionListaVacantes = ({vacantes, manejarMostrarSeccionVacante, recomendaciones=null, busqueda=null}) => {
  return (
    <>
        {vacantes && vacantes.length > 0 ? (
            <div className='contenedor-vacantes w-100'>
                {vacantes.map((vacante, index) => (
                    <div key={index} className='vacante d-flex align-items-center pt-3 pb-3' onClick={() => manejarMostrarSeccionVacante(vacante)}>

                        {/* Logo de la empresa */}
                        <div className='fila-foto'>
                            <img
                                src={`${vacante.Empresa_Logo}?t=${new Date().getTime()}`}
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

                            <h5 className='nombre-empresa'>{vacante.Empresa_Nombre}</h5>

                            <div className='datos d-flex'>
                                <span className='estado-vacante text-muted'>{vacante.Estado_Vacante}, México</span>
                                <span className='direccion-vacante text-muted'>{vacante.Ubicacion}</span>
                                <span className='modalidad-vacante text-muted'>({vacante.Modalidad_Vacante})</span>
                                {vacante.Estatus === "activa" && (<span className='estatus-vacante text-muted'>Activa</span>)}
                                {recomendaciones != null && (
                                    <span className="coincidencias-vacante text-muted">Compatibilidad: {vacante.compatibilidad}%</span>
                                )}
                            </div>
                        </div>

                    </div>
                ))}
            </div>
        ) : (
            <>
                {busqueda === 0 ? (
                    <div className='contenedor-sin-vacantes'>
                        <div className='sin-vacantes d-flex flex-column justify-content-center align-items-center'>
                            <i className="fa-solid fa-briefcase icono-vacante mb-2"></i> 
                            <h2 className="texto-no-vacantes">Aún no hay vacantes</h2>
                        </div>
                    </div>
                ) : (
                    <div className='contenedor-sin-resultados d-flex flex-column justify-content-center align-items-center'>
                        <div className='sin-resultados d-flex flex-column align-items-center'>
                            <i className="fa fa-exclamation-circle icono-resultado" aria-hidden="true"></i>
                            <h2 className="texto-no-resultados">No hay resultados</h2>
                        </div>
                    </div>
                )}
            </>


        )}
    </>
  )
}
