import React from 'react'
import { Link } from 'react-router-dom';
import '../../styles/header-footer.css';
import { Seccion1PageLogin } from '../../components/login-crearcuenta-recuperar/Seccion1PageLogin'

export const PageLogin = () => {
  return (
    <>
        {/* Header */}
        <div className="contenedor-header container-fluid w-100">
            <header className="d-flex justify-content-center align-items-center">
                <div className="logoo" translate="no">
                    <Link to="/"> <h1>CODE<span className="txtspan">MX</span></h1> </Link> 
                </div>
            </header>
        </div>
        <div className="container text-center pt-5">
          <h2 className="text-center mb-4"><i className="fas fa-user-circle icono"></i> Iniciar Sesión</h2>
        </div>

        <Seccion1PageLogin />

    </>
  )
}
