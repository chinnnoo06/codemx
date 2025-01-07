import React, { useState, useEffect } from 'react';
import '../../styles/login-crearcuenta-recuperar/form.css';

export const SeccionVerificacionCorreo = ({ email, tiempoLimite = 300, reenviarCorreo }) => {
  const [tiempoRestante, setTiempoRestante] = useState(tiempoLimite); // Tiempo límite en segundos
  const [puedeReenviar, setPuedeReenviar] = useState(false);

  useEffect(() => {
    if (tiempoRestante > 0) {
      const timer = setInterval(() => {
        setTiempoRestante((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer); // Limpiar el temporizador al desmontar
    } else {
      setPuedeReenviar(true); // Permitir reenviar cuando el tiempo expira
    }
  }, [tiempoRestante]);

  const formatoTiempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos}:${segundosRestantes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="verificacion-correo text-center py-5">
      <h2 className="mb-3">¡Gracias por registrarte!</h2>
      <p className="mb-4">
        Hemos enviado un enlace de verificación a tu correo electrónico:
      </p>
      <p className="fw-semibold">{email}</p>
      <p>
        Por favor, revisa tu bandeja de entrada y sigue las instrucciones para
        verificar tu cuenta.
      </p>
      <p className="text-muted">
        Tiempo restante para verificar: <strong>{formatoTiempo(tiempoRestante)}</strong>
      </p>
      {puedeReenviar ? (
        <button
          className="btn-tipouno btn mt-4"
          onClick={reenviarCorreo}
        >
          Reenviar Enlace
        </button>
      ) : (
        <small className="text-muted">
          Puedes reenviar el enlace una vez que expire el tiempo.
        </small>
      )}
    </div>
  );
};
