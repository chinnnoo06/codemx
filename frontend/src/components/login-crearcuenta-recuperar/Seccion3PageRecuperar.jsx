import React, { useState } from 'react';
import '../../styles/login-crearcuenta-recuperar/form.css';

export const Seccion3PageRecuperar = ({ email, token }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      setMessage('Las contraseñas no coinciden. Por favor, inténtalo de nuevo.');
      return;
    }

    try {
        console.log(email, token, newPassword);
      // Enviar la nueva contraseña al backend
      const response = await fetch('https://www.codemx.net/codemx/backend/login-crearcuenta/restablecer_password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, token, newPassword }),
      });
      
      const data = await response.json();
      console.log("Email:", email);
        console.log("Token:", token);
        console.log("New Password:", newPassword);

      if (data.success) {
        setMessage('Contraseña actualizada exitosamente. Ahora puedes iniciar sesión.');
      } else {
        setMessage(data.error || 'Hubo un problema al actualizar la contraseña.');
      }
    } catch (error) {
      setMessage('Error al conectar con el servidor.');
    }
  };

  return (
    <section id="form-login" className="contenedor_todo">
      <div className="contenedor-form">
        <form className="formulario-login" onSubmit={handleSubmit}>
          <h2 className="text-center mb-4">Restablecer Contraseña</h2>
          <div className="mb-3">
            <label htmlFor="newPassword" className="form-label">
              <i className="fas fa-lock"></i> Nueva Contraseña
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              className="form-control"
              placeholder="Ingresa tu nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="confirmPassword" className="form-label">
              <i className="fas fa-lock"></i> Confirmar Contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-control"
              placeholder="Confirma tu nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-1 btn w-100 mt-3">Restablecer Contraseña</button>
          {message && <p className="text-center mt-3">{message}</p>}
        </form>
      </div>
    </section>
  );
};
