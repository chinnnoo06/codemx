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
                <label className="form-label">Email</label>
                <p className="form-control-static">{empresa.email}</p>
              </div>
              <div className="mb-3">
                <label className="form-label">Correo Verificado</label>
                <p className="form-control-static">{empresa.Correo_Verificado === "1" ? 'Sí' : 'No'}</p>
              </div>
              <div className="mb-3">
                <label className="form-label">RFC Verificado</label>
                <p className="form-control-static">{empresa.RFC_Verificado === "1" ? 'Sí' : 'No'}</p>
              </div>
              <div className="mb-3">
                <label className="form-label">Estado Cuenta</label>
                <p className="form-control-static">{empresa.Estado_Cuenta === "1" ? 'Activa' : 'Inactiva'}</p>
              </div>
              <div className="mb-3">
                <label className="form-label">Fecha Registro</label>
                <p className="form-control-static">{empresa.Fecha_Registro}</p>
              </div>
              <div className="mb-3">
                <label className="form-label">Strikes</label>
                <p className="form-control-static">{empresa.Strikes}</p>
              </div>
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
