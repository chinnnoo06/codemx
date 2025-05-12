import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 

export const ModalSeguidos = ({ empresas, idCandidato }) => {
    // Asegurar que todas las empresas tienen isFollowing: true inicialmente
    const [empresasState, setEmpresasState] = useState(
        empresas.map((empresa) => ({ ...empresa, isFollowing: true }))
    );
    const [query, setQuery] = useState('');
    const navigate = useNavigate(); // Hook para redirigir a otra página
    const [isLoading, setIsLoading] = useState(false); 

    const toggleSeguir = async (idEmpresa) => {
        if (isLoading) return;
        setIsLoading(true);

        try {
            const empresa = empresasState.find((emp) => emp.ID === idEmpresa);

            if (!empresa) return;

            const response = await fetch(
                empresa.isFollowing
                    ? 'https://www.codemx.net/codemx/backend/candidato/dejar_seguir.php'
                    : 'https://www.codemx.net/codemx/backend/candidato/seguir.php', 
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ idCandidato, idEmpresa }),
                }
            );

            const result = await response.json();

            if (result.success) {
                // Actualizar el estado local
                setEmpresasState((prevEmpresas) =>
                    prevEmpresas.map((emp) =>
                        emp.ID === idEmpresa
                            ? { ...emp, isFollowing: !empresa.isFollowing }
                            : emp
                    )
                );
            } else {
                alert('No se pudo actualizar el seguimiento.');
            }
        } catch (error) {
            console.error('Error al cambiar el estado de seguimiento:', error);
            alert('Ocurrió un error al intentar cambiar el estado de seguimiento.');
        } finally {
            setIsLoading(false);
        }
    };

    const buscar = (searchQuery) => {
        setQuery(searchQuery);
        const resultados = empresas.filter((empresa) =>
            empresa.Nombre.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setEmpresasState(
            resultados.map((empresa) => ({ ...empresa, isFollowing: true }))
        );
    };

    // Función para redirigir al perfil de empresa
    const irAlPerfil = (idEmpresa) => {
        navigate(`/usuario-candidato/perfil-empresa`, { 
            state: { idEmpresa: idEmpresa }
        });
    };

    return (
        <div className="container-modal">
             <h5 className="mb-3 text-center titulo-modal">Seguidos</h5>
            {/* Barra de búsqueda */}
            <div className="input-group mb-4 position-relative">
                {/* Icono de búsqueda */}
                <span
                    className="search-icon position-absolute top-50 start-0 translate-middle-y ms-2 text-muted"
                >
                    <i className="fa fa-search"></i>
                </span>
                <input
                    type="text"
                    name="query"
                    placeholder="Buscar Usuario"
                    className="form-control rounded input-busqueda"
                    value={query}
                    onChange={(e) => buscar(e.target.value) }
                />
            </div>


            <div className="empresas-list">
                {empresasState && empresasState.length > 0 ? (
                    empresasState.map((empresa) => (
                        <div
                            key={empresa.ID}
                            onClick={() => irAlPerfil(empresa.ID)}
                            className="empresa-item d-flex align-items-center mb-3"
                        >
                            <img src={empresa.Logo} alt={empresa.Nombre} className="empresa-logo rounded-circle me-3"/>
                            <span className="empresa-nombre">
                                {empresa.Nombre.length > 17 ? `${empresa.Nombre.substring(0, 17)}...` : empresa.Nombre}
                            </span>


                            {empresa.ID && (
                                <button className={`btn ${empresa.isFollowing ? 'btn-dejarseguir' : 'btn-seguir'} ms-auto`} 
                                    onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSeguir(empresa.ID); 
                                  }}>
                                    {empresa.isFollowing ? 'Dejar de seguir' : 'Seguir'}
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No estás siguiendo a ninguna empresa.</p>
                )}
            </div>
        </div>
    );
};

