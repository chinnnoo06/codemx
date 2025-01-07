import React from 'react'
import '../../styles/login-crearcuenta-recuperar/form.css';
import { Link } from 'react-router-dom';

export const Seccion2PageRecuperar = () => {
  return (
    <section id="form-login" className="contenedor_todo">
        <div className='contenedor-form'>
            <form className='formulario-login'>
                <h2 className="text-center mb-4">Restablecer Contraseña</h2>
                <div class="mb-3">
                    <label htmlFor="password" class="form-label"><i class="fas fa-lock"></i> Nueva Contraseña</label>
                    <input type="password" id="newPassword" name="NewPassword" class="form-control" placeholder="Ingresa tu contraseña nueva" required/>
                </div>
                <div class="mb-3">
                    <label htmlFor="password" class="form-label"><i class="fas fa-lock"></i> Confirmar Contraseña</label>
                    <input type="password" id="confirmPassword" name="ConfirmPassword" class="form-control" placeholder="Confirma tu contraseña" required/>
                </div>
                <button type="submit" className="btn-1 btn w-100 mt-3">Restablecer</button>
                <Link to="/iniciar-sesion"><button className="btn-2 btn w-100 mt-3">Cancelar</button></Link>
            </form>
        </div>
    </section>
  )
}
