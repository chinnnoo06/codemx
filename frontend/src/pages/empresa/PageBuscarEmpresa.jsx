import React, { useState, useEffect } from 'react';
import '../../styles/seccionbuscar.css';
import { Seccion1PageBuscarEmpresa } from '../../components/empresa/Seccion1PageBuscarEmpresa';
import debounce from 'lodash.debounce';

export const PageBuscarEmpresa = ({ empresa }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [resultados, setResultados] = useState([]); // Resultados de las etiquetas seleccionadas o búsqueda

    // Función para realizar la búsqueda de candidatos
    const handleSearch = async (query) => {
        if (!query) {
            setResultados([]); // Limpiar los resultados cuando no hay consulta
            return;
        }

        try {
            const response = await fetch('https://www.codemx.net/codemx/backend/config/buscar_perfiles.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query, idEmpresa: empresa.id }),
            });

            const data = await response.json();
            setResultados(data); // Esto es para resultados de búsqueda de empresas y candidatos

        } catch (error) {
            console.error('Error al buscar:', error);
        }
    };

    // Usar debounce para retrasar la ejecución de la búsqueda
    const debouncedSearch = debounce((query) => handleSearch(query), 500);

    // Efecto que se ejecuta cada vez que cambia la búsqueda
    useEffect(() => {
        if (searchQuery.trim() !== '') {
            debouncedSearch(searchQuery);  // Realizamos la búsqueda si hay algo escrito en el campo de búsqueda
        } else {
            setResultados([]);  // Limpiamos los resultados si no hay nada escrito
        }

        // Limpiar el debounce cuando el componente se desmonte
        return () => {
            debouncedSearch.cancel();
        };
    }, [searchQuery]);

    return (
        <div className='contenedor-todo contenedor-seccion-buscar w-100'>
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
                </div>
            </div>

            <div className='w-100 pb-4'>
                <Seccion1PageBuscarEmpresa resultados={resultados} />
            </div>
        </div>
    );
};
