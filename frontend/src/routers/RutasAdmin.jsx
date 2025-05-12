import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, NavLink } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import '../styles/header-footer.css';
import CryptoJS from "crypto-js";

import { PageInicioAdmin } from '../pages/admin/PageInicioAdmin';
import { PageVerificacionAdmin } from '../pages/admin/PageVerificacionAdmin';

export const RutasAdmin = () => {

    const [menuVisible, setMenuVisible] = useState(false); 
    const location = useLocation();

    // Establecer el scroll en la parte superior cada vez que la ubicación cambie
    useEffect(() => {
        window.scrollTo(0, 0); 
    }, [location]);


    const toggleMenu = () => {
      setMenuVisible(!menuVisible);
    };


    return (
        <>
            {/* Header */}
            <div className="contenedor-header container-fluid w-100">
                <header className="d-flex justify-content-between align-items-center">
                    <div className="logo" translate="no">
                        <Link to="/usuario-administrador/inicio-administrador"> <h1>CODE<span className="txtspan">MX</span></h1> </Link> 
                    </div>
                    <nav className="nav d-md-flex">
                        <NavLink to="/usuario-administrador/inicio-administrador" className={({isActive}) => isActive ? "activado d-flex gap-2 align-items-center" : "noactivado d-flex gap-2 align-items-center" }>
                            <i className="fa-solid fa-house"></i>
                            Inicio
                        </NavLink>
                        <NavLink to="/usuario-administrador/verificacion-administrador" className={({isActive}) => isActive ? "activado d-flex gap-2  align-items-center" : "noactivado d-flex gap-2 align-items-center" }>
                            <i className="fa-solid fa-user-check"></i>
                            Verificación 
                        </NavLink>
                        <NavLink to="/usuario-administrador/gestiondenuncias-administrador" className={({isActive}) => isActive ? "activado d-flex gap-2 align-items-center" : "noactivado d-flex gap-2 align-items-center" }>
                            <i className="fa-solid fa-flag"></i>
                            Gestión de Denuncias
                        </NavLink>
                        <NavLink to="/usuario-administrador/gestionusuarios-administrador" className={({isActive}) => isActive ? "activado d-flex gap-2 align-items-center" : "noactivado d-flex  gap-2 align-items-center" }>
                            <i className="fa-solid fa-users"></i>
                            Gestión de Usuarios
                        </NavLink>
                    </nav>
       
                    {/* Menú responsive */}
                    <div className="nav-responsive " onClick={toggleMenu}>
                        <i className="fa-solid fa-bars"></i>
                    </div>
                </header>

                {/* Menú lateral */}
                <div className={`menu-lateral flex-column ${menuVisible ? "activo" : ""}`}>
                    <div className="menu-header d-flex justify-content-between align-items-center">
                        <button className="cerrar-menu" onClick={toggleMenu}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                    <nav className="menu-links d-flex flex-column">
                        <NavLink to="/usuario-administrador/inicio-administrador" onClick={toggleMenu}>Inicio</NavLink>
                        <NavLink to="/usuario-administrador/verificacion-administrador" onClick={toggleMenu}>Verificación</NavLink>
                        <NavLink to="/usuario-administrador/verificacion-administrador" onClick={toggleMenu}>Gestión Denuncias</NavLink>
                        <NavLink to="/usuario-administrador/gestionusuarios-administrador" onClick={toggleMenu}>Gestión Usuarios</NavLink>
                    </nav>
                </div>

                {/* Fondo oscuro cuando el menú está activo */}
                {menuVisible && <div className="overlay" onClick={toggleMenu}></div>}
            </div>


            {/* Contenido Principal */}
            <section className="contenido-principal">
                <Routes>
                    <Route path="/" element={<PageInicioAdmin />} />
                    <Route path="/inicio-administrador" element={<PageInicioAdmin/>} />
                    <Route path="/verificacion-administrador" element={<PageVerificacionAdmin/>} />

                </Routes> 
            </section>

            {/* Footer */}
            <footer className="footer text-white py-4">
                <div className="footer-container mx-auto">
                    <div className="row text-center">

                        {/* Enlaces Rápidos */}
                        <div className="col-lg-2 col-md-6 mb-4 mx-auto">
                            <h4 className="text-uppercase mb-3">Enlaces</h4>
                            <ul className="list-unstyled">
                                <li>
                                    <NavLink to="/usuario-administrador/inicio-administrador" className="footer-link" >
                                        <i className="fa-solid fa-house"></i> &nbsp; Inicio
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/usuario-administrador/verificacion-administrador" className="footer-link" >
                                        <i className="fa-solid fa-user-check"></i> &nbsp; Verificación
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/usuario-administrador/gestiondenuncias-administrador" className="footer-link" >
                                        <i className="fa-solid fa-flag"></i> &nbsp; Gestión de Denuncias
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/usuario-administrador/gestionusuarios-administrador" className="footer-link" >
                                        <i className="fa-solid fa-users"></i> &nbsp; Gestión de Usuarios
                                    </NavLink>
                                </li>
                            </ul>
                        </div>

                        {/* Contacto */}
                        <div className="col-lg-3 col-md-6 mb-4 mx-auto">
                            <h4 className="text-uppercase mb-3">Contacto</h4>
                            <ul className="list-unstyled">
                                <li>2025 - <span className="fw-bold">CODEMX</span></li>
                                <li>Teléfono: <a href="tel:+523318237277" className="footer-link">3318237277</a></li>
                                <li>Email: <a href="mailto:contacto@codemx.com" className="footer-link">support@codemx.net</a></li>
                            </ul>
                        </div>

                        {/* Sobre Nosotros */}
                        <div className="col-lg-4 col-md-6 mb-4 mx-auto">
                            <h4 className="text-uppercase mb-3">Sobre Nosotros</h4>
                            <p>
                                Somos una plataforma web que conecta a programadores con empresas a nivel nacional dentro de México. 
                                Nuestro objetivo es hacer los procesos de búsqueda de trabajo y contratación más sencillos, ayudando 
                                a los programadores y empresas a encontrar la combinación perfecta.
                            </p>
                        </div>

                        {/* Redes Sociales */}
                        <div className="col-lg-3 col-md-6 mb-4 mx-auto">
                            <h4 className="text-uppercase mb-3">Síguenos en redes</h4>
                            <div className="d-flex justify-content-center gap-3">
                                <a href="https://facebook.com" className="social-icon" target="_blank" rel="noopener noreferrer">
                                    <i className="fab fa-facebook-f"></i>
                                </a>
                                <a href="https://twitter.com" className="social-icon" target="_blank" rel="noopener noreferrer">
                                    <i className="fab fa-twitter"></i>
                                </a>
                                <a href="https://instagram.com" className="social-icon" target="_blank" rel="noopener noreferrer">
                                    <i className="fab fa-instagram"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="text-center mt-4">
                        <p className="mb-0">&copy; 2025 CODEMX. Todos los derechos reservados.</p>
                    </div>
                </div>
            </footer> 
        </>
    );
};