import React, { useState, useEffect, useCallback } from 'react';
import '../../styles/empresa/seccionvacantes.css';
import { Seccion1VacantesEmpresa } from '../../components/empresa/Seccion1VacantesEmpresa';
import { Seccion2VacantesEmpresa } from '../../components/empresa/Seccion2VacantesEmpresa';
import { SeccionVacante } from '../../components/empresa/SeccionVacante';
import LoadingSpinner from '../../components/LoadingSpinner';

export const PageVacantesEmpresa = ({empresa}) => {
    const [vacantes, setVacantes] = useState([]);
    const [estadoFiltro, setEstadoFiltro] = useState("activa");
    const [seccionActiva, setSeccionActiva] = useState("vacantes");
    const [vacanteSeleccionada, setVacanteSeleccionada] = useState(null);
    const empresaActiva = empresa.id;
    const [isLoading, setIsLoading] = useState(true); 

    // Función para obtener datos del backend
    const fetchData = useCallback(async () => {
        try {
            const Response = await fetch('https://www.codemx.net/codemx/backend/empresa/obtener_vacantes_empresa.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idEmpresa: empresa.id }),
            });

            if (!Response.ok) {
                const errorData = await Response.json();
                throw new Error(errorData.error || 'Error desconocido');
            }
            const vacantesData= await Response.json();

            // Actualizar estados
            setVacantes(vacantesData.vacantes);
            setIsLoading(false);
        } catch (error) {
            console.error('Error al obtener los datos de vacantes:', error);
            setIsLoading(false);
        }
    }, [empresa.id]); 

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Filtrar vacantes según su estatus
    const vacantesFiltradas = vacantes.filter(vacante => vacante.Estatus === estadoFiltro);

        
    const manejarOcultarSeccion = () => {
        setSeccionActiva("vacantes");
        window.scrollTo({
            top: 0,
            behavior: "smooth" 
        });
    };

    const manejarMostrarSeccion = () => {
        setSeccionActiva("agregar-vacante");
    };

    const manejarOcultarSeccionVacante = () => {
        setSeccionActiva("vacantes");
        window.scrollTo({
            top: 0,
            behavior: "smooth" 
        });
    };

    const manejarMostrarSeccionVacante = (vacante) => {
        setVacanteSeleccionada(vacante);
        setSeccionActiva("detalles-vacante");
    };
      
    if (isLoading) {
        return <LoadingSpinner></LoadingSpinner> 
    }

  return (
    <div className='contenedor-seccion-vacantes d-flex flex-column align-items-center w-100 '>
        {seccionActiva === "vacantes" && (
            <div className='header  d-flex justify-content-between align-items-center w-100 py-4'>
                <button className='btn btn-tipodos btn-header-vacantes' onClick={manejarMostrarSeccion}>Agregar Vacante</button>
                <select id="estado" name="estado" className=" custom-font-select btn btn-tipodos btn-header-vacantes" onChange={(e) => setEstadoFiltro(e.target.value)} value={estadoFiltro}>
                    <option value="activa">Vacantes Activas</option>
                    <option value="inactiva">Vacantes Inactivas</option>
                </select>
            </div>
        )}

        {seccionActiva === "vacantes" &&(
            <div className='w-100 pb-4'>
                <Seccion1VacantesEmpresa vacantes={vacantesFiltradas} manejarMostrarSeccionVacante={manejarMostrarSeccionVacante}></Seccion1VacantesEmpresa>
            </div>
        )}
        {seccionActiva === "agregar-vacante" && (
            <div className='w-100 pt-4 pb-4'>
                <Seccion2VacantesEmpresa empresa={empresa} manejarOcultarSeccion={manejarOcultarSeccion} fetchData={fetchData} />
            </div>
        )}
        {seccionActiva === "detalles-vacante" && (
            <div className='w-100 pt-4 pb-4'> 
                <SeccionVacante empresa={empresa} vacante={vacanteSeleccionada} manejarOcultarSeccionVacante={manejarOcultarSeccionVacante} actualizarFetch={fetchData} setVacanteSeleccionada={setVacanteSeleccionada} empresaActiva={empresaActiva}/>
            </div>
        )}


    </div>
  )
}
