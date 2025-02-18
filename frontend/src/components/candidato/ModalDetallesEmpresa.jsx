import React from 'react'
import '../../styles/empresa/miperfil.css';

export const ModalDetallesEmpresa = ({empresa}) => {
  return (
    <div>
        <h5 className="text-center titulo-modal">Detalles de la Empresa</h5>
    
        <div className="contenedor-detalles-candidato">
            
            {/* Información */}
            <div className="info-detalles">
            <div className="mb-3">
                <label className="form-label">Nombre</label>
                <p className="form-control-static">{empresa.nombre}</p>
            </div>

            <div className="mb-3">
                <label className="form-label">Descripcion</label>
                <p className="form-control-static">{empresa.descripcion}</p>
            </div>

            <div className="mb-3">
                <label className="form-label">Fecha de Creación</label>
                <p className="form-control-static">{empresa.fecha_creacion}</p>
            </div>

            <div className="mb-3">
                <label className="form-label">Sector</label>
                <p className="form-control-static">{empresa.sector}</p>
            </div>

            <div className="mb-3">
                <label className="form-label">Tamaño</label>
                <p className="form-control-static">{empresa.tamanio}</p>
            </div>

            <div className="mb-3">
                <label className="form-label">Telefono</label>
                <p className="form-control-static">{empresa.telefono}</p>
            </div>

        </div>

        </div>
    
    </div>
  )
}
