import React, { useState } from 'react';
import '../../styles/login-crearcuenta-recuperar/form.css';

export const Seccion1PageRecuperar = ({ onEmailSubmitted }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); 

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (isLoading) return; 
    setIsLoading(true);

    try {
      const response = await fetch('https://www.codemx.net/codemx/backend/login-crearcuenta/recuperar_password.php', {
        method: 'POST',
        body: email,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error desconocido.');
      }

      const data = await response.json();
      if (data.success) {
        onEmailSubmitted(email);
      } else {
        setMessage(data.error || 'Error al enviar el correo.');
      }
    } catch (error) {
      setMessage(`Error al conectar con el servidor: ${error.message}`);
    } finally {
      setIsLoading(false); 
    }
  };

  return (
      <div className="contenedor-form container py5">
        <form className="form" onSubmit={manejarEnvio}>
          <div className="mb-3">
            <label htmlFor="correoElectronico" className="form-label">
              <i className="fas fa-envelope"></i> Correo Electrónico
            </label>
            <input
              type="email"
              id="correoElectronico"
              name="Correo_Electronico"
              className="form-control"
              placeholder="Ingresa tu correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {message && <small className="text-danger">{message}</small>}
          </div>
          <div className='d-flex justify-content-center align-items-center'>
            <button type="submit" className="btn-tipouno btn" disabled={isLoading}>
              {isLoading ? 'Enviando...' :  'Enviar' }
            </button>
          </div>
        </form>
    </div>
  );
};
