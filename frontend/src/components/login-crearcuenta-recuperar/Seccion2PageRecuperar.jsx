import React, { useState } from 'react';
import '../../styles/login-crearcuenta-recuperar/form.css';

export const Seccion2PageRecuperar = ({ email, onTokenValidated }) => {
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://www.codemx.net/codemx/backend/login-crearcuenta/validar_token.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, token }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Token válido. Redirigiendo al siguiente paso...');
        onTokenValidated(token); // Avanza al siguiente paso
      } else {
        setMessage(data.error || 'Token inválido o expirado.');
      }
    } catch (error) {
      setMessage('Error al conectar con el servidor.');
    }
  };

  return (
    <section id="form-login" className="contenedor_todo">
      <div className="contenedor-form">
        <form className="formulario-login" onSubmit={handleSubmit}>
          <h2 className="text-center mb-4">Validar Token</h2>
          <div className="mb-3">
            <label htmlFor="token" className="form-label">
              <i className="fas fa-key"></i> Token
            </label>
            <input
              type="text"
              id="token"
              name="Token"
              className="form-control"
              placeholder="Ingresa el token enviado a tu correo"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-1 btn w-100 mt-3">Validar Token</button>
          {message && <p className="text-center mt-3">{message}</p>}
        </form>
      </div>
    </section>
  );
};
