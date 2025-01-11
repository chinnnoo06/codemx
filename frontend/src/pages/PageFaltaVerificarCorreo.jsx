import React from 'react'
import { Link } from 'react-router-dom';
import logo from '../resources/logo.png';

export const PageFaltaVerificarCorreo = () => {

  return (
    <div>

      {/* Header */}
      <div className="contenedor-header container-fluid w-100">
        <header className="d-flex justify-content-center align-items-center">
          <div className="logo">
            <Link to="/"><img src={logo} alt="Logo" /></Link>
          </div>
        </header>
      </div>

      <div className="verificacion-correo text-center py-5">
        <h2 className="mb-3">¡Ups! Falta verificar tu cuenta</h2>
        <p className="mb-4">
            Hemos enviado un enlace de verificación a tu correo electrónico
        </p>
        <p>
            Por favor, revisa tu bandeja de entrada y sigue las instrucciones para
            verificar tu cuenta.
        </p>

    </div>


    </div>
  )
}
