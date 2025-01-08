import React, { useState, useEffect } from 'react';
import '../../styles/login-crearcuenta-recuperar/form.css';

export const SeccionFormEmpresa = ({ onRegistroCompleto }) => {
  const [step, setStep] = useState(1); // Controla el paso actual del formulario
  const [errors, setErrors] = useState({}); // Manejo de errores de validación
  const [showPassword, setShowPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 
  const [estados, setEstados] = useState([]); 
  const [tamanios, setTamanios] = useState([]);
  const [sectores, setSectores] = useState([]);

  // Estado global para los valores del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    email: '',
    password: '',
    confirmarPassword: '',
    fechaCreacion: '',
    telefono: '',
    estado: '',
    direccion: '',
    logo: null,
    rfc: '',
  });

  useEffect(() => {
    // Función para obtener datos del backend
    const fetchData = async () => {
      try {
        // Fetch para obtener estados
        const estadosResponse = await fetch('https://www.codemx.net/codemx/backend/config/obtener_estados.php');
        if (!estadosResponse.ok) {
          throw new Error('Error al obtener los estados');
        }
        const estadosData = await estadosResponse.json();
  
        // Fetch para obtener tamaños
        const tamaniosResponse = await fetch('https://www.codemx.net/codemx/backend/config/obtener_tamanios.php');
        if (!tamaniosResponse.ok) {
          throw new Error('Error al obtener los tamaños');
        }
        const tamaniosData = await tamaniosResponse.json();

        // Fetch para obtener sectores
        const sectoresResponse = await fetch('https://www.codemx.net/codemx/backend/config/obtener_sectores.php');
        if (!sectoresResponse.ok) {
          throw new Error('Error al obtener los tamaños');
        }
        const sectoresData = await sectoresResponse.json();
  
        // Actualizar estados
        setEstados(estadosData);
        setTamanios(tamaniosData);
        setSectores(sectoresData);
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    };
  
    fetchData();
  }, []);


  const visibilidadPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const visibilidadConfirmarPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const manejarValorInput = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'file' ? files[0] : value,
    });
  };

  const avanzarPaso = async () => {
    const isValid = await validarPaso(step); // Espera el resultado de la validación
    if (!isValid) {
      return; // Detener si hay errores
    }
    if (step === 2) { // Último paso: enviar datos
      try {
        const formDataToSend = new FormData();
  
        // Añadir cada campo del formulario a FormData
        Object.keys(formData).forEach((key) => {
          formDataToSend.append(key, formData[key]);
        });
  
        const response = await fetch('/login-crearcuenta/CrearCuentaEmpresa.php', {
          method: 'POST',
          body: formDataToSend,
        });
  
        if (!response.ok) {
          throw new Error('Error al enviar los datos al servidor');
        }
  
        const result = await response.json();
  
        if (result.success) {
          alert('Registro exitoso');
          if (onRegistroCompleto) onRegistroCompleto(formData.email);
        } else {
          alert(result.error || 'Hubo un error al registrar');
        }
      } catch (error) {
        alert('Hubo un error al enviar los datos.');
      }
    } else {
      setStep((prev) => prev + 1); // Avanzar al siguiente paso
    }
  };
  
  
  const retrocederPaso = () => setStep((prev) => Math.max(prev - 1, 1));

  const verificarEmail = async (email) => {
    try {
      const response = await fetch('https://www.codemx.net/codemx/backend/config/verificar_email.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email }),
      });
  
      const result = await response.json();
      if (!result.success) {
        return result.error; // Retorna el error si el correo está registrado
      }
      return null; // Retorna null si no hay errores
    } catch (error) {
      console.error('Error al verificar el correo:', error);
      return 'Error de conexión con el servidor';
    }
  };

  const validarPaso = async (currentStep) => {
    const stepErrors = {};
  
    // Validar inputs y selects obligatorios del DOM
    const form = document.querySelector(`form[data-step="${currentStep}"]`);
    if (!form) return false;
  
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach((input) => {
      if (input.hasAttribute('required') && !input.value.trim()) {
        stepErrors[input.id] = 'Este campo es obligatorio';
      }
    });
  
    // Validar texto de descripción
    const descripcion = form.querySelector('#descripcion');
    if (descripcion && descripcion.value.trim() === '') {
      stepErrors['descripcion'] = 'Este campo es obligatorio';
    }
  
    if (currentStep === 1) {
      // Validar correo electrónico
      const email = formData.email.trim();
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (email && !emailRegex.test(email)) {
        stepErrors['email'] = 'Ingresa un formato de correo electrónico válido';
      } else {
        const emailError = await verificarEmail(email);
        if (emailError) {
          stepErrors['email'] = emailError;
        }
      }
  
      // Validar número de teléfono
      const telefono = formData.telefono.trim();
      const telefonoRegex = /^[0-9]{10}$/; // 10 dígitos numéricos
      if (telefono && !telefonoRegex.test(telefono)) {
        stepErrors['telefono'] = 'El número de teléfono debe tener 10 dígitos numéricos';
      }
  
      // Validar contraseña
      const password = formData.password.trim();
      const confirmarPassword = formData.confirmarPassword.trim();
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
      if (password && !passwordRegex.test(password)) {
        stepErrors['password'] =
          'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas y minúsculas';
      }
  
      // Verificar que las contraseñas coincidan
      if (password !== confirmarPassword) {
        stepErrors['confirmarPassword'] = 'Las contraseñas no coinciden';
      }

      // Validar fecha de creación
      const fechaCreacion = formData.fechaCreacion.trim();
      const today = new Date().toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD
      if (fechaCreacion && fechaCreacion > today) {
        stepErrors['fechaCreacion'] = 'La fecha de creación no puede ser mayor al día de hoy';
      }
    }
  
    if (currentStep === 2) {
      // Validar RFC
      const rfc = formData.rfc.trim();
      const rfcRegex = /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
      if (!rfcRegex.test(rfc)) {
        stepErrors['rfc'] = 'El RFC ingresado no es válido. Debe tener el formato: EXT990101NI1';
      }
    }
  
    setErrors(stepErrors);

    return Object.keys(stepErrors).length === 0;
  };

  return (
    <div className="contenedor-crear-cuenta container py-5">
      <h3 className="titulo-form text-center">Diseña tu perfil de Empresa</h3>

      {/* Render condicional basado en el paso */}
      {step === 1 && <Paso1 errors={errors} formData={formData} manejarValorInput={manejarValorInput} visibilidadPassword={visibilidadPassword} visibilidadConfirmarPassword={visibilidadConfirmarPassword} showPassword={showPassword} showConfirmPassword={showConfirmPassword} estados={estados} tamanios={tamanios} sectores={sectores}/>}
      {step === 2 && <Paso2 errors={errors} formData={formData} manejarValorInput={manejarValorInput}/>}

      {/* Botones de navegación */}
      <div className="d-flex justify-content-between mt-4">
        {step > 1 && (
          <button className="btn-tipouno btn" onClick={retrocederPaso}>
            Anterior
          </button>
        )}
        <button className="btn-tipodos btn" onClick={avanzarPaso}>
          {step === 2 ? 'Enviar' : 'Siguiente'}
        </button>
      </div>
    </div>
  );
};

