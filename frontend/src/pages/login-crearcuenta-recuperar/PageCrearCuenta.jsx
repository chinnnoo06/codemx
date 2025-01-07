import React, { useState } from 'react';
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
        <SeccionVerificacionCorreo email={emailUsuario}/>
      )}
    </>
  );
};
