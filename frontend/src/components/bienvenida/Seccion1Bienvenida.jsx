import React from 'react'
import '../../styles/bienvenida/Bienvenida.css';
import img from '../../resources/fondo.png';

export const Seccion1Bienvenida = () => {
  return (
  <section className="inicio py-7 contenedor-limitado">
    <div className="container">
      <div className="row align-items-center">
        {/* Columna Izquierda: Información */}
        <div className="info col-md-6">
          <h2 className="display-1 fw-bold mb-4" translate="no">CODEMX</h2>
          <p className="text-uppercase fw-semibold fs-4 mb-4">¡El inicio de tu vida profesional!</p>
          <p className="descripcion fs-5">
            Inicia sesión o regístrate en <span className="span fw-semibold" translate="no">CODEMX</span> para encontrar el trabajo de tus sueños como programador. Al iniciar sesión aceptas los términos de política de privacidad y las condiciones de uso de la plataforma de <span className="span fw-semibold" translate="no">CODEMX</span>.
          </p>
        </div>

        {/* Columna Derecha: Imagen */}
        <div className="img col-md-6 text-center">
          <img src={img} alt="img" className="img-fluid rounded" />
        </div>
      </div>
    </div>
  </section>

  )
}
