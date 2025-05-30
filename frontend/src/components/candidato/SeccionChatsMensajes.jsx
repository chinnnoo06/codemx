import React, { useEffect, useRef, useState } from 'react';
import '../../styles/seccionchats.css';

export const SeccionChatsMensajes = ({ chat, irAlPerfilEmpresa, onMostrarOpcionesAutor, onMostrarOpcionesNoAutor, origen = 'normal', manejarCloseModalChatMensajes, candidato }) => {
    const [mensajes, setMensajes] = useState([]);
    const [nuevoMensaje, setNuevoMensaje] = useState('');
    const mensajesEndRef = useRef(null);
    const mensajesBodyRef = useRef(null);
    const intervalRef = useRef(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const prevScrollHeight = useRef(0);

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

     // Función para manejar el scroll manual
     const handleScroll = () => {
        const element = mensajesBodyRef.current;
        if (!element) return;
        
        // Verificamos si el usuario ha hecho scroll hacia arriba
        const isScrolledUp = element.scrollTop + element.clientHeight < element.scrollHeight - 50;
        
        // Si el scroll no está cerca del final, desactivamos el auto-scroll
        setShouldAutoScroll(!isScrolledUp);
        
        // Guardamos la posición actual del scroll para comparaciones futuras
        prevScrollHeight.current = element.scrollHeight;
    };

    const marcarMensajesLeidos = async () => {
        try {
            await fetch('https://www.codemx.net/codemx/backend/candidato/marcar_mensajes_leidos_candidato.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatID: chat.Chat_ID }),
            });
        } catch (error) {
            console.error('Error al marcar mensajes como leídos:', error);
        }
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
                    marcarMensajesLeidos();
                }
            } catch (error) {
                console.error('Error al obtener mensajes:', error);
            }
        };
    
        fetchMensajes();
        intervalRef.current = setInterval(fetchMensajes, 3000);
    
        return () => clearInterval(intervalRef.current);
    }, [chat?.Chat_ID]);

    useEffect(() => {
        // Hacer scroll al final solo al cargar el chat o cuando shouldAutoScroll es true
        if (mensajesBodyRef.current && shouldAutoScroll) {
            mensajesBodyRef.current.scrollTop = mensajesBodyRef.current.scrollHeight;
        }
    }, [chat, shouldAutoScroll]);

    useEffect(() => {
        const element = mensajesBodyRef.current;
        if (!element) return;

        // Solo hacer scroll si shouldAutoScroll es true y hay nuevos mensajes
        if (shouldAutoScroll) {
            element.scrollTop = element.scrollHeight;
        } else {
            // Mantener la posición relativa cuando llegan nuevos mensajes pero el usuario está scrolleando
            const prevScrollPosition = element.scrollHeight - prevScrollHeight.current;
            if (prevScrollPosition > 0) {
                element.scrollTop += element.scrollHeight - prevScrollHeight.current;
            }
        }
        
        prevScrollHeight.current = element.scrollHeight;
    }, [mensajes, shouldAutoScroll]);
    
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
    
            // Forzar el auto-scroll al enviar un mensaje
            setShouldAutoScroll(true);
            setMensajes((prev) => [...prev, mensajeNuevo]);
            setNuevoMensaje('');
    
            // Esperar un momento para que se actualice el DOM y luego hacer scroll
            setTimeout(() => {
                if (mensajesBodyRef.current) {
                    mensajesBodyRef.current.scrollTop = mensajesBodyRef.current.scrollHeight;
                }
            }, 0);

            // Segundo fetch: enviar notificación
            const notifResponse = await fetch(
                'https://www.codemx.net/codemx/backend/config/notificacion_mensaje_candidato.php',
                {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idEmpresa: chat.Empresa_ID, empresaNombre: chat.Empresa_Nombre, candidatoNombre: candidato.nombre, candidatoApellido: candidato.apellido, idChat: chat.Chat_ID}),
                }
            );
    
            const notifResult = await notifResponse.json();
    
            if (!notifResponse.ok || !notifResult.success) {
                console.error('Error al enviar notificación:', notifResult.error || 'Respuesta no exitosa');
            }
    
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
                    className={origen === 'modal' ? 'chat-logo-modal' : 'chat-logo'}
                    loading="lazy"
                    onClick={() => irAlPerfilEmpresa(chat.Empresa_ID)}
                />
                <div className="contenedor-nombre-boton d-flex align-items-center gap-2">
                    <h5 className={origen === 'modal' ? 'empresa-nombre-chat-modal' : 'empresa-nombre-chat'}>
                        {chat.Empresa_Nombre}
                    </h5>

                    {origen === "modal" && (
                        <button className="btn-bajar-modal" onClick={manejarCloseModalChatMensajes}>
                            <i className="fas fa-chevron-down"></i>
                        </button>
                    )}
                </div>

            </div>

            <div className="mensajes-body" ref={mensajesBodyRef}  onScroll={handleScroll}>
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
                                    <div className={origen === 'modal' ? 'etiqueta-fecha-modal' : 'etiqueta-fecha'}>
                                        <span>{obtenerEtiquetaFecha(mensaje.Fecha_Envio)}</span>
                                    </div>
                                )}

                                <div className={`mensaje ${mensaje.Usuario === 'empresa' ? 'mensaje-empresa-usuariocandidato' : 'mensaje-candidato-usuariocandidato'}`}>
                                    <div className={origen === 'modal' ? 'contenedor-mensaje-modal' : 'contenedor-mensaje'}>
                                        {origen === "normal" && (
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
                                        )}
                                        <span className={origen === 'modal' ? 'mensaje-texto-modal' : 'mensaje-texto'}>{mensaje.Mensaje}</span>
                                        <span className={origen === 'modal' ? 'mensaje-hora-modal' : 'mensaje-hora'}>
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

            <div className={origen === 'modal' ? 'mensajes-input-modal' : 'mensajes-input'}>
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
                <button className={origen === 'modal' ? 'btn-enviar-modal' : 'btn-enviar'} onClick={handleEnviarMensaje}>
                    <i className="fa-solid fa-paper-plane"></i>
                </button>
            </div>
        </div>
    );
};
