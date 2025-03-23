import React, { useState } from 'react';
import { Routes, Route, NavLink, Link } from 'react-router-dom';
import { PageBienvenida } from '../pages/bienvenida/PageBienvenida';
import '../styles/header-footer.css';
import '../styles/bienvenida/Bienvenida.css';

export const RutasBienvenida = () => {

    const [menuVisible, setMenuVisible] = useState(false);

    const toggleMenu = () => {
        setMenuVisible(!menuVisible);
    };

    return (
        <>
            {/* Header */}
            <div className="contenedor-header container-fluid w-100">
                <header className="d-flex justify-content-between align-items-center">
                    <div className="logoo" translate="no">
                        <Link to="/"> <h1>CODE<span className="txtspan">MX</span></h1> </Link> 
                    </div>
                    {/* Opciones de botones grandes */}
                    <div className="botones d-none d-md-flex gap-3">
                        <Link to="/iniciar-sesion"><button className="login">Iniciar Sesión</button></Link>
                        <Link to="/crear-cuenta"><button className="register">Crear Cuenta</button></Link>
                    </div>
                    {/* Menú responsive */}
                    <div className="nav-responsive d-md-none" onClick={toggleMenu}>
                        <i className="fa-solid fa-bars"></i>
                    </div>
                </header>
                
                {/* Menú lateral */}
                <div className={`menu-lateral flex-column ${menuVisible ? "activo" : ""}`}>
                    <div className="menu-header ">
                        <button className="cerrar-menu" onClick={toggleMenu}>
                            <i className="fa-solid fa-xmark"></i>
                        </button>
        
                    </div>
                    <nav className="menu-links d-flex flex-column">
                        <Link to="/iniciar-sesion" onClick={() => setMenuVisible(false)}>Iniciar Sesión</Link>
                        <Link to="/crear-cuenta" onClick={() => setMenuVisible(false)}>Crear Cuenta</Link>
                    </nav>
                </div>

                {/* Fondo oscuro cuando el menú está activo */}
                {menuVisible && <div className="overlay" onClick={toggleMenu}></div>}
            </div>

            {/* Contenido Principal */}
            <section className="contenido-principal">
                <Routes>
                    <Route path="/" element={<PageBienvenida />} />
                    <Route path="/bienvenida" element={<PageBienvenida />} />
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
                                    <NavLink to="/iniciar-sesion" className="footer-link">
                                        <i className="fa-solid fa-right-to-bracket"></i> &nbsp; Iniciar Sesión
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/crear-cuenta" className="footer-link">
                                        <i className="fa-solid fa-plus"></i> &nbsp; Crear Cuenta
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
