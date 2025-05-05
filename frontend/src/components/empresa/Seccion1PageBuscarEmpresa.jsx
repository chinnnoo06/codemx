import React from 'react'
import { useNavigate } from 'react-router-dom'; 

export const Seccion1PageBuscarEmpresa = ({resultados}) => {
    const navigate = useNavigate(); 

    // Función para redirigir al perfil del candidato
    const irAlPerfilCandidato = (idCandidato) => {
        navigate(`/usuario-candidato/perfil-candidato`, { 
            state: { idCandidato: idCandidato }
        });
    };

    const irAlPerfilEmpresa = (idEmpresaPerfil) => {
        navigate(`/usuario-candidato/perfil-empresa`, { 
            state: { idEmpresa: idEmpresaPerfil}
        });
    };

        
  return (
    <>
        {resultados && resultados.length > 0 ? (
            <div className='contenedor-buscar w-100'>
                {resultados.map((resultado, index) => (
                    <div key={index} className='resultado d-flex align-items-center' onClick={() => {
                        // Redirigir según el tipo de usuario
                        if (resultado.tipo_usuario === 'candidato') {
                            irAlPerfilCandidato(resultado.ID);
                        } else if (resultado.tipo_usuario === 'empresa') {
                            irAlPerfilEmpresa(resultado.ID);
                        }
                    }}>
                        
                        {/* Logo de la empresa */}
                        <div className='col-uno'>
                            <img
                                src={`${resultado.Foto}?t=${new Date().getTime()}`}
                                alt="Perfil"
                                className="foto-perfil-empresa rounded-circle"
                            />
                        </div>

                        {/* Información de la vacante */}
                        <div className='col-dos'>
                            <div className='d-flex justify-content-between align-items-start '>
                                <span className='titulo-vacante'>{resultado.Nombre} {resultado.Apellido}</span>                     
                            </div>
                        </div>

                    </div>
                ))}
            </div>
        ) : (
            <div className='contenedor-sin-resultados d-flex flex-column justify-content-center align-items-center'>
                <div className='sin-resultados d-flex flex-column align-items-center'>
                    <i className="fa fa-exclamation-circle icono-resultado" aria-hidden="true"></i>
                    <h2 className="texto-no-resultados">No hay resultados</h2>
                </div>
            </div>
        )}
    </>
  )
}
