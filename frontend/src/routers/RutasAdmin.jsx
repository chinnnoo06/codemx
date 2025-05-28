import React, { useState, useEffect, useCallback} from 'react';
import { Routes, Route, Link, NavLink } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import '../styles/header-footer.css';
import CryptoJS from "crypto-js";
import { PageVerificacionAdmin } from '../pages/admin/PageVerificacionAdmin';
import LoadingSpinner from '../components/LoadingSpinner';
import { PageGestionUsuariosAdmin } from '../pages/admin/PageGestionUsuariosAdmin';
import { PagePerfilCandidato } from '../pages/admin/PagePerfilCandidato';
import { PagePerfilEmpresa } from '../pages/admin/PagePerfilEmpresa';
import { PageGestionPublicacionesAdmin } from '../pages/admin/PageGestionPublicacionesAdmin';
import { PageGestionVacantesAdmin } from '../pages/admin/PageGestionVacantesAdmin';
import { PageDenunciasAdmin } from '../pages/admin/PageDenunciasAdmin';

export const RutasAdmin = () => {
    const [isLoading, setIsLoading] = useState(true); 
    const [menuVisible, setMenuVisible] = useState(false); 
    const [tieneSolicitudes, setTieneSolicitudes] = useState(false);
    const location = useLocation();

    // Establecer el scroll en la parte superior cada vez que la ubicación cambie
    useEffect(() => {
        window.scrollTo(0, 0); 
    }, [location]);

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
                const response = await fetch("https://www.codemx.net/codemx/backend/admin/verificar_sesion.php", {
                    method: "POST",
                    body: JSON.stringify({ session_id: sessionId }), 
                });

                const result = await response.json();

                if (!result.success) {
                    alert("Necesitas iniciar sesión");
                    window.location.href = `/codemx/frontend/build/iniciar-sesion`;
                    setIsLoading(false);
                } 
            } catch (error) {
                console.error("Error al verificar la sesion del administrador:", error);
                setIsLoading(false);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);


    const toggleMenu = () => {
      setMenuVisible(!menuVisible);
    };


    const verificarSolicitudes = useCallback(async () => {
        try {
            const response = await fetch('https://www.codemx.net/codemx/backend/admin/obtener_solicitudes.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(),
            });
    
            const data = await response.json();
    
            // Si el último mensaje lo mandó la empresa y no ha sido leído (Lectura = 0), lo consideramos no leído
            const haySolicitudes = data.solicitudes?.some(solicitud =>
                solicitud.RFC_Verificado === "0" &&
                solicitud.RFC_Rechazado === "0"
            );
    
            setTieneSolicitudes(haySolicitudes);
        } catch (error) {
            console.error('Error:', error);
        }
    }, []);

    
    useEffect(() => {
        verificarSolicitudes();
        const intervalo = setInterval(verificarSolicitudes, 2000);
        return () => clearInterval(intervalo);
    }, [verificarSolicitudes]);


    if (isLoading) {
        return <LoadingSpinner></LoadingSpinner> 
    }

    return (
        <>
            {/* Header */}
            <div className="contenedor-header container-fluid w-100">
                <header className="d-flex justify-content-between align-items-center">
                    <div className="logo" translate="no">
                        <Link to="/usuario-administrador/inicio-administrador"> <h1>CODE<span className="txtspan">MX</span></h1> </Link> 
                    </div>
                    <nav className="nav d-md-flex">
                        <NavLink to="/usuario-administrador/gestionpublicaciones-administrador" className={({isActive}) => isActive ? "activado d-flex gap-2 align-items-center" : "noactivado d-flex gap-2 align-items-center" }>
                            <i className="fa-solid fa-image"></i>
                            Gestión de Post
                        </NavLink>
                        <NavLink to="/usuario-administrador/gestionvacantes-administrador" className={({isActive}) => isActive ? "activado d-flex gap-2 align-items-center" : "noactivado d-flex gap-2 align-items-center" }>
                            <i className="fa-solid fa-briefcase"></i>
                            Gestión de Vacantes
                        </NavLink>
                        <NavLink
                            to="/usuario-administrador/verificacion-administrador"
                            className={({isActive}) =>
                                isActive
                                ? "activado d-flex gap-2 align-items-center"
                                : "noactivado d-flex gap-2 align-items-center"
                            }
                        >
                            <span className="icono-notificaciones-wrapper position-relative">
                                <i className="fa-solid fa-user-check"></i>
                                {tieneSolicitudes && (
                                <span className="punto-rojo-notificacion"></span>
                                )}
                            </span>
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
                        <NavLink to="/usuario-administrador/gestionpublicaciones-administrador" className={({isActive}) => isActive ? "activado d-flex gap-2 align-items-center" : "noactivado d-flex gap-2 align-items-center" } onClick={toggleMenu}>Gestión de Post</NavLink>
                        <NavLink to="/usuario-administrador/gestionvacantes-administrador" className={({isActive}) => isActive ? "activado d-flex gap-2 align-items-center" : "noactivado d-flex gap-2 align-items-center" } onClick={toggleMenu}>Gestión de Vacantes</NavLink>
                         <NavLink
                            to="/usuario-administrador/verificacion-administrador"
                            className={({isActive}) =>
                                isActive
                                ? "activado d-flex gap-2 align-items-center"
                                : "noactivado d-flex gap-2 align-items-center"
                            }
                        >
                            Verificación 
                            <span className="icono-notificaciones-wrapper position-relative">

                                {tieneSolicitudes && (
                                <span className="punto-rojo-notificacion"></span>
                                )}
                            </span>
                        </NavLink>
                        <NavLink to="/usuario-administrador/gestiondenuncias-administrador" className={({isActive}) => isActive ? "activado d-flex gap-2 align-items-center" : "noactivado d-flex gap-2 align-items-center" } onClick={toggleMenu}>Gestión Denuncias</NavLink>
                        <NavLink to="/usuario-administrador/gestionusuarios-administrador" className={({isActive}) => isActive ? "activado d-flex gap-2 align-items-center" : "noactivado d-flex gap-2 align-items-center" } onClick={toggleMenu}>Gestión Usuarios</NavLink>
                    </nav>
                </div>

                {/* Fondo oscuro cuando el menú está activo */}
                {menuVisible && <div className="overlay" onClick={toggleMenu}></div>}
            </div>


            {/* Contenido Principal */}
            <section className="contenido-principal">
                <Routes>
                    <Route path="/" element={<PageGestionPublicacionesAdmin/>} />
                    <Route path="/inicio-administrador" element={<PageGestionPublicacionesAdmin/>} />
                    <Route path="/gestionpublicaciones-administrador" element={<PageGestionPublicacionesAdmin/>} />
                    <Route path="/gestionvacantes-administrador" element={<PageGestionVacantesAdmin/>} />
                    <Route path="/verificacion-administrador" element={<PageVerificacionAdmin/>} />
                    <Route path="/gestionusuarios-administrador" element={<PageGestionUsuariosAdmin/>} />
                     <Route path="/gestiondenuncias-administrador" element={<PageDenunciasAdmin/>} />
                    <Route path="/perfil-candidato" element={<PagePerfilCandidato/>} />
                    <Route path="/perfil-empresa" element={<PagePerfilEmpresa/>} />
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
                                    <NavLink to="/usuario-administrador/gestionpublicaciones-administrador" className="footer-link" >
                                         <i className="fa-solid fa-image"></i> &nbsp; Gestión de Post
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/usuario-administrador/gestionvacantes-administrador" className="footer-link" >
                                         <i className="fa-solid fa-briefcase"></i> &nbsp; Gestión de Vacantes
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