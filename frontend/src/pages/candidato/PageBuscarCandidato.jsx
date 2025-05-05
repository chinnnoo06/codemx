import React, { useEffect, useCallback, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/seccionbuscar.css';
import { Seccion1PageBuscarCandidato } from '../../components/candidato/Seccion1PageBuscarCandidato';
import { SeccionListaVacantes } from '../../components/candidato/SeccionListaVacantes';
import { SeccionVacante } from '../../components/candidato/SeccionVacante';
import debounce from 'lodash.debounce';

export const PageBuscarCandidato = ({ candidato }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [resultados, setResultados] = useState([]); // Resultados de las etiquetas seleccionadas o búsqueda
    const [tecnologias, setTecnologias] = useState(null);
    const [sugerencias, setSugerencias] = useState([]); // Estado para las sugerencias
    const [tipoBusqueda, setTipoBusqueda] = useState("perfiles");
    const [botonClase, setBotonClase] = useState("btn-tipodos");
    const [seccionActiva, setSeccionActiva] = useState("resultados-vacantes");
    const [isLoading, setIsLoading] = useState(true);
    const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState([]); // Estado para las etiquetas seleccionadas
    const [vacanteSeleccionada, setVacanteSeleccionada] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const tecnologiasResponse = await fetch('https://www.codemx.net/codemx/backend/config/obtener_tecnologias.php');
            if (!tecnologiasResponse.ok) {
                throw new Error('Error al obtener las tecnologias');
            }
            const tecnologiasData = await tecnologiasResponse.json();

            setTecnologias(tecnologiasData);
            setIsLoading(false);
        } catch (error) {
            console.error('Error al obtener las tecnologias:', error);
            setIsLoading(false);
        }
    }, [candidato.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Función para realizar la búsqueda de vacantes con los IDs de las tecnologías seleccionadas
    const buscarVacantesPorTecnologias = async () => {
        try {
            const tecnologiaIds = tecnologias
                .filter(tecnologia => etiquetasSeleccionadas.includes(tecnologia.tecnologia))
                .map(tecnologia => tecnologia.id); // Obtenemos los IDs de las tecnologías seleccionadas
            
            if (tecnologiaIds.length > 0) {
                const response = await fetch('https://www.codemx.net/codemx/backend/candidato/buscar_vacantes.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        tecnologiaIds,
                        idCandidato: candidato.id
                    }),
                });
                const data = await response.json();
                setResultados(data.vacantes || []);  // Asegurarse de que solo se almacenen las vacantes
            } else {
                setResultados([]); // Si no hay tecnologías seleccionadas, limpiamos los resultados
            }
        } catch (error) {
            console.error('Error al buscar vacantes por tecnologías:', error);
        }
    };

    // Efecto que se ejecuta cada vez que las etiquetas cambian
    useEffect(() => {
        if (etiquetasSeleccionadas.length > 0) {
            buscarVacantesPorTecnologias(); // Solo buscar cuando las etiquetas cambian
        } else {
            setResultados([]); // Limpiar resultados si no hay etiquetas seleccionadas
        }
    }, [etiquetasSeleccionadas]); // Solo se ejecuta cuando las etiquetas cambian

    // Función para realizar la búsqueda de candidatos
    const handleSearch = async (query) => {
        if (!query) return; // No hacer búsqueda si la consulta está vacía
        try {
            const response = await fetch('https://www.codemx.net/codemx/backend/config/buscar_perfiles.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query, idCandidato: candidato.id }),
            });

            const data = await response.json();
            setResultados(data); // Esto es para resultados de búsqueda de candidatos

        } catch (error) {
            console.error('Error al buscar:', error);
        }
    };

    // Usar debounce para retrasar la ejecución de la búsqueda
    const debouncedSearch = debounce((query) => handleSearch(query), 500);

    // Efecto que se ejecuta cada vez que cambia la búsqueda
    useEffect(() => {
        if (tipoBusqueda === "perfiles") {
            if (searchQuery.trim() !== '') {
                debouncedSearch(searchQuery);  // Realizamos la búsqueda si hay algo escrito en el campo de búsqueda
            } else {
                setResultados([]);  // Limpiamos los resultados si no hay nada escrito
            }
    
            // Limpiar el debounce cuando el componente se desmonte
            return () => {
                debouncedSearch.cancel();
            };
        } else if (tipoBusqueda === "vacantes" && etiquetasSeleccionadas.length > 0) {
            // Si el tipo de búsqueda es vacantes, mostramos las vacantes basadas en las etiquetas seleccionadas
            buscarVacantesPorTecnologias();
        } else if (tipoBusqueda === "vacantes" && etiquetasSeleccionadas.length === 0) {
            // Si no hay etiquetas seleccionadas, limpiamos los resultados de vacantes
            setResultados([]);
        }
        
        // Filtrar las sugerencias de tecnologías
        const filteredSuggestions = tecnologias?.filter(tecnologia =>
            tecnologia.tecnologia.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSugerencias(filteredSuggestions || []);
    }, [searchQuery, tecnologias, etiquetasSeleccionadas, tipoBusqueda]);
    

    // Función para alternar el tipo de búsqueda y la clase del botón
    const handleButtonClick = () => {
        if (tipoBusqueda === "perfiles") {
            setTipoBusqueda("vacantes");  
            setBotonClase("btn-tipouno"); 
            setResultados([]);  
        } else {
            setTipoBusqueda("perfiles");  
            setBotonClase("btn-tipodos");
            setResultados([]);  
            setEtiquetasSeleccionadas([])
        }
    };

    // Función para agregar una tecnología a las etiquetas seleccionadas
    const agregarEtiqueta = (tecnologia) => {
        if (!etiquetasSeleccionadas.includes(tecnologia)) {
            setEtiquetasSeleccionadas([...etiquetasSeleccionadas, tecnologia]);
        }
        setSearchQuery(''); // Limpiar el campo de búsqueda
        setSugerencias([]); // Limpiar las sugerencias
    };

    // Función para eliminar una etiqueta
    const eliminarEtiqueta = (tecnologia) => {
        setEtiquetasSeleccionadas(etiquetasSeleccionadas.filter(item => item !== tecnologia));
    };

    const manejarOcultarSeccionVacante = () => {
        setSeccionActiva("resultados-vacantes");
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
        return <LoadingSpinner></LoadingSpinner>; 
    }

    return (
        <div className='contenedor-todo contenedor-seccion-buscar w-100'>
            {seccionActiva === "resultados-vacantes" && (
                <div className='header py-4'>
                    <div className='d-flex justify-content-center gap-2 w-100'>
                        <div className="input-group position-relative">
                            <span
                                className="search-icon position-absolute top-50 start-0 translate-middle-y ms-2 text-muted"
                            >
                                <i className="fa fa-search"></i>
                            </span>
                            <input
                                type="text"
                                name="query"
                                placeholder="Buscar..."
                                className="form-control rounded input-busqueda"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Botón para cambiar el tipo de búsqueda y la clase */}
                        <button
                            className={`boton-buscar-vacantes btn ${botonClase} btn-sm`} 
                            onClick={handleButtonClick}
                        >
                            <i className="fa-solid fa-briefcase"></i>
                        </button>
                    </div>

                    {/* Mostrar sugerencias cuando el tipo de búsqueda es 'vacantes' */}
                    {tipoBusqueda === "vacantes" && searchQuery.trim() && sugerencias.length > 0 && (
                        <div className="sugerencias-tecnologias mt-2">
                            <ul>
                                {sugerencias.map((tecnologia, index) => (
                                    <li key={index} onClick={() => agregarEtiqueta(tecnologia.tecnologia)}>
                                        {tecnologia.tecnologia}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Mostrar las etiquetas seleccionadas */}
                    <div className="etiquetas-seleccionadas">
                        {etiquetasSeleccionadas.map((tecnologia, index) => (
                            <span key={index} className="etiqueta">
                                {tecnologia} 
                                <i className="fa fa-times" onClick={() => eliminarEtiqueta(tecnologia)}></i>
                            </span>
                        ))}
                    </div>
                </div>
            )}
          
            {tipoBusqueda === "perfiles" && (
                <div className='w-100 pb-4'>
                    <Seccion1PageBuscarCandidato resultados={resultados} />
                </div>
            )}

            {tipoBusqueda === "vacantes" && (
                <>
                    {seccionActiva === "resultados-vacantes" && (
                        <div className='w-100 pb-4'>
                            <SeccionListaVacantes vacantes={resultados} manejarMostrarSeccionVacante={manejarMostrarSeccionVacante} busqueda={1} recomendaciones={1}/>
                        </div>
                    )}
                    {seccionActiva === "detalles-vacante" && (
                        <div className='w-100 pb-4 pt-4'>
                            <SeccionVacante idCandidato={candidato.id} vacante={vacanteSeleccionada} manejarOcultarSeccionVacante={manejarOcultarSeccionVacante} setVacanteSeleccionada={setVacanteSeleccionada} actualizarFetch={buscarVacantesPorTecnologias} candidato={candidato}/>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
