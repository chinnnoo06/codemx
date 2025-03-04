import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, NavLink } from 'react-router-dom';
import { PageInicioCandidato } from '../pages/candidato/PageInicioCandidato';
import '../styles/header-footer.css';
import { PageRecomendacionesCandidato } from '../pages/candidato/PageRecomendacionesCandidato';
import { PageMiPerfilCandidato } from '../pages/candidato/PageMiPerfilCandidato';
import CryptoJS from "crypto-js";
import { PagePerfilCandidato } from '../pages/candidato/PagePerfilCandidato';
import { PagePerfilEmpresa } from '../pages/candidato/PagePerfilEmpresa';


export const RutasCandidato = () => {
    const [candidato, setCandidato] = useState(null);
    const [fotoPerfil, setFotoPerfil] = useState('');
    const [menuVisible, setMenuVisible] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const secretKey = process.env.REACT_APP_SECRET_KEY; // Clave secreta definida en tu archivo .env
            const encryptedSessionId = localStorage.getItem("session_id"); // Obtén el session_id cifrado
    
            if (!encryptedSessionId) {
                console.error("No se encontró el session_id en el localStorage.");
                return;
            }
    
            // Desencripta el session_id
            const sessionId = CryptoJS.AES.decrypt(encryptedSessionId, secretKey).toString(CryptoJS.enc.Utf8);
    
            try {
                // Realiza la solicitud al backend enviando el session_id desencriptado
                const response = await fetch("https://www.codemx.net/codemx/backend/candidato/obtener_datos_candidato.php", {
                    method: "POST",
                    body: JSON.stringify({ session_id: sessionId }), 
                });
    
                const result = await response.json();
    
                if (result.success) {
                    // Actualiza el estado con los datos recibidos
                    setCandidato(result);
                    setFotoPerfil(result.fotografia || "");
                } else if (result.error) {
                    alert("Necesitas iniciar sesión")
                    window.location.href = `/codemx/frontend/build/iniciar-sesion`;
                }
            } catch (error) {
                console.error("Error al obtener los datos del candidato:", error);
            }
        };
    
        fetchData();
    }, []);
    

    const toggleMenu = () => {
        setMenuVisible(!menuVisible);
    };


    return (
        <>
            {/* Header */}
            <div className="contenedor-header container-fluid w-100">
                <header className="d-flex justify-content-between align-items-center">
                    <div className="logo" translate="no">
                        <Link to="/usuario-candidato/inicio-candidato"> <h1>CODE<span className="txtspan">MX</span></h1> </Link> 
                    </div>
                    <nav className="nav d-md-flex gap-5">
                        <NavLink to="/usuario-candidato/inicio-candidato" className={({isActive}) => isActive ? "activado d-flex flex-column align-items-center" : "noactivado d-flex flex-column align-items-center" }>
                            <i className="fa-solid fa-house"></i>
                            Inicio
                        </NavLink>
                        <NavLink to="/usuario-candidato/recomendaciones-candidato" className={({isActive}) => isActive ? "activado d-flex flex-column align-items-center" : "noactivado d-flex flex-column align-items-center" }>
                            <i className="fa-solid fa-file-pen"></i>
                            Recomendaciones
                        </NavLink>
                        <NavLink to="/usuario-candidato/vacantes-candidato" className={({isActive}) => isActive ? "activado d-flex flex-column align-items-center" : "noactivado d-flex flex-column align-items-center" }>
                            <i className="fa-solid fa-briefcase"></i>
                            Vacantes
                        </NavLink>
                        <NavLink to="/usuario-candidato/chats-candidato" className={({isActive}) => isActive ? "activado d-flex flex-column align-items-center" : "noactivado d-flex flex-column align-items-center" }>
                            <i className="fa-solid fa-comment"></i>
                            Chats
                        </NavLink>
                        <NavLink to="/usuario-candidato/notificaciones-candidato" className={({isActive}) => isActive ? "activado d-flex flex-column align-items-center" : "noactivado d-flex flex-column align-items-center" }>
                            <i className="fa-solid fa-bell"></i>
                            Notificaciones 
                        </NavLink>
                        <NavLink to="/usuario-candidato/informacion-candidato" className={({isActive}) => isActive ? "activado d-flex flex-column align-items-center" : "noactivado d-flex flex-column align-items-center" }>
                            <i className="fa-solid fa-chart-simple"></i>
                            Información
                        </NavLink>
                        <NavLink to="/usuario-candidato/busqueda-candidato" className={({isActive}) => isActive ? "activado d-flex flex-column align-items-center" : "noactivado d-flex flex-column align-items-center" }>
                            <i className="fa-solid fa-magnifying-glass"></i>
                            Buscar
                        </NavLink>
                    </nav>
                    {/* perfil*/}
                    <div className="perfil d-md-flex">
                        {fotoPerfil && (
                            <Link to="/usuario-candidato/miperfil-candidato">
                                <img src={`${fotoPerfil}?t=${new Date().getTime()}`} alt="Perfil" className="perfil-img" />
                            </Link>
                        )}
                    </div>
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
                        {fotoPerfil && (
                            <Link to="/usuario-candidato/miperfil-candidato" onClick={() => setMenuVisible(false)}>
                                <img src={`${fotoPerfil}?t=${new Date().getTime()}`} alt="Perfil" className="perfil-img" />
                            </Link>
                        )}
                    </div>
                    <nav className="menu-links d-flex flex-column">
                        <NavLink to="/usuario-candidato/inicio-candidato" onClick={toggleMenu}>Inicio</NavLink>
                        <NavLink to="/usuario-candidato/recomendaciones-candidato" onClick={toggleMenu}>Recomendaciones</NavLink>
                        <NavLink to="/usuario-candidato/vacantes-candidato" onClick={toggleMenu}>Vacantes</NavLink>
                        <NavLink to="/usuario-candidato/chats-candidato" onClick={toggleMenu}>Chats</NavLink>
                        <NavLink to="/usuario-candidato/notificaciones-candidato" onClick={toggleMenu}>Notificaciones</NavLink>
                        <NavLink to="/usuario-candidato/informacion-candidato" onClick={toggleMenu}>Información</NavLink>
                        <NavLink to="/usuario-candidato/busqueda-candidato" onClick={toggleMenu}>Buscar</NavLink>
                    </nav>
                </div>

                {/* Fondo oscuro cuando el menú está activo */}
                {menuVisible && <div className="overlay" onClick={toggleMenu}></div>}
            </div>


            {/* Contenido Principal */}
            <section className="contenido-principal">
                <Routes>
                    <Route path="/" element={<PageInicioCandidato />} />
                    <Route path="/inicio-candidato" element={<PageInicioCandidato />} />
                    <Route path="/recomendaciones-candidato" element={<PageRecomendacionesCandidato />} />
                    <Route path="/miperfil-candidato" element={<PageMiPerfilCandidato candidato={candidato} />} />
                    <Route path="/perfil-candidato/" element={<PagePerfilCandidato  candidatoActivo={candidato}/>} />
                    <Route path="/perfil-empresa/" element={<PagePerfilEmpresa  candidato={candidato}/>} />
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
                                    <NavLink to="/usuario-candidato/inicio-candidato" className="footer-link" >
                                        <i className="fa-solid fa-house"></i> &nbsp; Inicio
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/usuario-candidato/recomendaciones-candidato" className="footer-link" >
                                        <i className="fa-solid fa-file-pen"></i> &nbsp; Recomendaciones
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/usuario-candidato/vacantes-candidato" className="footer-link" >
                                        <i className="fa-solid fa-file-pen"></i> &nbsp; Vacantes
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/usuario-candidato/chats-candidato" className="footer-link" >
                                        <i className="fa-solid fa-comment"></i> &nbsp; Chats
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/usuario-candidato/notificaciones-candidato" className="footer-link" >
                                        <i className="fa-solid fa-bell"></i> &nbsp; Notificaciones
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/usuario-candidato/informacion-" className="footer-link" >
                                        <i className="fa-solid fa-chart-simple"></i> &nbsp; Información
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/usuario-candidato/busqueda-candidato" className="footer-link" >
                                        <i className="fa-solid fa-magnifying-glass"></i> &nbsp; Buscar
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