import React from 'react'
import { Link } from 'react-router-dom';
import '../../styles/header-footer.css';
import logo from '../../resources/logo.png';
import { Seccion1PageLogin } from '../../components/login-crearcuenta-recuperar/Seccion1PageLogin'

export const PageLogin = () => {
  return (
    <>
        {/* Header */}
        <div className="contenedor-header container-fluid w-100">
            <header className="d-flex justify-content-center align-items-center">
                <div className="logo">
                  <Link to="/"><img src={logo} alt="Logo" /></Link>
                </div>
            </header>
        </div>
        <div className="container text-center pt-4 pb-4">
          <h2 >Rodeate de oportunidades laborales para encontrar tu trabajo soñado</h2>
        </div>

        <Seccion1PageLogin />

    </>
  )
}
