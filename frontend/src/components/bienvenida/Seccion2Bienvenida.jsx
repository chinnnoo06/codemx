import React from 'react'
import '../../styles/bienvenida/Bienvenida.css';

export const Seccion2Bienvenida = () => {
  return (
    <section className="beneficios py-7">
      <div className="fondo-beneficios">
        <div className="contenedor-limitado text-center">
          <h2 className="display-3 fw-bold mb-5">Beneficios de Usar CODEMX</h2>
          <div className="row">
            <div className="col-md-4">
              <i className="fas fa-briefcase fa-3x mb-3"></i>
              <h4 className="fw-bold">Encuentra Trabajo</h4>
              <p>Accede a oportunidades laborales exclusivas para programadores en todo México.</p>
            </div>
            <div className="col-md-4">
              <i className="fas fa-laptop-code fa-3x mb-3"></i>
              <h4 className="fw-bold">Crea tu Portafolio</h4>
              <p>Muestra tus habilidades y proyectos para destacar frente a las empresas.</p>
            </div>
            <div className="col-md-4">
              <i className="fas fa-building fa-3x mb-3"></i>
              <h4 className="fw-bold">Conecta con Empresas</h4>
              <p>Conéctate con empresas que buscan perfiles como el tuyo.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

  )
}
