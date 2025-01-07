import React from 'react'
import '../../styles/login-crearcuenta-recuperar/form.css';
import { Link } from 'react-router-dom';

export const Seccion1PageRecuperar = () => {
  return (
    <section id="form-login" className="contenedor_todo">
        <div className='contenedor-form'>
            <form className='formulario-login'>
                <h2 className="text-center mb-4">Recuperar Contraseña</h2>
                <div className="mb-3">
                    <label htmlFor="correoElectronico" className="form-label"><i className="fas fa-envelope"></i> Correo Electrónico</label>
                    <input type="email" id="correoElectronico" name="Correo_Electronico" className="form-control" placeholder="Ingresa tu correo" required/>
                </div>
                <button type="submit" className="btn-1 btn w-100 mt-3">Enviar Correo</button>
                <Link to="/iniciar-sesion"><button className="btn-2 btn w-100 mt-3">Cancelar</button></Link>
            </form>
        </div>
    </section>
  )
}
