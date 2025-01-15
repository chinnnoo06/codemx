import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, NavLink } from 'react-router-dom';
import { PageInicioCandidato } from '../pages/candidato/PageInicioCandidato';
import '../styles/header-footer.css';
import { PageRecomendacionesCandidato } from '../pages/candidato/PageRecomendacionesCandidato';
import { PageMiPerfilCandidato } from '../pages/candidato/PageMiPerfilCandidato';


export const RutasCandidato = () => {
    const [candidato, setCandidato] = useState(null);
    const [fotoPerfil, setFotoPerfil] = useState('');
    const [menuVisible, setMenuVisible] = useState(false);

    const actualizarCandidato = (nuevoCandidato) => {
    setCandidato(nuevoCandidato);

    // Añadir timestamp a las URLs para forzar la actualización
    const timestamp = new Date().getTime();
    const nuevaFoto = nuevoCandidato.fotografia ? `${nuevoCandidato.fotografia}?t=${timestamp}` : '';
    const nuevoCv = nuevoCandidato.cv ? `${nuevoCandidato.cv}?t=${timestamp}` : '';
    setFotoPerfil(nuevaFoto);

    // Actualizar el candidato con las URLs modificadas
    setCandidato({
        ...nuevoCandidato,
        fotografia: nuevaFoto,
        cv: nuevoCv,
        });
    };

    useEffect(() => {
        // Función para obtener datos del backend
        const fetchData = async () => {
        try {
            // Fetch para obtener datos del usuario candidato
            const candidatoResponse = await fetch('https://codemx.net/codemx/backend/candidato/obtener_datos_candidato.php', {
                method: 'GET',
            });
            if (!candidatoResponse.ok) {
                throw new Error('Error al obtener los datos del usuario');
            }
            const candidatoData = await candidatoResponse.json();
            console.log('Datos del candidato:', candidatoData); 

            if (!candidatoData.success) {
                console.error('Sesión no iniciada:', candidatoData.error);
                window.location.href = '/codemx/frontend/build/'; // Redirige si no hay sesión
                return;
            }

            // Actualizar estados
            setCandidato(candidatoData)
            setFotoPerfil(candidatoData.fotografia || '');
        } catch (error) {
            console.error('Error al obtener los datos:', error);
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
                    <div className="logo">
                        <Link to="/"> <h1>CODE<span className="txtspan">MX</span></h1> </Link> 
                    </div>
                    <nav className="nav d-none d-md-flex gap-4">
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
                    <div className="perfil d-none d-md-flex">
                        {fotoPerfil && (
                            <Link to="/usuario-candidato/miperfil-candidato">
                                <img src={fotoPerfil} alt="Perfil" className="perfil-img" />
                            </Link>
                        )}
                    </div>
                    {/* Menú responsive */}
                    <div className="nav-responsive d-md-none" onClick={toggleMenu}>
                        <i className="fa-solid fa-bars"></i>
                    </div>
                </header>
                {/* Menú desplegable para pantallas pequeñas */}
                {menuVisible && (
                    <div className="menu-responsive">
                        {fotoPerfil && (
                            <Link to="/usuario-candidato/miperfil-candidato" onClick={() => setMenuVisible(false)}>
                                <img src={fotoPerfil} alt="Perfil" className="perfil-img" />
                            </Link>
                        )}
                        <NavLink to="/usuario-candidato/inicio-candidato"  className={({ isActive }) => isActive ? "activado" : ""}  onClick={() => setMenuVisible(false)}>Inicio</NavLink>
                        <NavLink to="/usuario-candidato/recomendaciones-candidato" className={({ isActive }) => isActive ? "activado" : ""} onClick={() => setMenuVisible(false)}>Recomendaciones</NavLink>
                        <NavLink to="/usuario-candidato/vacantes-candidato" className={({ isActive }) => isActive ? "activado" : ""} onClick={() => setMenuVisible(false)}>Vacantes</NavLink>
                        <NavLink to="/usuario-candidato/chats-candidato" className={({ isActive }) => isActive ? "activado" : ""} onClick={() => setMenuVisible(false)}>Chats</NavLink>
                        <NavLink to="/usuario-candidato/notificaciones-candidato" className={({ isActive }) => isActive ? "activado" : ""} onClick={() => setMenuVisible(false)}>Notificaciones</NavLink>
                        <NavLink to="/usuario-candidato/informacion-candidato" className={({ isActive }) => isActive ? "activado" : ""} onClick={() => setMenuVisible(false)}>Información</NavLink>
                        <NavLink to="/usuario-candidato/busqueda-candidato" className={({ isActive }) => isActive ? "activado" : ""} onClick={() => setMenuVisible(false)}>Buscar</NavLink>
                    </div>
                )}
            </div>


            {/* Contenido Principal */}
            <section className="contenido-principal">
                <Routes>
                    <Route path="/" element={<PageInicioCandidato />} />
                    <Route path="/inicio-candidato" element={<PageInicioCandidato />} />
                    <Route path="/recomendaciones-candidato" element={<PageRecomendacionesCandidato />} />
                    <Route path="/miperfil-candidato" element={<PageMiPerfilCandidato candidato={candidato} actualizarCandidato={actualizarCandidato} />} />
                </Routes>
            </section>

            {/* Footer */}
            <footer className="footer text-white py-4">
                <div className="footer-container mx-auto">
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