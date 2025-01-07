import React from 'react'
import '../../styles/login-crearcuenta-recuperar/form.css';
import { Link } from 'react-router-dom';

export const Seccion1PageLogin = () => {

  return (
    <section id="form-login" className="contenedor_todo">
      <div className='contenedor-form'>
        <form className='formulario-login'>
          <h2 className="text-center mb-4"><i className="fas fa-user-circle"></i> Iniciar Sesión</h2>
          <div className="mb-3">
            <label htmlFor="correoElectronico" className="form-label"><i className="fas fa-envelope"></i> Correo Electrónico</label>
            <input type="email" id="correoElectronico" name="Correo_Electronico" className="form-control" placeholder="Ingresa tu correo" required/>
          </div>
          <div className="mb-3">
              <label htmlFor="password" className="form-label"><i className="fas fa-lock"></i> Contraseña</label>
              <input type="password" id="password" name="Password" className="form-control" placeholder="Ingresa tu contraseña" required/>
          </div>
          <button type="submit" className="btn-1 btn w-100 mt-3">Entrar</button>
          <div className="text-center mt-4">
              <Link to="/recuperar-password" className="link-primary">¿Olvidaste tu contraseña?</Link>
          </div>
        </form>
        <div className="text-center mt-4">
            <h3>¿Aún no tienes una cuenta?</h3>
            <p>Regístrate para entrar a la página</p>
            <Link to="/crear-cuenta"><button id="btn_registrarse" className="btn-2 btn w-100">Registrarse</button></Link>
        </div>
      </div>
    </section>
  )
}
