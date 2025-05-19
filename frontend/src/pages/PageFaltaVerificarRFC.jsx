import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom'; 
import '../styles/login-crearcuenta-recuperar/form.css';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

export const PageFaltaVerificarRFC = () => {
    const location = useLocation();
    const navigate = useNavigate(); // Para redirigir al usuario después de la acción
    const [userId, setUserId] = useState(null);
    const [rfcRechazado, setRfcRechazado] = useState(null);
    const [rfc, setRfc] = useState(null);
    const [newRfc, setNewRfc] = useState(""); // Nuevo RFC
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(""); // Para manejar errores de validación

    useEffect(() => {
        // Extraer el user_id del estado de la redirección
        if (location.state && location.state.user_id) {
            setUserId(location.state.user_id); // Establecer el user_id en el estado
        }
    }, [location]);

    // Función para obtener datos del RFC
    const fetchData = useCallback(async () => {
        try {
            // Obtener las tecnologías dominadas por los usuarios
            const response = await fetch("https://www.codemx.net/codemx/backend/login-crearcuenta/rfc_rachazado.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al obtener rfc');
            }

            const responseData = await response.json();
            setRfc(responseData.rfc);
            setRfcRechazado(responseData.rfcRechazado);
            setIsLoading(false);
        } catch (error) {
            console.error('Error al obtener los datos de rfc:', error);
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            fetchData();
        }
    }, [userId, fetchData]);

    // Validación y envío del nuevo RFC
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar el formato del RFC
        const rfcRegex = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
        const rfcTrimmed = newRfc.trim();

        if (!rfcRegex.test(rfcTrimmed)) {
            setError("El RFC ingresado no es válido. Debe tener el formato: EXT990101NI1");
            return;
        }

        if (newRfc === rfc) {
            setError("No puedes ingresar el mismo RFC que el anterior.");
            return;
        }

        setIsLoading(true);
        setError(""); // Limpiar errores antes de enviar

        try {
            const response = await fetch("https://www.codemx.net/codemx/backend/login-crearcuenta/actualizar_rfc.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    rfc: newRfc
                }),
            });

            const result = await response.json();

            if (result.success) {
                fetchData()
            } else {
                setError(result.message || 'Error desconocido. Intenta nuevamente.');
            }
        } catch (error) {
            setError('Hubo un problema al actualizar el RFC. Intenta más tarde.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="contenedor-header container-fluid w-100">
                <header className="d-flex justify-content-center align-items-center">
                    <div className="logo">
                        <Link to="/"> <h1>CODE<span className="txtspan">MX</span></h1> </Link>
                    </div>
                </header>
            </div>

            <div className="verificacion-correo text-center container-bienvenida">
                <h2 className="texto-color mb-3">¡Espera! Tu cuenta de empresa está en proceso de verificación</h2>
                <p className="texto-color mb-4">
                    Lamentablemente, el RFC que proporcionaste ha sido rechazado, ya que no está registrado oficialmente.
                </p>
                {/* Si el RFC fue rechazado, mostrar formulario */}
                {rfcRechazado == 1 ? (
                    <div className="formulario-rfc py-4">
                        <h3>Por favor ingresa un nuevo RFC:</h3>
                        <form className='form' onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="newRfc">Nuevo RFC:</label>
                                <input 
                                    type="text" 
                                    id="newRfc" 
                                    className="form-label"
                                    value={newRfc} 
                                    onChange={(e) => setNewRfc(e.target.value)} 
                                    required 
                                />
                            </div>
                            {error && <p style={{ color: 'red' }}>{error}</p>}

                            <div className='d-flex justify-content-center'>
                                <button type="submit" className="btn btn-tipodos btn-sm w-50" disabled={isLoading}>
                                    {isLoading ? 'Actualizando...' : 'Actualizar RFC'}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <>
                        <p className="texto-color mb-4">
                            En este momento, nuestro equipo está verificando la validez del RFC proporcionado durante el proceso de registro.
                        </p>
                        <p className="texto-color">
                            Espera por favor, cuando termine el proceso, te llegará un correo electrónico informándote. ¡Gracias por tu comprensión! :)
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};
