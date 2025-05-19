import React from 'react'
import { useNavigate } from 'react-router-dom'; 

export const Seccion1PageGestionUsuariosAdmin = ({usuarios, tipoUsuario}) => {
    const navigate = useNavigate(); 


    // Función para redirigir al perfil del candidato
    const irAlPerfilCandidato = (idCandidato) => {
        navigate(`/usuario-administrador/perfil-candidato`, { 
            state: { idCandidato: idCandidato }
        });
    };

    const irAlPerfilEmpresa = (idEmpresaPerfil) => {
        navigate(`/usuario-administrador/perfil-empresa`, { 
            state: { idEmpresa: idEmpresaPerfil}
        });
    };

  return (
        <>
        {usuarios && usuarios.length > 0 ? (
            <div className='contenedor-listausuarios w-100'>
                {usuarios.map((usuario, index) => (
                    <div key={index} className='usuario d-flex align-items-center pt-3 pb-3'  onClick={() => {
                        if (tipoUsuario === 'candidatos') {
                        irAlPerfilCandidato(usuario.Candidato_ID || usuario.ID);
                        } else {
                        irAlPerfilEmpresa(usuario.Empresa_ID || usuario.ID);
                        }
                    }}>

                        {/* Logo del usuario */}
                        <div className='fila-foto'>
                            {tipoUsuario == "candidatos" ? (
                                <img
                                    src={`${usuario.Fotografia}?t=${new Date().getTime()}`}
                                    alt="Perfil"
                                    className="foto-perfil-empresa rounded-circle"
                                />
                            ) : (
                                <img
                                    src={`${usuario.Logo}?t=${new Date().getTime()}`}
                                    alt="Perfil"
                                    className="rounded-circle"
                                />
                            )}
            
                        </div>

                        {/* Información */}
                        <div className='fila-info'>
                            <div className='d-flex justify-content-between align-items-start '>
                                {tipoUsuario == "candidatos" ? (
                                   <h4 className='nombre-usuario'>{usuario.Nombre} {usuario.Apellido}</h4>
                                ) : (
                                    <h4 className='nombre-usuario'>{usuario.Nombre}</h4>
                                )}

                            </div>

                            <h5 className='email-usuario'>{usuario.Email}</h5>

                            <div className='datos d-flex'>
                                <span className='text-muted'> Correo Verificado: {usuario.Correo_Verificado === "1" ? 'Sí' : 'No'}</span>
                                {tipoUsuario == "empresas" && <span className='text-muted'>RFC Verificado: {usuario.RFC_Verificado === "1" ? 'Sí' : 'No'}</span>}
                                <span className='text-muted'>Estatus: {usuario.Estado_Cuenta === "1" ? 'Activa' : 'Inactiva'}</span>
                                <span className='text-muted'>Strikes: {usuario.Strikes}</span>
                                <span className='text-muted'>Fecha Registro: {usuario.Fecha_Registro}</span>
                            </div>
                        </div>

                    </div>
                ))}
            </div>
        ) : (
            <>
                <div className='contenedor-sin-usuarios'>
                    <div className='sin-usuarios d-flex flex-column justify-content-center align-items-center'>
                        <i className="fa-solid fa-users icono-usuarios mb-2"></i> 
                        <h2 className="texto-no-usuarios">No hay usuarios</h2>
                    </div>
                </div>

            </>


        )}
    </>
  )
}
