import React, { useState } from 'react';
import '../../styles/login-crearcuenta-recuperar/form.css';

export const Seccion2PageRecuperar = ({ email, onTokenValidated }) => {
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); 

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (isLoading) return; 
    setIsLoading(true);

    try {
      const response = await fetch('https://www.codemx.net/codemx/backend/login-crearcuenta/validar_token.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, token }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Token válido. Redirigiendo al siguiente paso...');
        onTokenValidated(token);
      } else {
        setMessage(data.error || 'Token inválido o expirado.');
      }
    } catch (error) {
      setMessage('Error al conectar con el servidor.');
    } finally {
      setIsLoading(false); 
    }
  };

  return (

      <div className="contenedor-form container py5">
        <form className="form" onSubmit={manejarEnvio}>    
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
            {message && <small className="text-danger">{message}</small>}
          </div>
          <div className='d-flex justify-content-center align-items-center'>
            <button type="submit" className="btn-tipouno btn" disabled={isLoading}>
              {isLoading ? 'Validando...' :  'Validar Token' }
            </button>
          </div>
        </form>
      </div>
  );
};
