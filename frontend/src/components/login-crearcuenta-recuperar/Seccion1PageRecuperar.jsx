import React, { useState } from 'react';
import '../../styles/login-crearcuenta-recuperar/form.css';

export const Seccion1PageRecuperar = ({ onEmailSubmitted }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        setMessage('Correo enviado exitosamente. Revisa tu bandeja de entrada.');
        onEmailSubmitted(email);
      } else {
        setMessage(data.error || 'Error al enviar el correo.');
      }
    } catch (error) {
      setMessage(`Error al conectar con el servidor: ${error.message}`);
    }
  };

  return (
    <section id="form-login" className="contenedor_todo">
      <div className="contenedor-form">
        <form className="formulario-login" onSubmit={handleSubmit}>
          <h2 className="text-center mb-4">Recuperar Contraseña</h2>
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
          </div>
          <button type="submit" className="btn-1 btn w-100 mt-3">Enviar Correo</button>
          {message && <p className="text-center mt-3">{message}</p>}
        </form>
      </div>
    </section>
  );
};
