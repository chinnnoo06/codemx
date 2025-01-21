import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/header-footer.css';
import '../../styles/login-crearcuenta-recuperar/form.css';
import { Seccion1PageRecuperar } from '../../components/login-crearcuenta-recuperar/Seccion1PageRecuperar';
import { Seccion2PageRecuperar } from '../../components/login-crearcuenta-recuperar/Seccion2PageRecuperar';
import { Seccion3PageRecuperar } from '../../components/login-crearcuenta-recuperar/Seccion3PageRecuperar';

export const PageRecuperar = () => {
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState(''); // Guarda el correo ingresado
  const [token, setToken] = useState(''); // Guarda el token validado

  const handleEmailSubmitted = (email) => {
    setEmail(email);
    setStep(2); // Avanza a la sección del token
  };

  const handleTokenValidated = (validatedToken) => {
    setToken(validatedToken);
    setStep(3); // Avanza a la sección para restablecer la contraseña
  };

  return (
    <>
      <div className="contenedor-header container-fluid w-100">
        <header className="d-flex justify-content-center align-items-center">
          <div className="logoo">
              <Link to="/"> <h1>CODE<span class="txtspan">MX</span></h1> </Link> 
          </div>
        </header>
      </div>

      {step === 1 && (
        <>
          <div className="container text-center pt-4 pb-4">
            <h2 className='titulo-form'>Ingresa tu correo electrónico para recibir un token de recuperación</h2>
          </div>
          <Seccion1PageRecuperar onEmailSubmitted={handleEmailSubmitted} />
        </>
      )}

      {step === 2 && (
        <>
          <div className="container text-center pt-4 pb-4">
            <h2 className='titulo-form'>Ingresa el token enviado a tu correo</h2>
          </div>
          <Seccion2PageRecuperar email={email} onTokenValidated={handleTokenValidated} />
        </>
      )}

      {step === 3 && (
        <>
          <div className="container text-center pt-4 pb-4">
            <h2 className='titulo-form'>Ingresa tu nueva contraseña</h2>
          </div>
          <Seccion3PageRecuperar email={email} token={token} />
        </>
      )}
    </>
  );
};
