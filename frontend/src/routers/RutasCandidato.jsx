import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, NavLink } from 'react-router-dom';
import { PageInicioCandidato } from '../pages/candidato/PageInicioCandidato';
import '../styles/header-footer.css';
import logo from '../resources/logo.png';

export const RutasCandidato = () => {
     const [candidato, setCandidato] = useState([]);
     const [fotoPerfil, setFotoPerfil] = useState('');

    useEffect(() => {
        // Función para obtener datos del backend
        const fetchData = async () => {
        try {
            // Fetch para obtener datos del usuario candidato
            const candidatoResponse = await fetch('https://www.codemx.net/codemx/backend/candidato/obtener_datos_candidato.php');
            if (!candidatoResponse.ok) {
            throw new Error('Error al obtener los datos del usuario');
            }
            const candidatoData = await candidatoResponse.json();

            // Actualizar estados
            setCandidato(candidatoData);
            setFotoPerfil(candidatoData.fotografia || '');
        } catch (error) {
            console.error('Error al obtener los datos:', error);
        }
        };

        fetchData();
    }, []);


    return (
        <>
            {/* Header */}
            <div className="contenedor-header container-fluid w-100">
                <header className="d-flex justify-content-between align-items-center">
                    <div className="logo">
                        <Link to="/"><img src={logo} alt="Logo" /></Link>
                    </div>
                    <nav className="nav d-none d-md-flex gap-4">
                        <NavLink to="/inicio-candidato" className={({isActive}) => isActive ? "activado d-flex flex-column align-items-center" : "d-flex flex-column align-items-center" }>
                            <i class="fa-solid fa-house"></i>
                            <span>Inicio</span>
                        </NavLink>
                        <NavLink to="/recomendaciones-candidato" className={({isActive}) => isActive ? "activado d-flex flex-column align-items-center" : "d-flex flex-column align-items-center" }>
                            <i class="fa-solid fa-file-pen"></i>
                            Recomendaciones
                        </NavLink>
                        <NavLink to="/vacantes-candidato" className={({isActive}) => isActive ? "activado d-flex flex-column align-items-center" : "d-flex flex-column align-items-center" }>
                            <i class="fa-solid fa-briefcase"></i>
                            Vacantes
                        </NavLink>
                        <NavLink to="/chats-candidato" className={({isActive}) => isActive ? "activado d-flex flex-column align-items-center" : "d-flex flex-column align-items-center" }>
                            <i class="fa-solid fa-comment"></i>
                            Chats
                        </NavLink>
                        <NavLink to="/notificaciones-candidato" className={({isActive}) => isActive ? "activado d-flex flex-column align-items-center" : "d-flex flex-column align-items-center" }>
                            <i class="fa-solid fa-bell"></i>
                            Notificaciones
                        </NavLink>
                        <NavLink to="/informacion-candidatos" className={({isActive}) => isActive ? "activado d-flex flex-column align-items-center" : "d-flex flex-column align-items-center" }>
                            <i class="fa-solid fa-chart-simple"></i>
                            Información
                        </NavLink>
                        <NavLink to="/busqueda-candidatos" className={({isActive}) => isActive ? "activado d-flex flex-column align-items-center" : "d-flex flex-column align-items-center" }>
                            <i class="fa-solid fa-magnifying-glass"></i>
                            Buscar
                        </NavLink>
                    </nav>
                    {/* Opciones de botones grandes */}
                    <div className="perfil d-none d-md-flex gap-3">
                        <Link to="/informacion-candidatos">
                                <img src={fotoPerfil} alt="Perfil" className="perfil rounded-circle" />
                        </Link>
                    </div>

                </header>

            </div>

            {/* Contenido Principal */}
            <section className="contenido-principal">
                <Routes>
                    <Route path="/" element={<PageInicioCandidato />} />
                    <Route path="/inicio-candidato" element={<PageInicioCandidato />} />
                </Routes>
            </section>

            {/* Footer */}
            <footer className="footer text-white py-4">
                <div className="container">
                    <div className="row text-center">
                        {/* Sobre Nosotros */}
                        <div className="col-lg-4 col-md-6 mb-4 mx-auto">
                            <h4 className="text-uppercase mb-3">Sobre Nosotros</h4>
                            <p>
                                Somos una plataforma web que conecta a programadores con empresas a nivel nacional dentro de México. 
                                Nuestro objetivo es hacer los procesos de búsqueda de trabajo y contratación más sencillos, ayudando 
                                a los programadores y empresas a encontrar la combinación perfecta.
                            </p>
                        </div>

                        {/* Enlaces Rápidos */}
                        <div className="col-lg-2 col-md-6 mb-4 mx-auto">
                            <h4 className="text-uppercase mb-3">Enlaces</h4>
                            <ul className="list-unstyled">
                                <li>
                                    <NavLink to="/iniciar-sesion" className="footer-link">
                                        Iniciar Sesión
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/crear-cuenta" className="footer-link">
                                        Crear Cuenta
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
                                <li>Email: <a href="mailto:contacto@codemx.com" className="footer-link">contacto@codemx.com</a></li>
                            </ul>
                        </div>

                        {/* Redes Sociales */}
                        <div className="col-lg-3 col-md-6 mb-4 mx-auto">
                            <h4 className="text-uppercase mb-3">Síguenos</h4>
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
                                <a href="https://linkedin.com" className="social-icon" target="_blank" rel="noopener noreferrer">
                                    <i className="fab fa-linkedin-in"></i>
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
