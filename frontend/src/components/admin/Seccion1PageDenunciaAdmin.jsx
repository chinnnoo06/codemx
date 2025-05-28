import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/admin/secciondenuncias.css';

export const Seccion1PageDenunciaAdmin = ({ denuncias, actualizarFetch }) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const cambiarEstatus = async (
    idDenuncia,
    idDenunciado,
    estado,
    tipo,
    emailDenunciado,
    nombreDenunciado,
    apellidoDenunciado
  ) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const data = {
        idDenuncia,
        idDenunciado,
        nuevoEstado: estado,
        tipo,
        emailDenunciado,
        nombreDenunciado,
        ...(apellidoDenunciado ? { apellidoDenunciado } : {}),
      };

      const response = await fetch(
        'https://www.codemx.net/codemx/backend/admin/cambiar_estado_denuncia.php',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (result.success) {
        alert('Estado de la denuncia actualizado');
        actualizarFetch();
      } else {
        console.error('Error al cambiar estado:', result.error);
      }
    } catch (error) {
      console.error('Error en la petición:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para navegar al perfil del denunciante o denunciado según tipo y rol
  const irAlPerfilUsuario = (denuncia, esDenunciante) => {
    // esDenunciante: true si es denunciante, false si es denunciado
    const { Tipo_Denuncia } = denuncia;

    let perfilTipo = null; // "candidato" o "empresa"
    let perfilId = null;

    if (Tipo_Denuncia === 'CandidatoCandidato') {
      // Ambos son candidatos
      perfilTipo = 'candidato';
      perfilId = esDenunciante ? denuncia.Denunciante_ID : denuncia.Denunciado_ID;
    } else if (Tipo_Denuncia === 'CandidatoEmpresa') {
      if (esDenunciante) {
        perfilTipo = 'candidato';
        perfilId = denuncia.Denunciante_ID;
      } else {
        perfilTipo = 'empresa';
        perfilId = denuncia.Denunciado_ID;
      }
    } else if (Tipo_Denuncia === 'EmpresaCandidato') {
      if (esDenunciante) {
        perfilTipo = 'empresa';
        perfilId = denuncia.Denunciante_ID;
      } else {
        perfilTipo = 'candidato';
        perfilId = denuncia.Denunciado_ID;
      }
    } else {
      // En caso de otro tipo, no navegar
      return;
    }

    if (perfilTipo === 'candidato') {
      navigate(`/usuario-administrador/perfil-candidato`, {
        state: { idCandidato: perfilId },
      });
    } else if (perfilTipo === 'empresa') {
      navigate(`/usuario-administrador/perfil-empresa`, {
        state: { idEmpresa: perfilId },
      });
    }
  };

  return (
    <>
      {denuncias && denuncias.length > 0 ? (
        <div className="contenedor-denuncias w-100">
          {denuncias.map((denuncia, index) => (
            <div key={index} className="denuncia-card p-2 mb-4 rounded shadow-sm">
              {/* Encabezado */}
              <div className="denuncia-header d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <div>
                  <span className="badge me-2">
                    {denuncia.Motivo || 'Sin motivo especificado'}
                  </span>
                  <span className="badge fecha-denuncia ">
                    {denuncia.Fecha_Denuncia
                      ? new Date(denuncia.Fecha_Denuncia).toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Fecha no disponible'}
                  </span>
                </div>
                <div className="d-flex gap-2">
                  <span className="badge bg-secondary">
                    {denuncia.Comentario && 'Comentario'}
                    {denuncia.Mensaje && 'Mensaje privado'}
                    {denuncia.Publicacion_ID && 'Publicación'}
                    {denuncia.Vacante_ID && 'Vacante'}
                    {!denuncia.Comentario &&
                      !denuncia.Mensaje &&
                      !denuncia.Publicacion_ID &&
                      !denuncia.Vacante_ID &&
                      'Perfil'}
                  </span>
                  <span className="badge bg-secondary">{denuncia.Estado}</span>
                </div>
              </div>

              {/* Cuerpo */}
              <div className="denuncia-body row">
                {/* Usuarios involucrados */}
                <div className="col-md-4 mb-3 mb-md-0 col-1">
                  <div className="card h-100">
                    <div className="card-body">
                      <h6 className="card-title text-uppercase text-muted small mb-3">
                        Usuarios involucrados
                      </h6>

                      {/* Denunciante */}
                      <div
                        className="d-flex align-items-center mb-3 cursor-pointer"
                        onClick={() => irAlPerfilUsuario(denuncia, true)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="con-foto me-3">
                          {denuncia.Foto_Denunciante ? (
                            <img
                              src={denuncia.Foto_Denunciante}
                              alt={`${denuncia.Nombre_Denunciante || ''} ${
                                denuncia.Apellido_Denunciante || ''
                              }`}
                              className="rounded-circle img-denuncias"
                            />
                          ) : (
                            <div className="placeholder-foto rounded-circle d-flex justify-content-center align-items-center">
                              <i className="fa-solid fa-user"></i>
                            </div>
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="subtitulo-denuncia mb-0">Denunciante</h6>
                          <p className="text-muted small mb-0">
                            {denuncia.Nombre_Denunciante || 'Nombre no disponible'}{' '}
                            {denuncia.Apellido_Denunciante || ''}
                          </p>
                        </div>
                      </div>

                      {/* Denunciado */}
                      <div
                        className="d-flex align-items-center cursor-pointer"
                        onClick={() => irAlPerfilUsuario(denuncia, false)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="con-foto me-3">
                          {denuncia.Foto_Denunciado ? (
                            <img
                              src={denuncia.Foto_Denunciado}
                              alt={`${denuncia.Nombre_Denunciado || ''} ${
                                denuncia.Apellido_Denunciado || ''
                              }`}
                              className="rounded-circle img-denuncias"
                            />
                          ) : (
                            <div className="placeholder-foto rounded-circle d-flex justify-content-center align-items-center">
                              <i className="fa-solid fa-user"></i>
                            </div>
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="subtitulo-denuncia mb-0">Denunciado</h6>
                          <p className="text-muted small mb-0">
                            {denuncia.Nombre_Denunciado || 'Nombre no disponible'}{' '}
                            {denuncia.Apellido_Denunciado || ''}
                          </p>
                        </div>
                      </div>

                      {/* Descripción */}
                      {denuncia.Descripcion && (
                        <div className="mt-4">
                          <h6 className="card-title text-uppercase text-muted small mb-2">
                            Descripción de la denuncia
                          </h6>
                          <div className="descripcion-denuncia p-3 bg-light rounded">
                            <p className="parrafo-denuncia mb-0">{denuncia.Descripcion}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contenido denunciado */}
                <div className="col-lg-8 col-12">
                  <div className="card h-100">
                    <div className="card-body">
                      <h6 className="card-title text-uppercase text-muted small mb-3">
                        Contenido denunciado
                      </h6>

                      {denuncia.Comentario && (
                        <div className="contenido-denunciado p-3 bg-light rounded">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="subtitulo-denuncia">Comentario</span>
                            <small className="text-muted contenido-usuario">
                              {denuncia.Fecha_Comentario
                                ? new Date(denuncia.Fecha_Comentario).toLocaleString('es-MX')
                                : 'Fecha no disponible'}
                            </small>
                          </div>
                          <p className="mb-0">{denuncia.Comentario}</p>
                          <div className="mt-2 text-end">
                            <small className="text-muted contenido-usuario">
                              Publicado por: {denuncia.Nombre_Denunciado || 'Usuario desconocido'}
                            </small>
                          </div>
                        </div>
                      )}

                      {denuncia.Mensaje && (
                        <div className="contenido-denunciado p-3 bg-light rounded">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="subtitulo-denuncia">Mensaje privado</span>
                            <small className="text-muted contenido-usuario">
                              {denuncia.Fecha_Envio || 'Fecha no disponible'}
                            </small>
                          </div>
                          <p className="mb-0">{denuncia.Mensaje}</p>
                          <div className="mt-2 text-end">
                            <small className="text-muted contenido-usuario">
                              Enviado por: {denuncia.Nombre_Denunciado || 'Usuario desconocido'}
                            </small>
                          </div>
                        </div>
                      )}

                      {denuncia.Publicacion_ID && (
                        <div className="contenido-denunciado p-3 bg-light rounded">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="subtitulo-denuncia">Publicación</span>
                          </div>
                          <button className="btn btn-sm btn-danger btn-ir"                           
                           onClick={() => {
                              navigate('/usuario-administrador/perfil-empresa', {
                                  state: {
                                      idEmpresa: denuncia.Denunciado_ID,
                                      seccionActiva: 'publicacion',
                                      idPublicacion: denuncia.Publicacion_ID
                                  }
                              });
                              }}
                          >Ir a la publicación</button>
                          <div className="mt-2 text-end">
                            <small className="text-muted contenido-usuario">
                              Publicada por: {denuncia.Nombre_Denunciado || 'Usuario desconocido'}
                            </small>
                          </div>
                        </div>
                      )}

                      {denuncia.Vacante_ID && (
                        <div className="contenido-denunciado p-3 bg-light rounded">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <span className="subtitulo-denuncia">Vacante</span>
                          </div>
                          <button className="btn btn-sm btn-danger btn-ir"
                          onClick={() => {
                              navigate('/usuario-administrador/perfil-empresa', {
                                  state: {
                                      idEmpresa: denuncia.Denunciado_ID,
                                      seccionActiva: 'detalles-vacante',
                                      idVacante: denuncia.Vacante_ID
                                  }
                              });
                              }}
                          >Ir a la Vacante</button>
                          <div className="mt-2 text-end">
                            <small className="text-muted contenido-usuario">
                              Publicada por: {denuncia.Nombre_Denunciado || 'Usuario desconocido'}
                            </small>
                          </div>
                        </div>
                      )}

                      {!denuncia.Comentario &&
                        !denuncia.Mensaje &&
                        !denuncia.Publicacion_ID &&
                        !denuncia.Vacante_ID && (
                          <div className="alert alert-info mb-0">
                            <span>Esta denuncia está relacionada con un perfil o contenido no
                            especificado.</span>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pie de la denuncia con acciones */}
              <div className="denuncia-footer mt-3 d-flex justify-content-end">
                <button
                  className="btn btn-sm btn-tipodos me-2"
                  disabled={denuncia.Estado !== 'En revisión' || isLoading}
                  onClick={() =>
                    cambiarEstatus(
                      denuncia.ID,
                      denuncia.Denunciado_ID,
                      1,
                      denuncia.Tipo_Denuncia,
                      denuncia.Email_Denunciado,
                      denuncia.Nombre_Denunciado,
                      denuncia.Apellido_Denunciado
                    )
                  }
                >
                  {isLoading ? (
                    <>Cargando...</>
                  ) : (
                    <>
                      <i className="fa-solid fa-check me-1"></i> Aceptar
                    </>
                  )}
                </button>

                <button
                  className="btn btn-sm btn-tipouno"
                  disabled={denuncia.Estado !== 'En revisión' || isLoading}
                  onClick={() =>
                    cambiarEstatus(
                      denuncia.ID,
                      denuncia.Denunciado_ID,
                      0,
                      denuncia.Tipo_Denuncia,
                      denuncia.Email_Denunciado,
                      denuncia.Nombre_Denunciado,
                      denuncia.Apellido_Denunciado
                    )
                  }
                >
                  {isLoading ? (
                    <>Cargando...</>
                  ) : (
                    <>
                      <i className="fa-solid fa-ban me-1"></i> Rechazar
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="contenedor-sin-denuncias pt-5">
          <div className="sin-denuncias d-flex flex-column justify-content-center align-items-center">
            <i className="fa-solid fa-flag icono-no-denuncias mb-3"></i>
            <h2 className="texto-no-denuncias mb-2">No hay denuncias pendientes</h2>
          </div>
        </div>
      )}
    </>
  );
};
