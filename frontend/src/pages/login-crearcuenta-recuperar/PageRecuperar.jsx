import React from 'react';
import { useParams } from 'react-router-dom';
import '../../styles/header-footer.css';
import logo from '../../resources/logo.png';
import { Seccion1PageRecuperar } from '../../components/login-crearcuenta-recuperar/Seccion1PageRecuperar';
import { Seccion2PageRecuperar } from '../../components/login-crearcuenta-recuperar/Seccion2PageRecuperar';

export const PageRecuperar = () => {
  const { token } = useParams(); // Leer el parámetro de la URL

  return (
    <>
      {/* Header */}
      <div className="contenedor-header container-fluid w-100">
        <header className="d-flex justify-content-center align-items-center">
          <div className="logo">
            <img src={logo} alt="Logo" />
          </div>
        </header>
      </div>

      {/* Mostrar contenido basado en el token */}
      {!token ? (
        <>
          <div className="container text-center pt-4 pb-4">
            <h2>Ingresa el correo electrónico de tu cuenta para que puedas recibir un enlace para restablecer la contraseña</h2>
          </div>
          <Seccion1PageRecuperar />
        </>
      ) : (
        <>
          <div className="container text-center pt-4 pb-4">
            <h2>Ingresa una contraseña y confirmarla, <span className='fw-semibold'>recuerdala, será la nueva contraseña de tu cuenta</span></h2>
          </div>
          <Seccion2PageRecuperar />
        </>
      )}
    </>
  );
};
