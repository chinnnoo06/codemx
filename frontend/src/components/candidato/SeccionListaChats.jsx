import React from 'react';
import '../../styles/seccionchats.css';

export const SeccionListaChats = ({ chats, setChatActivo, query, irAlPerfilEmpresa }) => {
  const chatsFiltrados = chats.filter(chat =>
    chat.Empresa_Nombre.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="lista-chats-candidato w-100">
      <div className='contenedor-lista-chats-scroll'>
        {chatsFiltrados.length === 0 ? (
          <div className="contenedor-nochat text-center text-muted d-flex justify-content-center align-items-center flex-column">
            <i className="fa-regular fa-comment-dots fa-3x mb-3"></i>
            <p className="fs-6">No tienes chats disponibles</p>
          </div>
        ) : (
          chatsFiltrados.map((chat) => (
            <div className='contenedor-chat' key={chat.Chat_ID} onClick={() => setChatActivo(chat)}>
              <div className="chat-preview">
                <img
                  src={`${chat.Empresa_Logo}?t=${new Date().getTime()}`}
                  alt="Perfil"
                  className="chat-logo"
                  onClick={() => irAlPerfilEmpresa(chat.Empresa_ID)}
                />
                <div className="chat-info">
                  <div className="chat-header">
                    <span className="chat-nombre">{chat.Empresa_Nombre}</span>
                    {chat.Ultimo_Mensaje && (
                      <span className="chat-hora">
                        {new Date(chat.Ultimo_Mensaje.Fecha_Envio).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                  <div className="chat-ultimo-mensaje">
                  {chat.Ultimo_Mensaje
                    ? chat.Ultimo_Mensaje.Mensaje
                    : 'Sin mensajes aún'}

                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
