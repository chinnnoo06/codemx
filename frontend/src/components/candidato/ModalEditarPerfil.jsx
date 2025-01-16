import React, { useState, useEffect } from 'react';

export const ModalEditarPerfil = ({ candidato, manejarCloseModalForm }) => {
    const [estados, setEstados] = useState([]);
    const [sexos, setSexos] = useState([]);
    const [modalidades, setModalidades] = useState([]);
    const [universidades, setUniversidades] = useState([]);
    const [isLoading, setIsLoading] = useState(false); 
    const [errors, setErrors] = useState({});
    const [PasswordsErrors, setPasswordsErrors] = useState({});
    const [seccionActiva, setSeccionActiva] = useState('editarPerfil');
    const [showPasswordActual, setShowPasswordActual] = useState(false); 
    const [showPasswordNueva, setShowPasswordNueva] = useState(false); 
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        idCandidato: candidato.id,
        nombre: candidato.nombre,
        apellido: candidato.apellido,
        fechaNacimiento: candidato.fecha_nacimiento,
        telefono: candidato.telefono,
        estado: '', // Aquí se guardará el ID del estado
        direccion: candidato.direccion,
        sexo: '', // Aquí se guardará el ID del sexo
        universidad: '',
        tiempoRestante: candidato.tiempo_restante,
        modalidadTrabajo: '',
    });

    const [passwordData, setPasswordData] = useState({
        idCandidato: candidato.id,
        passwordActual: '',
        passwordNueva: '',
        confirmarPassword: '',
    });
    

    // Obtener datos del backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                const estadosResponse = await fetch('https://www.codemx.net/codemx/backend/config/obtener_estados.php');
                const estadosData = await estadosResponse.json();

                const sexosResponse = await fetch('https://www.codemx.net/codemx/backend/config/obtener_sexos.php');
                const sexosData = await sexosResponse.json();

                const modalidadesResponse = await fetch('https://www.codemx.net/codemx/backend/config/obtener_modalidades.php');
                const modalidadesData = await modalidadesResponse.json();

                const universidadesResponse = await fetch('https://www.codemx.net/codemx/backend/config/obtener_universidades.php');
                const universidadesData = await universidadesResponse.json();

                setEstados(estadosData);
                setSexos(sexosData);
                setModalidades(modalidadesData);
                setUniversidades(universidadesData);

                // Buscar el ID del estado por su nombre
                const estadoId = estadosData.find((estado) => estado.nombre === candidato.estado)?.id || '';
                const sexoId = sexosData.find((sexo) => sexo.sexo === candidato.sexo)?.id || '';
                const universidadId = universidadesData.find((universidad) => universidad.nombre === candidato.universidad)?.id || '';
                const modalidadId = modalidadesData.find((modalidad_trabajo) => modalidad_trabajo.modalidad === candidato.modalidad_trabajo)?.id || '';

                setFormData((prev) => ({
                    ...prev,
                    estado: estadoId,
                    sexo: sexoId,
                    universidad: universidadId,
                    modalidadTrabajo: modalidadId,
                }));
            } catch (error) {
                console.error('Error al obtener los datos:', error);
            }
        };

        fetchData();
    }, [candidato]);

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
    
        // Validar edad mínima de 18 años
        const fechaNacimiento = formData.fechaNacimiento;
        if (fechaNacimiento) {
        const hoy = new Date();
        const fechaNac = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - fechaNac.getFullYear();
        const mes = hoy.getMonth() - fechaNac.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
            edad--;
        }
    
        if (edad < 18) {
            stepErrors['fechaNacimiento'] = 'Debes tener al menos 18 años';
        }
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
                setIsLoading(false);
                return; 
            }
        
            setIsLoading(true);

            try {
                const formDataToSend = new FormData();
      
                // Añadir cada campo del formulario a FormData
                Object.keys(formData).forEach((key) => {
                    formDataToSend.append(key, formData[key]);
                });
          
                const response = await fetch('https://www.codemx.net/codemx/backend/candidato/editar_perfil_candidato.php', {
                  method: 'POST',
                  body: formDataToSend,
                });
    
                if (!response.ok) {
                    throw new Error('Error al enviar los datos al servidor');
                  }
            
                const result = await response.json();
    
                if (result.success) {
                    manejarCloseModalForm();
                    window.location.reload(); // Recarga la página
                } else {
                    alert(result.error || 'Hubo un error al actualizar.');
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
          
                const response = await fetch('https://www.codemx.net/codemx/backend/candidato/cambiar_password_candidato.php', {
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
                    alert(result.error || 'Hubo un error al actualizar.');
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
                        <label htmlFor="apellido" className="form-label">Apellido <span className="text-danger">*</span></label>
                        <input type="text" id="apellido" name="apellido" className="form-control" value={formData.apellido} onChange={manejarCambio} required />
                        {errors.apellido && <small className="text-danger">{errors.apellido}</small>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="fechaNacimiento" className="form-label">Fecha de Nacimiento <span className="text-danger">*</span></label>
                        <input type="date" id="fechaNacimiento" name="fechaNacimiento" className="form-control"value={formData.fechaNacimiento} onChange={manejarCambio} required />
                        {errors.fechaNacimiento && <small className="text-danger">{errors.fechaNacimiento}</small>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="telefono" className="form-label">Teléfono <span className="text-danger">*</span></label>
                        <input type="tel" id="telefono" name="telefono" className="form-control" value={formData.telefono} onChange={manejarCambio} required />
                        {errors.telefono && <small className="text-danger">{errors.telefono}</small>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="estado" className="form-label">Estado <span className="text-danger">*</span></label>
                        <select id="estado" name="estado" className="form-select form-select-lg custom-font-select" value={formData.estado} onChange={manejarCambio} required>
                            <option value="">Seleccione un estado</option>
                            {estados.map((estado) => (
                                <option key={estado.id} value={estado.id}>
                                    {estado.nombre}
                                </option>
                            ))}
                        </select>
                        {errors.estado && <small className="text-danger">{errors.estado}</small>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="direccion" className="form-label">Dirección <span className="text-danger">*</span></label>
                        <input type="text" id="direccion" name="direccion" className="form-control" value={formData.direccion} onChange={manejarCambio} required />
                        {errors.direccion && <small className="text-danger">{errors.direccion}</small>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="sexo" className="form-label">Sexo <span className="text-danger">*</span></label>
                        <select id="sexo" name="sexo" className="form-select form-select-lg custom-font-select" value={formData.sexo} onChange={manejarCambio} required>
                            <option value="">Seleccione un sexo</option>
                            {sexos.map((sexo) => (
                                <option key={sexo.id} value={sexo.id}>
                                    {sexo.sexo}
                                </option>
                            ))}
                        </select>
                        {errors.sexo && <small className="text-danger">{errors.sexo}</small>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="universidad" className="form-label">Universidad donde estudiaste o donde sigues estudiando <span className="text-danger">*</span></label>
                        <select id="universidad" name="universidad" className="form-select form-select-lg custom-font-select" value={formData.universidad} onChange={manejarCambio} required>
                            <option value="">Seleccione una universidad</option>
                            {universidades.map((universidad) => (
                                <option key={universidad.id} value={universidad.id}>
                                    {universidad.nombre}
                                </option>
                            ))}
                        </select>
                        {errors.universidad && <small className="text-danger">{errors.universidad}</small>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="tiempoRestante" className="form-label">Tiempo restante (aproximado) para terminar la universidad <span className="text-danger">*</span></label>
                        <select id="tiempoRestante" name="tiempoRestante" className="form-select form-select-lg custom-font-select" value={candidato.tiempo_restante} onChange={manejarCambio} required>
                            <option value="">Seleccione una opción</option>
                            <option value="6 MESES">6 meses</option>
                            <option value="1 AÑO">1 año</option>
                            <option value="2 AÑOS">2 años</option>
                            <option value="MAS DE 2 AÑOS">Más de 2 años</option>
                            <option value="GRADUADO">Graduado</option>
                        </select>
                    </div>
                    {errors.tiempoRestante && <small className="text-danger">{errors.tiempoRestante}</small>}
                    <div className="mb-3">
                        <label htmlFor="modalidadTrabajo" className="form-label">Modalidad de trabajo preferida <span className="text-danger">*</span></label>
                        <select id="modalidadTrabajo" name="modalidadTrabajo" className="form-select form-select-lg custom-font-select" value={formData.modalidadTrabajo} onChange={manejarCambio} required>
                            <option value="">Seleccione una modalidad</option>
                                {modalidades.map((modalidad) => (
                                <option key={modalidad.id} value={modalidad.id}>
                                {modalidad.modalidad}
                                </option>
                            ))}
                        </select>
                        {errors.modalidadTrabajo && <small className="text-danger">{errors.modalidadTrabajo}</small>}
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
