import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/login-crearcuenta-recuperar/form.css';
import logo from '../../resources/logo.png';
import { SeccionFormCandidato } from '../../components/login-crearcuenta-recuperar/SeccionFormCandidato';
import { SeccionFormEmpresa } from '../../components/login-crearcuenta-recuperar/SeccionFormEmpresa';
import { SeccionVerificacionCorreo } from '../../components/login-crearcuenta-recuperar/SeccionVerificarCorreo';

export const PageCrearCuenta = () => {
  const [tipoCuenta, setTipoCuenta] = useState(null);
  const [estadoRegistro, setEstadoRegistro] = useState('seleccion'); // 'seleccion', 'formulario', 'verificacion'
  const [emailUsuario, setEmailUsuario] = useState(''); // Guardar el correo del usuario

  const manejarRegistroCompleto = (email) => {
    setEmailUsuario(email);
    setEstadoRegistro('verificacion');
  };

  // Función para reenviar el correo de verificación
  const reenviarCorreo = async () => {
    try {
      const response = await fetch(
        'https://www.codemx.net/codemx/backend/login-crearcuenta/ReenviarCorreo.php',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailUsuario }), // Pasar el correo del usuario
        }
      );

      const result = await response.json();
      if (result.success) {
        alert('El enlace de verificación ha sido reenviado a tu correo.');
      } else {
        alert(result.error || 'Hubo un problema al reenviar el enlace.');
      }
    } catch (error) {
      console.error('Error al reenviar el correo:', error);
      alert('Hubo un error al intentar reenviar el correo.');
    }
  };


  return (
    <>
      {/* Header */}
      <div className="contenedor-header container-fluid w-100">
        <header className="d-flex justify-content-center align-items-center">
          <div className="logo">
            <Link to="/"><img src={logo} alt="Logo" /></Link>
          </div>
        </header>
      </div>

      {/* Render Condicional */}
      {estadoRegistro === 'seleccion' ? (
        <div className="text-center pt-5">
          <h2>Selecciona el tipo de cuenta</h2>
          <button
            className="btn-tipouno btn m-2"
            onClick={() => {
              setTipoCuenta('candidato');
              setEstadoRegistro('formulario');
            }}
          >
            Crear Cuenta como Candidato
          </button>
          <button
            className="btn-tipouno btn m-2"
            onClick={() => {
              setTipoCuenta('empresa');
              setEstadoRegistro('formulario');
            }}
          >
            Crear Cuenta como Empresa
          </button>
        </div>
      ) : estadoRegistro === 'formulario' ? (
        tipoCuenta === 'candidato' ? (
          <SeccionFormCandidato onRegistroCompleto={manejarRegistroCompleto} />
        ) : (
          <SeccionFormEmpresa onRegistroCompleto={manejarRegistroCompleto} />
        )
      ) : (
        <SeccionVerificacionCorreo email={emailUsuario}  reenviarCorreo={reenviarCorreo}/>
      )}
    </>
  );
};
