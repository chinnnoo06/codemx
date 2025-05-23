import React, { useState } from 'react'; 
import '../../styles/login-crearcuenta-recuperar/form.css';
import { Link, useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';

export const Seccion1PageLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  const navigate = useNavigate();

  const visibilidadPassword = () => {
    setShowPassword(!showPassword);
  };

  const enviar = async (e) => {
      e.preventDefault(); 
      setIsLoading(true);

      try {
        const response = await fetch('https://www.codemx.net/codemx/backend/login-crearcuenta/iniciar_sesion.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({ 
            Correo_Electronico: email,
            Password: password,
          }),
        });

        const textResponse = await response.text(); // Obtén la respuesta como texto primero
        const result = JSON.parse(textResponse); // Ahora parseamos el JSON

        if (result.success) {
          if (result.redirect) {
            // Si el redireccionamiento es hacia /falta-verificar-rfc, se agrega el user_id
            if (result.redirect.includes('/falta-verificar-rfc')) {
              navigate(result.redirect, { state: { user_id: result.idEmpresa } });
            } else {
              navigate(result.redirect); // Redirige según el valor de redirect recibido del backend
            }
          } else {
            // Obtén la clave secreta del archivo .env
            const secretKey = process.env.REACT_APP_SECRET_KEY;

            // Cifra el session_id con la clave secreta
            const encryptedSessionId = CryptoJS.AES.encrypt(result.session_id, secretKey).toString();

            // Guarda el session_id cifrado en localStorage
            localStorage.setItem('session_id', encryptedSessionId);
            window.location.href = `/codemx/frontend/build/usuario-${result.tipo}/inicio-${result.tipo}`;
          }
        } else {
          setMensaje(result.message || result.error || 'Error desconocido. Intenta nuevamente.');
        }
      } catch (error) {
        // Mostrar el error específico si está disponible en el backend
        const errorMessage = error.message || 'Hubo un problema con el servidor. Intenta más tarde.';
        setMensaje(errorMessage);
      } finally {
        setIsLoading(false);
      }
  };
  
  return (
      <div className='contenedor-form container py5'>
        <form className='form' onSubmit={enviar}>
          {mensaje && <p className="text-danger text-center">{mensaje}</p>}
          <div className="mb-3">
            <label htmlFor="email" className="form-label"><i className="fas fa-envelope"></i> Correo Electrónico</label>
            <input type="email" id="email" name="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required/>
          </div>
          <div className="mb-3">
              <label htmlFor="password" className="form-label"><i className="fas fa-lock"></i> Contraseña</label>
              <input type={showPassword ? "text" : "password"} id="password" name="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required/>
              <span className="input-group-text" onClick={visibilidadPassword}>
                <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
              </span>
          </div>
          <div className='d-flex justify-content-center align-items-center'>
            <button type="submit" className="btn-tipouno btn  w-50 mt-3" disabled={isLoading}>
              {isLoading ? 'Cargando...' : 'Entrar'}
            </button>
          </div>
          <div className="text-center mt-4">
              <Link to="/recuperar-password" className="link-primary">¿Olvidaste tu contraseña?</Link>
          </div>
        </form>
        <div className="text-center mt-4">
            <h3>¿Aún no tienes una cuenta?</h3>
            <p>Regístrate para entrar a la página</p>
        </div>
        <div className="text-center mt-4">
          <Link to="/crear-cuenta"><button id="btn_registrarse" className="btn-tipodos btn w-50">Registrarse</button></Link>
        </div>
      </div>
  );
};