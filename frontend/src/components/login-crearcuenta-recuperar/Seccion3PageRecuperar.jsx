import React, { useState } from 'react';
import '../../styles/login-crearcuenta-recuperar/form.css';

export const Seccion3PageRecuperar = ({ email, token }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const visibilidadPassword = () => {
    setShowPassword(!showPassword);
  };

  const visibilidadConfirmarPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validarPasswords = () => {
    const newErrors = {};
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      newErrors.newPassword =
        'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas y minúsculas.';
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden.';
    }
    setErrors(newErrors);

    // Si no hay errores, retorna true
    return Object.keys(newErrors).length === 0;
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    // Validar contraseñas antes de enviar
    if (!validarPasswords()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        'https://www.codemx.net/codemx/backend/login-crearcuenta/restablecer_password.php',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ email, token, newPassword }),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert('Contraseña actualizada exitosamente. Ahora puedes iniciar sesión.');
        window.location.href = `/codemx/frontend/build/iniciar-sesion`;
      } else {
        setErrors({ global: data.error || 'Hubo un problema al actualizar la contraseña.' });
      }
    } catch (error) {
      setErrors({ global: 'Error al conectar con el servidor.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="contenedor-form container py5">
      <form className="form" onSubmit={manejarEnvio}>
        <div className="mb-3">
          <label htmlFor="newPassword" className="form-label">
            <i className="fas fa-lock"></i> Nueva Contraseña
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            id="newPassword"
            name="newPassword"
            className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
            placeholder="Ingresa tu nueva contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <span className="input-group-text" onClick={visibilidadPassword}>
            <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
          </span>
          {errors.newPassword && <small className="text-danger">{errors.newPassword}</small>}
        </div>
        <div className="mb-3">
          <label htmlFor="confirmPassword" className="form-label">
            <i className="fas fa-lock"></i> Confirmar Contraseña
          </label>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
            placeholder="Confirma tu nueva contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <span className="input-group-text" onClick={visibilidadConfirmarPassword}>
            <i className={showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
          </span>
          {errors.confirmPassword && <small className="text-danger">{errors.confirmPassword}</small>}
        </div>
        {errors.global && <p className="text-danger text-center">{errors.global}</p>}
        <div className="d-flex justify-content-center align-items-center">
          <button type="submit" className="btn-tipouno btn" disabled={isLoading}>
            {isLoading ? 'Restableciendo...' : 'Restablecer Contraseña'}
          </button>
        </div>
      </form>
    </div>
  );
};
