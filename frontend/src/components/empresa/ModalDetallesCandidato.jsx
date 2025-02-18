import React, { useState } from 'react';
import '../../styles/candidato/miperfil.css';

export const ModalDetallesCandidato = ({ candidato}) => {

    return (
        <div>
            <h5 className="text-center titulo-modal">Detalles del Candidato</h5>
        
            <div className="contenedor-detalles-candidato">
              
                {/* Información */}
                <div className="info-detalles">
                <div className="mb-3">
                  <label className="form-label">Nombre</label>
                  <p className="form-control-static">{candidato.nombre} {candidato.apellido}</p>
                </div>

                <div className="mb-3">
                  <label className="form-label">Fecha de Nacimiento</label>
                  <p className="form-control-static">{candidato.fecha_nacimiento}</p>
                </div>

                <div className="mb-3">
                  <label className="form-label">Teléfono</label>
                  <p className="form-control-static">{candidato.telefono}</p>
                </div>

                <div className="mb-3">
                  <label className="form-label">Estado</label>
                  <p className="form-control-static">{candidato.estado}</p>
                </div>

                <div className="mb-3">
                  <label className="form-label">Dirección</label>
                  <p className="form-control-static">{candidato.direccion}</p>
                </div>

                <div className="mb-3">
                  <label className="form-label">Sexo</label>
                  <p className="form-control-static">{candidato.sexo}</p>
                </div>

                <div className="mb-3">
                  <label className="form-label">Universidad</label>
                  <p className="form-control-static">{candidato.universidad}</p>
                </div>

                <div className="mb-3">
                  <label className="form-label">Tiempo Restante para Graduarse</label>
                  <p className="form-control-static">{candidato.tiempo_restante}</p>
                </div>

                <div className="mb-3">
                  <label className="form-label">Modalidad de Trabajo Preferida</label>
                  <p className="form-control-static">{candidato.modalidad_trabajo}</p>
                </div>

            </div>

          </div>
      
        </div>
    );
};
