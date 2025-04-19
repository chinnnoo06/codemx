import React, { useEffect, useRef, useState } from 'react';
import '../../styles/seccionchats.css';

export const SeccionChatsMensajes = ({ chat, irAlPerfilEmpresa, onMostrarOpcionesAutor, onMostrarOpcionesNoAutor }) => {
    const [mensajes, setMensajes] = useState([]);
    const [nuevoMensaje, setNuevoMensaje] = useState('');
    const mensajesEndRef = useRef(null);
    const mensajesBodyRef = useRef(null);
    const intervalRef = useRef(null);
    const [firstLoad, setFirstLoad] = useState(true);


    const obtenerEtiquetaFecha = (fechaISO) => {
        const fecha = new Date(fechaISO);
        const hoy = new Date();
        const ayer = new Date();
        ayer.setDate(hoy.getDate() - 1);

        const esMismoDia = (a, b) =>
            a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate();

        if (esMismoDia(fecha, hoy)) return 'Hoy';
        if (esMismoDia(fecha, ayer)) return 'Ayer';

        return fecha.toLocaleDateString('es-MX', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    useEffect(() => {
        if (!chat) return;
    
        const fetchMensajes = async () => {
            try {
                const response = await fetch('https://www.codemx.net/codemx/backend/config/obtener_mensajes_chat.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chatID: chat.Chat_ID }),
                });
    
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Error desconocido');
                }
    
                const data = await response.json();
                if (JSON.stringify(data.mensajes) !== JSON.stringify(mensajes)) {
                    setMensajes(data.mensajes);
                }
            } catch (error) {
                console.error('Error al obtener mensajes:', error);
            }
        };
    
        fetchMensajes();
        intervalRef.current = setInterval(fetchMensajes, 3000);
        setFirstLoad(true); // <-- reset al cambiar de chat
    
        return () => clearInterval(intervalRef.current);
    }, [chat?.Chat_ID]);

    useEffect(() => {
        if (firstLoad && mensajesBodyRef.current && mensajesEndRef.current) {
            mensajesBodyRef.current.scrollTop = mensajesBodyRef.current.scrollHeight;
            setFirstLoad(false);
        }
    }, [mensajes, firstLoad]);
    


    const handleEnviarMensaje = async () => {
        if (!nuevoMensaje.trim()) return;

        try {
            const response = await fetch('https://www.codemx.net/codemx/backend/config/agregar_mensaje.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatID: chat.Chat_ID,
                    usuario: 'candidato',
                    mensaje: nuevoMensaje,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al enviar el mensaje');
            }

            const mensajeNuevo = {
                Mensaje_ID: Date.now(),
                Mensaje: nuevoMensaje,
                Usuario: 'candidato',
                Fecha_Envio: new Date().toISOString(),
            };

            setMensajes((prev) => [...prev, mensajeNuevo]);
            setNuevoMensaje('');
        } catch (error) {
            console.error('Error al enviar el mensaje:', error);
        }
    };

    if (!chat) {
        return (
            <div className="contenedor-nochat text-center text-muted d-flex justify-content-center align-items-center flex-column">
                <i className="fa-regular fa-comments fa-4x mb-3"></i>
                <p className="fs-5">Selecciona un chat para comenzar a conversar</p>
            </div>
        );
    }

    return (
        <div className="chat-mensajes">
            <div className="mensajes-header d-flex justify-content-between align-items-center pb-2 mb-4">
                <img
                    src={`${chat.Empresa_Logo}?t=${new Date().getTime()}`}
                    alt="Perfil"
                    className="chat-logo"
                    loading="lazy"
                    onClick={() => irAlPerfilEmpresa(chat.Empresa_ID)}
                />
                <h5>{chat.Empresa_Nombre}</h5>
            </div>

            <div className="mensajes-body" ref={mensajesBodyRef}>
                {(() => {
                    let fechaAnterior = null;

                    return mensajes.map((mensaje) => {
                        const fechaActual = new Date(mensaje.Fecha_Envio);
                        const claveFecha = fechaActual.toISOString().split('T')[0];
                        const mostrarEtiqueta = claveFecha !== fechaAnterior;
                        fechaAnterior = claveFecha;

                        return (
                            <React.Fragment key={mensaje.Mensaje_ID}>
                                {mostrarEtiqueta && (
                                    <div className="etiqueta-fecha">
                                        <span>{obtenerEtiquetaFecha(mensaje.Fecha_Envio)}</span>
                                    </div>
                                )}

                                <div className={`mensaje ${mensaje.Usuario === 'empresa' ? 'mensaje-empresa' : 'mensaje-candidato'}`}>
                                    <div className="contenedor-mensaje">
                                        <i
                                        className="fa-solid fa-ellipsis icono-opciones"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (mensaje.Usuario === 'candidato') {
                                                onMostrarOpcionesAutor(mensaje.Mensaje_ID);  
                                            } else {
                                                onMostrarOpcionesNoAutor(mensaje.Mensaje_ID, chat.Empresa_ID); 
                                            }
                                        }}
                                        ></i>
                                        <span className="mensaje-texto">{mensaje.Mensaje}</span>
                                        <span className="mensaje-hora">
                                            {fechaActual.toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    });
                })()}
                <div ref={mensajesEndRef}></div>
            </div>

            <div className="mensajes-input">
                <input
                    type="text"
                    className="rounded"
                    placeholder="Escribe un mensaje..."
                    value={nuevoMensaje}
                    onChange={(e) => setNuevoMensaje(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleEnviarMensaje();
                        }
                    }}
                />
                <button className="btn-enviar" onClick={handleEnviarMensaje}>
                    <i className="fa-solid fa-paper-plane"></i>
                </button>
            </div>
        </div>
    );
};
