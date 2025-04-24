import React, { useEffect, useCallback, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import '../../styles/seccionnotificaciones.css';
import { Seccion1PageNotificacionesEmpresa } from '../../components/empresa/Seccion1PageNotificacionesEmpresa';

export const PageNotificacionesEmpresa = ({ empresa }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingOpciones, setIsLoadingOpciones] = useState(false);
    const [notificaciones, setNotificaciones] = useState(null);
    const [showModalConfirmacion, setShowModalConfirmacion] = useState(false);
    const [todasLeidas, setTodasLeidas] = useState(false);


    const fetchData = useCallback(async () => {
        try {
            const Response = await fetch('https://www.codemx.net/codemx/backend/empresa/obtener_notificaciones_empresa.php', {
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

            const notificacionesData = await Response.json();
            setNotificaciones(notificacionesData.notificaciones);

            const todasEstanLeidas = notificacionesData.notificaciones.every(n => n.Leida === '1');
            setTodasLeidas(todasEstanLeidas);

            setIsLoading(false);
        } catch (error) {
            console.error('Error al obtener los datos de notificaciones:', error);
            setIsLoading(false);
        }
    }, [empresa.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const eliminar_todas_notificaciones = async () => {
        if (isLoadingOpciones) return;
        setIsLoadingOpciones(true);

        try {
            const response = await fetch("https://www.codemx.net/codemx/backend/config/eliminar_todas_notificaciones.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idEmpresa: empresa.id }),
            });

            const result = await response.json();

            if (result.success) {
                fetchData();
                setShowModalConfirmacion(false);
            } else {
                console.error("Error:", result.message);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoadingOpciones(false);
            setShowModalConfirmacion(false);
        }
    };

    const leernoleeer_todas_notificaciones = async () => {
        if (isLoadingOpciones) return;
        setIsLoadingOpciones(true);

        try {
            const response = await fetch("https://www.codemx.net/codemx/backend/config/leernoleeer_todas_notificaciones.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idEmpresa: empresa.id }),
            });

            const result = await response.json();

            if (result.success) {
                fetchData();
                setTodasLeidas(result.estado === 1); // Actualiza el estado
            } else {
                console.error("Error:", result.message);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsLoadingOpciones(false);
        }
    };

    if (isLoading) {
        return <LoadingSpinner></LoadingSpinner>; 
    }
    

    return (
        <div className='contenedor-todo contenedor-seccion-notificaciones w-100'>
            <div className='header d-flex flex-column w-100 py-4'>
                <h2 className='titulo-seccion'> Centro de Notificaciones </h2>
                <span className='text-muted descripcion-seccion'>
                    Recibe todas las notificaciones importantes en un solo lugar, y mantente al tanto de nuevas actualizaciones de tus actividades y eventos importantes.
                </span>

                {notificaciones?.length > 0 && (
                    <div className='contenedor-seleccionar'>
                        <div className="d-flex align-items-center gap-3 mt-3">

                            {/* Marcar todas como leídas/no leídas */}
                            <button
                                className="btn btn-tipodos btn-sm d-flex align-items-center gap-2"
                                onClick={leernoleeer_todas_notificaciones}
                            >
                                <input
                                    type="checkbox"
                                    className="checkbox-personalizado"
                                    checked={todasLeidas}
                                    readOnly
                                />
                                <span>
                                    {todasLeidas ? 'Marcar todas como no leídas' : 'Marcar todas como leídas'}
                                </span>
                            </button>

                            {/* Eliminar todas */}
                            <button
                                className="btn btn-tipodos btn-sm d-flex align-items-center gap-2"
                                onClick={() => setShowModalConfirmacion(true)}
                            >
                                <i className="fa-solid fa-trash"></i>
                                <span>Eliminar todas</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className='w-100 pb-4'>          
                <Seccion1PageNotificacionesEmpresa
                    notificaciones={notificaciones}
                    fetchData={fetchData}
                    todasLeidas={todasLeidas}
                />
            </div>

            {/* Modal Confirmación */}
            {showModalConfirmacion && (
                <div className="modal-overlay-confirmacion" onClick={() => setShowModalConfirmacion(false)}>
                    <div className="modal-content-confirmacion" onClick={(e) => e.stopPropagation()}>
                        <p>¿Seguro que quieres eliminar todas las notificaciones?</p>
                        <div className="d-flex justify-content-between mt-3">
                            <button
                                className="btn btn-tipodos btn-sm"
                                onClick={() => setShowModalConfirmacion(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={eliminar_todas_notificaciones}
                            >
                                {isLoadingOpciones ? 'Cargando...' : 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};