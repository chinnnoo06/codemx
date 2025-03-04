import React, { useState, useEffect } from 'react';
import '../../styles/empresa/miperfil.css';

export const ModalEditarPerfil = ({ empresa, manejarCloseModalForm }) => {
    const [tamanios, setTamanios] = useState([]);
    const [sectores, setSectores] = useState([]);
    const [isLoading, setIsLoading] = useState(false); 
    const [errors, setErrors] = useState({});
    const [PasswordsErrors, setPasswordsErrors] = useState({});
    const [seccionActiva, setSeccionActiva] = useState('editarPerfil');
    const [showPasswordActual, setShowPasswordActual] = useState(false); 
    const [showPasswordNueva, setShowPasswordNueva] = useState(false); 
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        idEmpresa: empresa.id,
        nombre: empresa.nombre,
        descripcion: empresa.descripcion,
        sector: '',
        tamanio: '',
        telefono: empresa.telefono,
        fechaCreacion: empresa.fecha_creacion,
        password: '',
    });

    const [passwordData, setPasswordData] = useState({
        idEmpresa: empresa.id,
        passwordActual: '',
        passwordNueva: '',
        confirmarPassword: '',
    });
    

    // Obtener datos del backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch para obtener tamaños
                const tamaniosResponse = await fetch('https://www.codemx.net/codemx/backend/config/obtener_tamanios.php');
                const tamaniosData = await tamaniosResponse.json();

                // Fetch para obtener sectores
                const sectoresResponse = await fetch('https://www.codemx.net/codemx/backend/config/obtener_sectores.php');
                const sectoresData = await sectoresResponse.json();

                setTamanios(tamaniosData);
                setSectores(sectoresData);

                // Buscar el ID del estado por su nombre
                const sectorId = sectoresData.find((sector) => sector.sector === empresa.sector)?.id || '';
                const tamanioId = tamaniosData.find((tamanio) => tamanio.tamanio === empresa.tamanio)?.id || '';

                setFormData((prev) => ({
                    ...prev,
                    sector: sectorId,
                    tamanio: tamanioId,
                }));
            } catch (error) {
                console.error('Error al obtener los datos:', error);
            }
        };

        fetchData();
    }, [empresa]);

    const visibilidadPasswordActual = () => {
        setShowPasswordActual(!showPasswordActual);
    };
      
    const visibilidadPasswordNueva = () => {
        setShowPasswordNueva(!showPasswordNueva);
    };
    
    const visibilidadConfirmarPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const manejarCambio = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const manejarCambioPassword = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const validarCampos = () => {
        const stepErrors = {};
    
        // Validar inputs y selects del formulario actual
        const form = document.querySelector(`form`);
        if (!form) return false;
        
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach((input) => {
            if (input.hasAttribute('required') && !input.value.trim()) {
            stepErrors[input.id] = 'Este campo es obligatorio';
            }
        });

        // Validar número de teléfono
        const telefono = formData.telefono.trim();
        const telefonoRegex = /^[0-9]{10}$/;
        if (telefono && !telefonoRegex.test(telefono)) {
            stepErrors['telefono'] = 'El número de teléfono debe tener 10 dígitos numéricos';
        }
    
        // Validar fecha de creación
        const fechaCreacion = formData.fechaCreacion.trim();
        const today = new Date().toISOString().split('T')[0]; 
        if (fechaCreacion && fechaCreacion > today) {
        stepErrors['fechaCreacion'] = 'La fecha de creación no puede ser mayor al día de hoy';
        }

            
        if (!formData.password.trim()) {
            stepErrors.password = 'Por favor, ingresa tu contraseña actual.';
        }
    
    
        setErrors(stepErrors);
    
        return Object.keys(stepErrors).length === 0;
    };

    const validarPassword = () => {
        const stepErrors = {};
    
        if (!passwordData.passwordActual.trim()) {
            stepErrors.passwordActual = 'Por favor, ingresa tu contraseña actual.';
        }
    
        const passwordNueva = passwordData.passwordNueva.trim();
        const confirmarPassword = passwordData.confirmarPassword.trim();
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    
        if (!passwordNueva) {
            stepErrors.passwordNueva = 'Por favor, ingresa tu nueva contraseña.';
        } else if (!passwordRegex.test(passwordNueva)) {
            stepErrors.passwordNueva = 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas y minúsculas.';
        }
    
        if (passwordNueva !== confirmarPassword) {
            stepErrors.confirmarPassword = 'Las contraseñas no coinciden.';
        }
    
        setPasswordsErrors(stepErrors);
        return Object.keys(stepErrors).length === 0;
    };
    

    const enviarDatos = async (e) => {
        
        e.preventDefault();
        if (isLoading) return;

        if (seccionActiva === 'editarPerfil'){
                
            const isValid = validarCampos();
            if (!isValid) {
                return; 
            }
    
            setIsLoading(true);
    
            try {
                const formDataToSend = new FormData();
                Object.keys(formData).forEach((key) => {
                    formDataToSend.append(key, formData[key]);
                });

                formDataToSend.append("passwordActual", formData.password.trim());
    
                const response = await fetch('https://www.codemx.net/codemx/backend/empresa/editar_perfil_empresa.php', {
                    method: 'POST',
                    body: formDataToSend,
                });
    
                const result = await response.json();
    
                if (result.success) {
                    manejarCloseModalForm();
                    window.location.reload();
                } else {
                    if (result.error === 'La contraseña actual es incorrecta.') {
                        setErrors((prevErrors) => ({
                            ...prevErrors,
                            password: result.error,
                        }));
                    } else {
                        alert(result.error || 'Hubo un error al actualizar.');
                    }
                }
            } catch (error) {
                console.error('Error al actualizar:', error);
                alert('Hubo un error al enviar los datos.');
            } finally {
                setIsLoading(false);
            }

        } else if (seccionActiva === "cambiarPassword"){ 
            
            const isValid = validarPassword();
            if (!isValid) {
                setIsLoading(false);
                return; 
            }
        
            setIsLoading(true);

            try {
                const passwordDataToSend = new FormData();
      
                // Añadir cada campo del formulario a FormData
                Object.keys(passwordData).forEach((key) => {
                    passwordDataToSend.append(key, passwordData[key]);
                });
          
                const response = await fetch('https://www.codemx.net/codemx/backend/empresa/cambiar_password_empresa.php', {
                  method: 'POST',
                  body: passwordDataToSend,
                });
    
                if (!response.ok) {
                    throw new Error('Error al enviar los datos al servidor');
                  }
            
                const result = await response.json();
    
                if (result.success) {
                    manejarCloseModalForm();
                    window.location.reload(); 
                } else {
                     // Manejo de errores en ambos campos de contraseña
                    if (result.error === 'La contraseña actual es incorrecta.') {
                        setPasswordsErrors((prevErrors) => ({
                            ...prevErrors,
                            passwordActual: result.error,
                        }));
                    } else if (result.error.includes('contraseña')) {
                        setPasswordsErrors((prevErrors) => ({
                            ...prevErrors,
                            passwordNueva: result.error,
                        }));
                    } else {
                        alert(result.error || 'Hubo un error al actualizar.');
                    }
                }
            } catch (error) {
                console.error('Error al actualizar:', error);
                alert('Hubo un error al enviar los datos.');
            } finally {
                setIsLoading(false);
            }
        }
    };
    
    return (
        <div>
            <div className="botones-modal d-flex justify-content-center mb-4">
                <button
                    className={`btn ${seccionActiva === 'editarPerfil' ? 'btn btn-tipodos' : 'btn btn-tipouno'}  me-5`}
                    onClick={() => setSeccionActiva('editarPerfil')}
                >
                    Editar Perfil
                </button>
                <button
                    className={`btn ${seccionActiva === 'cambiarPassword' ? 'btn btn-tipodos' : 'btn btn-tipouno'}`}
                    onClick={() => setSeccionActiva('cambiarPassword')}
                >
                    Cambiar Contraseña
                </button>
            </div>


            {seccionActiva === 'editarPerfil' && (
                <form className="form" onSubmit={enviarDatos} noValidate>
                    <div className="mb-3">
                        <label htmlFor="nombre" className="form-label">Nombre <span className="text-danger">*</span></label>
                        <input type="text" id="nombre" name="nombre" className="form-control" value={formData.nombre} onChange={manejarCambio} required />
                        {errors.nombre && <small className="text-danger">{errors.nombre}</small>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="descripcion" className="form-label">Descripcion <span className="text-danger">*</span></label>
                        <textarea id="descripcion" name="descripcion" className="form-control"  maxLength={250} value={formData.descripcion} onChange={manejarCambio} required/>
                        {errors.descripcion && <small className="text-danger">{errors.descripcion}</small>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="fechaCreacion" className="form-label">Fecha de Creación <span className="text-danger">*</span></label>
                        <input type="date" id="fechaCreacion" name="fechaCreacion" className="form-control" value={formData.fechaCreacion} onChange={manejarCambio} required/>
                        {errors.fechaCreacion && <small className="text-danger">{errors.fechaCreacion}</small>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="sector" className="form-label">Sector <span className="text-danger">*</span></label>
                        <select id="sector" name="sector" className="form-select form-select-lg custom-font-select" value={formData.sector} onChange={manejarCambio} required>
                        <option value="">Seleccione un sector</option>
                            {sectores.map((sector) => (
                                <option key={sector.id} value={sector.id}>
                                {sector.sector}
                                </option>
                            ))}
                        </select>
                        {errors.sector && <small className="text-danger">{errors.sector}</small>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="tamanio" className="form-label">Tamaño <span className="text-danger">*</span></label>
                        <select id="tamanio" name="tamanio" className="form-select form-select-lg custom-font-select" value={formData.tamanio} onChange={manejarCambio} required>
                            <option value="">Seleccione un tamaño</option>
                            {tamanios.map((tamanio) => (
                            <option key={tamanio.id} value={tamanio.id}>
                                {tamanio.tamanio} - {tamanio.cantidad}
                            </option>
                            ))}
                        </select>
                        {errors.tamanio && <small className="text-danger">{errors.tamanio}</small>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="telefono" className="form-label">Teléfono <span className="text-danger">*</span></label>
                        <input type="tel" id="telefono" name="telefono" className="form-control" value={formData.telefono} onChange={manejarCambio} required />
                        {errors.telefono && <small className="text-danger">{errors.telefono}</small>}
                    </div>

                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Confirme su contraseña <span className="text-danger">*</span></label>
                        <input type={showPasswordActual ? "text" : "password"} id="password" name="password" className="form-control" value={formData.password} onChange={manejarCambio} required/>
                        <span className="input-group-text" onClick={visibilidadPasswordActual}>
                            <i className={showPasswordActual ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                        </span>
                        {errors.password && <small className="text-danger">{errors.password}</small>}
                    </div>


                    
                                
                    <button type="submit" className="btn btn-tipodos" disabled={isLoading}>
                        {isLoading ? 'Guardando...' : 'Guardar' }
                    </button>
                </form>
            )}

            {seccionActiva === 'cambiarPassword' && (
                <form className="form" onSubmit={enviarDatos} noValidate>
                    <div className="mb-3">
                        <label htmlFor="passwordActual" className="form-label">Actual Contraseña <span className="text-danger">*</span></label>
                        <input type={showPasswordActual ? "text" : "password"} id="passwordActual" name="passwordActual" className="form-control" value={passwordData.passwordActual} onChange={manejarCambioPassword} required/>
                        <span className="input-group-text" onClick={visibilidadPasswordActual}>
                            <i className={showPasswordActual ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                        </span>
                        {PasswordsErrors.passwordActual && <small className="text-danger">{PasswordsErrors.passwordActual}</small>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="passwordNueva" className="form-label">Nueva Contraseña <span className="text-danger">*</span></label>
                        <input type={showPasswordNueva ? "text" : "password"} id="passwordNueva" name="passwordNueva" className="form-control" value={passwordData.passwordNueva} onChange={manejarCambioPassword} required/>
                        <span className="input-group-text" onClick={visibilidadPasswordNueva}>
                            <i className={showPasswordNueva ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                        </span>
                        {PasswordsErrors.passwordNueva && <small className="text-danger">{PasswordsErrors.passwordNueva}</small>}
                    </div>

                    <div className="mb-3">
                        <label htmlFor="confirmarPassword" className="form-label">Confirmar Contraseña <span className="text-danger">*</span></label>
                        <input type={showConfirmPassword ? "text" : "password"} id="confirmarPassword" name="confirmarPassword" className="form-control" value={passwordData.confirmarPassword} onChange={manejarCambioPassword} required/>
                        <span className="input-group-text" onClick={visibilidadConfirmarPassword}>
                            <i className={showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                        </span>
                        {PasswordsErrors.confirmarPassword && <small className="text-danger">{PasswordsErrors.confirmarPassword}</small>}
                    </div>

                    <button type="submit" className="btn btn-tipodos" disabled={isLoading}>
                        {isLoading ? 'Guardando...' : 'Guardar' }
                    </button>
                </form>
            )}


        </div>
    );
};
