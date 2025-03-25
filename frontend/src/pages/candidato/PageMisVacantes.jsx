import React, { useEffect, useCallback, useState } from 'react'
import '../../styles/empresa/seccionvacantes.css';
import LoadingSpinner from '../../components/LoadingSpinner';
import { SeccionVacante } from '../../components/candidato/SeccionVacante';
import { SeccionListaVacantes } from '../../components/candidato/SeccionListaVacantes';

export const PageMisVacantes = ({ candidato }) => {
    const [vacantesPostuladas, setVacantesPostuladas] = useState(null);
    const [vacantesGuardadas, setVacantesGuardadas] = useState(null);
    const [estadoFiltro, setEstadoFiltro] = useState("1");  // Default is "1" (En revisión)
    const [seccionActiva, setSeccionActiva] = useState("vacantes-postuladas");
    const [isLoading, setIsLoading] = useState(true); 
    const [vacanteSeleccionada, setVacanteSeleccionada] = useState(null);

    // Función para obtener datos del backend
    const fetchData = useCallback(async () => {
        try {
            const Response = await fetch('https://www.codemx.net/codemx/backend/candidato/obtener_vacantes_candidato.php', {
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
            const vacantesData = await Response.json();

            // Actualizar estados
            setVacantesPostuladas(vacantesData.postuladas);
            setVacantesGuardadas(vacantesData.guardadas);
            setIsLoading(false);
        } catch (error) {
            console.error('Error al obtener los datos de vacantes:', error);
            setIsLoading(false);
        }
    }, [candidato.id]); 

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    
    const manejarOcultarSeccionVacante = () => {
        setSeccionActiva("vacantes-postuladas");
        window.scrollTo({
            top: 0,
            behavior: "smooth" 
        });
    };

    const manejarMostrarSeccionVacante = (vacante) => {
        setVacanteSeleccionada(vacante);
        setSeccionActiva("detalles-vacante");
    };

    // Filtrar las vacantes según el filtro seleccionado
    const vacantesFiltradas = vacantesPostuladas ? vacantesPostuladas.filter(vacante => Number(vacante.Estado_Candidato) === Number(estadoFiltro)) : [];

    if (isLoading) {
        return <LoadingSpinner></LoadingSpinner> 
    }

    return (
        <div className='contenedor-seccion-vacantes d-flex flex-column align-items-center w-100 '>
            {seccionActiva === "vacantes-postuladas" && (
                <div className='header  d-flex justify-content-between align-items-center w-100 py-4'>
                    <button className='btn btn-tipodos btn-header-vacantes' onClick={() => setSeccionActiva("vacantes-guardadas")}>Vacantes Guardadas</button>
                    <select id="estado" name="estado" className=" custom-font-select btn btn-tipodos btn-header-vacantes" onChange={(e) => setEstadoFiltro(e.target.value)} value={estadoFiltro}>
                        <option value="1">En revisión</option>
                        <option value="2">Rechazada</option>
                        <option value="3">Aceptada</option>
                        <option value="5">No Contratado</option>
                        <option value="4">Contratado</option>
                    </select>
                </div>
            )}
            {seccionActiva === "vacantes-guardadas" && (
                <div className='header  d-flex justify-content-between align-items-center w-100 py-4'>
                    <button className='btn btn-tipodos btn-header-vacantes' onClick={() => setSeccionActiva("vacantes-postuladas")}>Vacantes Postuladas</button>
                </div>
            )}

            {seccionActiva === "vacantes-postuladas" &&(
                <div className='w-100 pb-4'>
                    <SeccionListaVacantes vacantes={vacantesFiltradas} manejarMostrarSeccionVacante={manejarMostrarSeccionVacante}></SeccionListaVacantes>
                </div>
            )}
            {seccionActiva === "vacantes-guardadas" && (
                <div className='w-100 pb-4'>
                    <SeccionListaVacantes vacantes={vacantesGuardadas} manejarMostrarSeccionVacante={manejarMostrarSeccionVacante}></SeccionListaVacantes>
                </div>
            )}
            {seccionActiva === "detalles-vacante" && (
                <div className='w-100 pt-4 pb-4'> 
                    <SeccionVacante idCandidato={candidato.id} vacante={vacanteSeleccionada} manejarOcultarSeccionVacante={manejarOcultarSeccionVacante} setVacanteSeleccionada={setVacanteSeleccionada} actualizarFetch={fetchData}/>
                </div>
            )}
        </div>
    )
}
