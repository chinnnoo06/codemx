import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Link, NavLink } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { PageInicioEmpresa } from '../pages/empresa/PageInicioEmpresa';
import '../styles/header-footer.css';
import CryptoJS from "crypto-js";
import { PagePerfilCandidato } from '../pages/empresa/PagePerfilCandidato';
import { PagePerfilEmpresa } from '../pages/empresa/PagePerfilEmpresa';
import { PageVacantesEmpresa } from '../pages/empresa/PageVacantesEmpresa';
import LoadingSpinner from '../components/LoadingSpinner';
import { PageChatsEmpresa } from '../pages/empresa/PageChatsEmpresa';
import ListaChatFlotante from '../components/empresa/ListaChatFlotante';
import { PageNotificacionesEmpresa } from '../pages/empresa/PageNotificacionesEmpresa';
import { PageInformacion } from '../pages/info/PageInformacion';
import { PageBuscarEmpresa } from '../pages/empresa/PageBuscarEmpresa';

export const RutasEmpresa = () => {
    const [empresa, setEmpresa] = useState(null);
    const [menuVisible, setMenuVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true); 
    const [tieneNotificacionesNoLeidas, setTieneNotificacionesNoLeidas] = useState(false);
    const [tieneMensajesNoLeidos, setTieneMensajesNoLeidos] = useState(false);
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
                const response = await fetch("https://www.codemx.net/codemx/backend/empresa/obtener_datos_empresa.php", {
                    method: "POST",
                    body: JSON.stringify({ session_id: sessionId }), 
                });
    
                const result = await response.json();
    
                if (result.success) {
                    // Actualiza el estado con los datos recibidos
                    setEmpresa(result);
                    setIsLoading(false);
                } else if (result.error) {
                    alert("Necesitas iniciar sesión")
                    window.location.href = `/codemx/frontend/build/iniciar-sesion`;
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Error al obtener los datos de la empresa:", error);
                setIsLoading(false);
            }
        };
    
        fetchData();
    }, []);

    const verificarNotificacionesNoLeidas = useCallback(async () => {
        try {
            const response = await fetch('https://www.codemx.net/codemx/backend/empresa/obtener_notificaciones_empresa.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idEmpresa: empresa?.id }),
            });
    
            const data = await response.json();
            const hayNoLeidas = data.notificaciones?.some(n => n.Leida === '0');
            setTieneNotificacionesNoLeidas(hayNoLeidas);
        } catch (error) {
            console.error('Error verificando notificaciones:', error);
        }
    }, [empresa?.id]);

    const verificarMensajesNoLeidos = useCallback(async () => {
        try {
            const response = await fetch('https://www.codemx.net/codemx/backend/empresa/obtener_chats_empresa.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idEmpresa: empresa?.id }),
            });
    
            const data = await response.json();
    
            // Si el último mensaje lo mandó la empresa y no ha sido leído (Lectura = 0), lo consideramos no leído
            const hayNoLeidos = data.chats?.some(chat =>
                chat.Ultimo_Mensaje &&
                chat.Ultimo_Mensaje.Usuario === 'candidato' &&
                chat.Ultimo_Mensaje.Lectura === "0"
            );
    
            setTieneMensajesNoLeidos(hayNoLeidos);
        } catch (error) {
            console.error('Error verificando chats no leídos:', error);
        }
    }, [empresa?.id]);

    useEffect(() => {
        if (empresa?.id) {
            verificarNotificacionesNoLeidas();
            const intervalo = setInterval(verificarNotificacionesNoLeidas, 2000);
            return () => clearInterval(intervalo);
        }
    }, [verificarNotificacionesNoLeidas]);

    useEffect(() => {
        if (empresa?.id) {
            verificarMensajesNoLeidos();
            const intervalo = setInterval(verificarMensajesNoLeidos, 2000);
            return () => clearInterval(intervalo);
        }
    }, [verificarMensajesNoLeidos])

    const toggleMenu = () => {
        setMenuVisible(!menuVisible);
    };

    if (isLoading) {
        return <LoadingSpinner></LoadingSpinner> 
    }

    return (
        <>
            {/* Header */}
            <div className="contenedor-header container-fluid w-100">
                <header className="d-flex justify-content-between align-items-center">
                    <div className="logo">
                        <Link to="/usuario-empresa/inicio-empresa"> <h1>CODE<span className="txtspan">MX</span></h1> </Link> 
                    </div>
                    <nav className="nav d-none d-md-flex">
                        <NavLink to="/usuario-empresa/inicio-empresa" className={({isActive}) => isActive ? "activado d-flex gap-2 align-items-center" : "noactivado d-flex gap-2 align-items-center" }>
                            <i className="fa-solid fa-house"></i>
                            Inicio
                        </NavLink>
                        <NavLink to="/usuario-empresa/vacantes-empresa" className={({isActive}) => isActive ? "activado d-flex gap-2 align-items-center" : "noactivado d-flex gap-2 align-items-center" }>
                            <i className="fa-solid fa-file-pen"></i>
                            Vacantes
                        </NavLink>
                        <NavLink
                            to="/usuario-empresa/chats-empresa"
                            className={({isActive}) =>
                                isActive
                                ? "activado d-flex gap-2 align-items-center"
                                : "noactivado d-flex gap-2 align-items-center"
                            }
                        >
                            <span className="icono-notificaciones-wrapper position-relative">
                                <i className="fa-solid fa-comment"></i>
                                {tieneMensajesNoLeidos && (
                                <span className="punto-rojo-notificacion"></span>
                                )}
                            </span>
                            Chats
                        </NavLink>
                        <NavLink
                            to="/usuario-empresa/notificaciones-empresa"
                            className={({ isActive }) =>
                                isActive
                                ? "activado d-flex gap-2 align-items-center"
                                : "noactivado d-flex gap-2 align-items-center"
                            }
                        >
                            <span className="icono-notificaciones-wrapper position-relative">
                                <i className="fa-solid fa-bell"></i>
                                {tieneNotificacionesNoLeidas && (
                                <span className="punto-rojo-notificacion"></span>
                                )}
                            </span>
                            Notificaciones
                        </NavLink>
                        <NavLink to="/usuario-empresa/informacion-empresa" className={({isActive}) => isActive ? "activado d-flex gap-2 align-items-center" : "noactivado d-flex gap-2 align-items-center" }>
                            <i className="fa-solid fa-chart-simple"></i>
                            Información
                        </NavLink>
                        <NavLink to="/usuario-empresa/busqueda-empresa" className={({isActive}) => isActive ? "activado d-flex gap-2 align-items-center" : "noactivado d-flex gap-2 align-items-center" }>
                            <i className="fa-solid fa-magnifying-glass"></i>
                            Buscar
                        </NavLink>
                    </nav>
                    {/* Menú responsive */}
                    <div className="nav-responsive" onClick={toggleMenu}>
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
                        <NavLink to="/usuario-empresa/inicio-empresa" className={({isActive}) => isActive ? "activado d-flex gap-2 align-items-center" : "noactivado d-flex gap-2 align-items-center" }  onClick={() => setMenuVisible(false)}>Inicio</NavLink>
                        <NavLink to="/usuario-empresa/vacantes-empresa" className={({isActive}) => isActive ? "activado d-flex gap-2 align-items-center" : "noactivado d-flex gap-2 align-items-center" } onClick={() => setMenuVisible(false)}>Vacantes</NavLink>
                        <NavLink
                            to="/usuario-empresa/chats-empresa"
                            className={({isActive}) =>
                                isActive
                                ? "activado d-flex gap-2 align-items-center"
                                : "noactivado d-flex gap-2 align-items-center"
                            }
                        >
                            Chats
                             <span className="icono-notificaciones-wrapper position-relative">
                                {tieneMensajesNoLeidos && (
                                <span className="punto-rojo-notificacion"></span>
                                )}
                            </span>
                        </NavLink>
                        <NavLink
                            to="/usuario-empresa/notificaciones-empresa"
                            className={({ isActive }) =>
                                isActive
                                ? "activado d-flex gap-2 align-items-center"
                                : "noactivado d-flex gap-2 align-items-center"
                            }
                        >
                            Notificaciones
                            <span className="icono-notificaciones-wrapper position-relative">
                                {tieneNotificacionesNoLeidas && (
                                <span className="punto-rojo-notificacion"></span>
                                )}
                            </span>
                        </NavLink>
                        <NavLink to="/usuario-empresa/informacion-empresa" className={({isActive}) => isActive ? "activado d-flex gap-2 align-items-center" : "noactivado d-flex gap-2 align-items-center" } onClick={() => setMenuVisible(false)}>Información</NavLink>
                        <NavLink to="/usuario-empresa/busqueda-empresa" className={({isActive}) => isActive ? "activado d-flex gap-2 align-items-center" : "noactivado d-flex gap-2 align-items-center" } onClick={() => setMenuVisible(false)}>Buscar</NavLink>
                    </nav>
                </div>

                {/* Fondo oscuro cuando el menú está activo */}
                {menuVisible && <div className="overlay" onClick={toggleMenu}></div>}
            </div>

            {/* Contenido Principal */}
            <section className="contenido-principal">
                <Routes>
                    <Route path="/" element={<PageInicioEmpresa empresa={empresa}  />} />
                    <Route path="/inicio-empresa" element={<PageInicioEmpresa  empresa={empresa}  />} />
                    <Route path="/perfil-candidato/" element={<PagePerfilCandidato empresa={empresa}/>} />
                    <Route path="/perfil-empresa/" element={<PagePerfilEmpresa  empresaActiva={empresa.id}/>} />
                    <Route path="/vacantes-empresa/" element={<PageVacantesEmpresa  empresa={empresa}/>} />
                    <Route path="/chats-empresa/" element={<PageChatsEmpresa  empresa={empresa}/>} />
                    <Route path="/notificaciones-empresa/" element={<PageNotificacionesEmpresa  empresa={empresa}/>} />
                    <Route path="/informacion-empresa/" element={<PageInformacion />} />
                    <Route path="/busqueda-empresa/" element={<PageBuscarEmpresa empresa={empresa}/>} />
                </Routes>
            </section>

            {/* Footer */}
            <footer className="footer text-white py-4">
                <div className="container">
                    <div className="row text-center">
                        {/* Enlaces Rápidos */}
                        <div className="col-lg-2 col-md-6 mb-4 mx-auto">
                            <h4 className="text-uppercase mb-3">Enlaces</h4>
                            <ul className="list-unstyled">
                                <li>
                                    <NavLink to="/usuario-empresa/inicio-empresa" className="footer-link" >
                                        <i className="fa-solid fa-house"></i> &nbsp; Inicio
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/usuario-empresa/vacantes-empresa" className="footer-link" >
                                        <i className="fa-solid fa-file-pen"></i> &nbsp; Vacantes
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/usuario-empresa/chats-empresa" className="footer-link" >
                                        <i className="fa-solid fa-comment"></i> &nbsp; Chats
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/usuario-empresa/notificaciones-empresa" className="footer-link" >
                                        <i className="fa-solid fa-bell"></i> &nbsp; Notificaciones
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/usuario-empresa/informacion-empresa" className="footer-link" >
                                        <i className="fa-solid fa-chart-simple"></i> &nbsp; Información
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/usuario-empresa/busqueda-empresa" className="footer-link" >
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

            
            {location.pathname !== '/usuario-empresa/chats-empresa' && (
                <>
                    <ListaChatFlotante
                        empresa={empresa}
                    />
                </>
            )}

        </>
    );
};
