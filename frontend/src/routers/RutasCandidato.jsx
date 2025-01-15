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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                setLoading(true);

                // Fetch para obtener datos del usuario candidato con cookies
                const candidatoResponse = await fetch('https://www.codemx.net/codemx/backend/candidato/obtener_datos_candidato.php', {
                    method: 'POST',
                    credentials: 'include', // Asegurar que las cookies de sesión se envían
                });

                if (!candidatoResponse.ok) {
                    if (candidatoResponse.status === 401) {
                        // Redirigir al login si no hay sesión
                        window.location.href = '/iniciar-sesion';
                    } else {
                        throw new Error('Error al obtener los datos del usuario');
                    }
                }

                const candidatoData = await candidatoResponse.json();

                if (candidatoData.success) {
                    setCandidato(candidatoData);
                    setFotoPerfil(candidatoData.fotografia || '');
                } else {
                    setError(candidatoData.error || 'No se pudo cargar la información del usuario');
                }
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const toggleMenu = () => {
        setMenuVisible(!menuVisible);
    };

    if (loading) {
        return <p>Cargando datos...</p>;
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <>
            {/* Header */}
            <div className="contenedor-header container-fluid w-100">
                <header className="d-flex justify-content-between align-items-center">
                    <div className="logo">
                        <Link to="/"> <h1>CODE<span className="txtspan">MX</span></h1> </Link>
                    </div>
                    <nav className="nav d-none d-md-flex gap-4">
                        <NavLink to="/usuario-candidato/inicio-candidato" className={({ isActive }) => isActive ? "activado d-flex flex-column align-items-center" : "noactivado d-flex flex-column align-items-center"}>
                            <i className="fa-solid fa-house"></i>
                            Inicio
                        </NavLink>
                        <NavLink to="/usuario-candidato/recomendaciones-candidato" className={({ isActive }) => isActive ? "activado d-flex flex-column align-items-center" : "noactivado d-flex flex-column align-items-center"}>
                            <i className="fa-solid fa-file-pen"></i>
                            Recomendaciones
                        </NavLink>
                        <NavLink to="/usuario-candidato/vacantes-candidato" className={({ isActive }) => isActive ? "activado d-flex flex-column align-items-center" : "noactivado d-flex flex-column align-items-center"}>
                            <i className="fa-solid fa-briefcase"></i>
                            Vacantes
                        </NavLink>
                        <NavLink to="/usuario-candidato/chats-candidato" className={({ isActive }) => isActive ? "activado d-flex flex-column align-items-center" : "noactivado d-flex flex-column align-items-center"}>
                            <i className="fa-solid fa-comment"></i>
                            Chats
                        </NavLink>
                        <NavLink to="/usuario-candidato/notificaciones-candidato" className={({ isActive }) => isActive ? "activado d-flex flex-column align-items-center" : "noactivado d-flex flex-column align-items-center"}>
                            <i className="fa-solid fa-bell"></i>
                            Notificaciones
                        </NavLink>
                        <NavLink to="/usuario-candidato/informacion-candidato" className={({ isActive }) => isActive ? "activado d-flex flex-column align-items-center" : "noactivado d-flex flex-column align-items-center"}>
                            <i className="fa-solid fa-chart-simple"></i>
                            Información
                        </NavLink>
                        <NavLink to="/usuario-candidato/busqueda-candidato" className={({ isActive }) => isActive ? "activado d-flex flex-column align-items-center" : "noactivado d-flex flex-column align-items-center"}>
                            <i className="fa-solid fa-magnifying-glass"></i>
                            Buscar
                        </NavLink>
                    </nav>
                    {/* perfil*/}
                    <div className="perfil d-none d-md-flex">
                        {fotoPerfil ? (
                            <Link to="/usuario-candidato/miperfil-candidato">
                                <img src={fotoPerfil} alt="Perfil" className="perfil-img" />
                            </Link>
                        ) : (
                            <Link to="/usuario-candidato/miperfil-candidato" className="perfil-text-link">
                                Mi perfil
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
                        {fotoPerfil ? (
                            <Link to="/usuario-candidato/miperfil-candidato" onClick={() => setMenuVisible(false)}>
                                <img src={fotoPerfil} alt="Perfil" className="perfil-img" />
                            </Link>
                        ) : (
                            <NavLink to="/usuario-candidato/miperfil-candidato" onClick={() => setMenuVisible(false)}>
                                Mi perfil
                            </NavLink>
                        )}
                        <NavLink to="/usuario-candidato/inicio-candidato" className={({ isActive }) => isActive ? "activado" : ""} onClick={() => setMenuVisible(false)}>Inicio</NavLink>
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
        </>
    );
};
