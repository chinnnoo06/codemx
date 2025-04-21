import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/modalflotante.css';
import { SeccionListaChats } from './SeccionListaChats';
import { SeccionChatsMensajes } from './SeccionChatsMensajes';

export default function ListaChatFlotante({ candidato }) {
    const [visible, setVisible] = useState(false);
    const [chats, setChats] = useState([]);
    const [query, setQuery] = useState('');
    const [chatActivo, setChatActivo] = useState(null);
    const [closing, setClosing] = useState(false);
    const [closingMensajes, setClosingMensajes] = useState(false);

    const navigate = useNavigate();

    const toggleModal = () => {
      if (visible) {
          // Activar animación de cierre
          setClosing(true);
          setTimeout(() => {
              setVisible(false);
              setClosing(false);
              setChatActivo(null);
          }, 300); // tiempo igual al de la animación
      } else {
          setVisible(true);
      }
  };

    // Función para obtener datos del backend
    const fetchData = useCallback(async () => {
        try {
            const Response = await fetch('https://www.codemx.net/codemx/backend/candidato/obtener_chats_candidato.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idCandidato: candidato.id }),
            });

            if (!Response.ok) {
                const errorData = await Response.json();
                throw new Error(errorData.error || 'Error desconocido');
            }
            const chatsData = await Response.json();

            // Actualizar estados
            setChats(chatsData.chats);
        } catch (error) {
            console.error('Error al obtener los datos de vacantes:', error);
        }
    }, [candidato.id]);

    useEffect(() => {
        if (!visible) return;
        fetchData();
    }, [visible, candidato, fetchData]);

    useEffect(() => {
        fetchData(); // carga inicial
    
        const interval = setInterval(() => {
            fetchData(); // actualiza lista de chats
        }, 2000); 
    
        return () => clearInterval(interval); 
    }, [fetchData]);    

    const buscar = (searchQuery) => setQuery(searchQuery);
    const seleccionarChat = (chat) => setChatActivo(chat);
    const irAlPerfilEmpresa = (idEmpresaPerfil) =>
        navigate(`/usuario-candidato/perfil-empresa`, { state: { idEmpresa: idEmpresaPerfil } });

    const manejarCloseModalChatMensajes = () => {
      setClosingMensajes(true);
      setTimeout(() => {
        setChatActivo(null);
        setClosingMensajes(false);
      }, 300); // duración igual a la animación
    };    

    return (
        <div className="chat-flotante-container">
            
            {!visible && (
                <button className="chat-flotante-boton" onClick={toggleModal}>
                    <i className="fa-solid fa-comment-dots me-2"></i> Mensajes
                </button>
            )}

            {visible && (
                <div className={`chat-flotante-wrapper d-flex position-fixed end-0 p-3 ${closing ? 'animar-cierre' : 'animar-apertura'}`}>
                    {chatActivo && (
                        <div className={`chat-flotante-mensajes-modal p-2 me-2 ${closingMensajes ? 'animar-cierre' : 'animar-apertura'}`}>
                 
                            <SeccionChatsMensajes
                                chat={chatActivo}
                                irAlPerfilEmpresa={irAlPerfilEmpresa}
                                origen="modal"
                                manejarCloseModalChatMensajes={manejarCloseModalChatMensajes}
                            />
                        </div>
                    )}

                    <div className="chat-flotante-modal p-2 align-self-end">
                        <div className="chat-modal-header d-flex justify-content-between align-items-center">
                            <h2 className='titulo-modal mb-0'>Tus Conversaciones</h2>
                            <button className="btn-bajar-modal" onClick={toggleModal}>
                                <i className="fas fa-chevron-down"></i>
                            </button>
                        </div>

                        <div className="input-group mb-3 position-relative barra-busqueda-lista-chat-modal">
                              <span className="search-icon position-absolute top-50 start-0 translate-middle-y ms-2 text-muted">
                                  <i className="fa fa-search"></i>
                              </span>
                              <input
                                  type="text"
                                  name="query"
                                  placeholder="Buscar Chat"
                                  className="form-control rounded input-busqueda"
                                  value={query}
                                  onChange={(e) => buscar(e.target.value)}
                              />
                          </div>

                        <SeccionListaChats
                            chats={chats}
                            setChatActivo={seleccionarChat}
                            query={query}
                            irAlPerfilEmpresa={irAlPerfilEmpresa}
                            origen="modal"
                        />
                    </div>
                          
                </div>
            )}


        

        </div>
    );
}