const Paso1 = ({ errors, formData, manejarValorInput, visibilidadPassword, visibilidadConfirmarPassword, showPassword, showConfirmPassword, estados, tamanios, sectores }) => (
  <form className="form-crearcuenta" data-step="1">

    <div className="mb-3">
      <label htmlFor="nombre" className="form-label">Nombre <span className="text-danger">*</span></label>
      <input type="text" id="nombre" name="nombre" className="form-control" value={formData.nombre} onChange={manejarValorInput} required/>
      {errors.nombre && <small className="text-danger">{errors.nombre}</small>}
    </div>

    <div className="mb-3">
      <label htmlFor="descripcion" className="form-label">Descripcion <span className="text-danger">*</span></label>
      <textarea id="descripcion" name="descripcion" className="form-control" value={formData.descripcion} onChange={manejarValorInput} required/>
      {errors.descripcion && <small className="text-danger">{errors.descripcion}</small>}
    </div>

    <div className="mb-3">
      <label htmlFor="email" className="form-label">Correo Electronico <span className="text-danger">*</span></label>
      <input type="text" id="email" name="email" className="form-control" value={formData.email} onChange={manejarValorInput} required/>
      {errors.email && <small className="text-danger">{errors.email}</small>}
    </div>

    <div className="mb-3">
      <label htmlFor="password" className="form-label">Contraseña <span className="text-danger">*</span></label>
      <input type={showPassword ? "text" : "password"} id="password" name="password" className="form-control" value={formData.password} onChange={manejarValorInput} required/>
      <span className="input-group-text" onClick={visibilidadPassword}>
        <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
      </span>
      {errors.password && <small className="text-danger">{errors.password}</small>}
    </div>

    <div className="mb-3">
      <label htmlFor="confirmarPassword" className="form-label">Confirmar contraseña <span className="text-danger">*</span></label>
      <input type={showConfirmPassword ? "text" : "password"} id="confirmarPassword" name="confirmarPassword" className="form-control" value={formData.confirmarPassword} onChange={manejarValorInput} required/>
      <span className="input-group-text" onClick={visibilidadConfirmarPassword}>
        <i className={showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
      </span>
      {errors.confirmarPassword && <small className="text-danger">{errors.confirmarPassword}</small>}
    </div>

    <div className="mb-3">
      <label htmlFor="fechaCreacion" className="form-label">Fecha de Creación <span className="text-danger">*</span></label>
      <input type="date" id="fechaCreacion" name="fechaCreacion" className="form-control" value={formData.fechaCreacion} onChange={manejarValorInput} required/>
      {errors.fechaCreacion && <small className="text-danger">{errors.fechaCreacion}</small>}
    </div>

    <div className="mb-3">
      <label htmlFor="sector" className="form-label">Sector <span className="text-danger">*</span></label>
      <select id="sector" name="sector" className="form-select form-select-lg custom-font-select" value={formData.sector} onChange={manejarValorInput} required>
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
      <select id="tamanio" name="tamanio" className="form-select form-select-lg custom-font-select" value={formData.tamanio} onChange={manejarValorInput} required>
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
      <input type="text" id="telefono" name="telefono" className="form-control" value={formData.telefono} onChange={manejarValorInput} required/>
      {errors.telefono && <small className="text-danger">{errors.telefono}</small>}
    </div>

    <div className="mb-3">
      <label htmlFor="estado" className="form-label">Estado <span className="text-danger">*</span></label>
      <select id="estado" name="estado" className="form-select form-select-lg custom-font-select" value={formData.estado} onChange={manejarValorInput} required>
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
      <input type="tel" id="direccion" name="direccion" className="form-control" value={formData.direccion} onChange={manejarValorInput} required/>
      {errors.direccion && <small className="text-danger">{errors.direccion}</small>}
    </div>

    <div className="mb-3">
      <label htmlFor="logo" className="form-label">Subir foto de perfil</label>
      <input type="file" id="logo" name="logo" className="form-control" accept=".jpg, .jpeg, .png" onChange={manejarValorInput} />
      {formData.logo && (
        <small className="text-muted">
          Archivo seleccionado: {formData.logo.name}
        </small>
      )}
      {errors.logo && <small className="text-danger">{errors.logo}</small>}
    </div>

  </form>
);

const Paso2 = ({ errors, formData, manejarValorInput }) => (
  <form className="form-crearcuenta" data-step="2">

    <div className="text-center">
      <p className="info-text">
        Por motivos de seguridad y para garantizar la veracidad de la información en la plataforma, se requiere un RFC válido para verificar la autenticidad de la empresa registrada. Este RFC será utilizado únicamente para comprobar que existe y coincide con los datos proporcionados de la empresa. La verificación se realizará manualmente a través de la plataforma del SAT. 
        Puede consultar más detalles en el siguiente enlace:&nbsp;
        <a 
          href="https://www.sat.gob.mx/aplicacion/operacion/29073/verifica-si-estas-registrado-en-el-rfc" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          Verifica tu RFC en el SAT
        </a>.
      </p>
    </div>

    <div className="mb-3">
      <label htmlFor="rfc" className="form-label">RFC <span className="text-danger">*</span></label>
      <input type="text" id="rfc" name="rfc" className="form-control" value={formData.rfc} onChange={manejarValorInput} required />
      {errors.rfc && <small className="text-danger">{errors.rfc}</small>}
    </div>
  </form>
);
