import React from 'react'
import { Link } from 'react-router-dom';
import '../styles/login-crearcuenta-recuperar/form.css';

export const PageFaltaVerificarRFC = () => {
  return (
    <div>

        {/* Header */}
        <div className="contenedor-header container-fluid w-100">
            <header className="d-flex justify-content-center align-items-center">
            <div className="logo">
                <Link to="/"> <h1>CODE<span class="txtspan">MX</span></h1> </Link> 
            </div>
            </header>
        </div>

        <div className="verificacion-correo text-center py-5">
            <h2 className="texto-color mb-3">¡Espera! Tu cuenta de empresa esta en proceso de verificación</h2>
            <p className="texto-color mb-4">
                En este momento nuestro equipo esta verificando la validez del RFC proporcionado durante el proceso de registro.
            </p>
            <p className="texto-color">
                Espera porfavor, cuando termine el proceso te llegará un correo electronico informandote, gracias por tu comprencion :)
            </p>
        </div>


</div>
  )
}
