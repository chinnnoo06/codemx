import React, { useState, useEffect } from 'react';
import '../../styles/login-crearcuenta-recuperar/form.css';

export const SeccionFormEmpresa = ({ onRegistroCompleto }) => {
  const [step, setStep] = useState(1); // Controla el paso actual del formulario
  const [errors, setErrors] = useState({}); // Manejo de errores de validación
  const [showPassword, setShowPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); 
  const [tamanios, setTamanios] = useState([]);
  const [sectores, setSectores] = useState([]);
  const [isLoading, setIsLoading] = useState(false); 
  const apiUrl = process.env.REACT_APP_API_URL;
  const [showModalTerminos, setShowModalTerminos] = useState(false);

  // Estado global para los valores del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    email: '',
    password: '',
    confirmarPassword: '',
    fechaCreacion: '',
    tamanio: '',
    sector: '',
    telefono: '',
    logo: null,
    rfc: '',
  });

  useEffect(() => {
    // Función para obtener datos del backend
    const fetchData = async () => {
      try {
  
        // Fetch para obtener tamaños
        const tamaniosResponse = await fetch(`${apiUrl}/config/obtener_tamanios.php`);
        if (!tamaniosResponse.ok) {
          throw new Error('Error al obtener los tamaños');
        }
        const tamaniosData = await tamaniosResponse.json();

        // Fetch para obtener sectores
        const sectoresResponse = await fetch(`${apiUrl}/config/obtener_sectores.php`);
        if (!sectoresResponse.ok) {
          throw new Error('Error al obtener los tamaños');
        }
        const sectoresData = await sectoresResponse.json();
  
        // Actualizar estados
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
    if (isLoading) return; 
    setIsLoading(true);

    const isValid = await validarPaso(step);
    if (!isValid) {
      setIsLoading(false);
      return;
    }

    if (step === 2) {
      setShowModalTerminos(true); // Mostrar modal para aceptar términos
      setIsLoading(false);
    } else {
      setStep((prev) => prev + 1);
      setIsLoading(false);
    }
  };

  const enviarFormulario = async () => {
    setShowModalTerminos(false);
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      const response = await fetch('https://www.codemx.net/codemx/backend/login-crearcuenta/CrearCuentaEmpresa.php', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) throw new Error('Error al enviar los datos al servidor');

      const result = await response.json();

      if (result.success) {
        if (onRegistroCompleto) onRegistroCompleto(formData.email);
      } else {
        alert(result.error || 'Hubo un error al registrar');
      }
    } catch (error) {
      alert('Hubo un error al enviar los datos.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const retrocederPaso = () => setStep((prev) => Math.max(prev - 1, 1));

  const verificarEmail = async (email) => {
    try {
        const response = await fetch('https://www.codemx.net/codemx/backend/config/verificar_email.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ email }), // Construir los datos para enviar
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
    } else if (descripcion && descripcion.value.trim().length < 100) {
      stepErrors['descripcion'] = 'La descripción debe tener al menos 100 caracteres';
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
    <div className="contenedor-form  container mb-5">
      <h3 className="titulo-form text-center">Diseña tu perfil de Empresa</h3>

      {/* Render condicional basado en el paso */}
      {step === 1 && <Paso1 errors={errors} formData={formData} manejarValorInput={manejarValorInput} visibilidadPassword={visibilidadPassword} visibilidadConfirmarPassword={visibilidadConfirmarPassword} showPassword={showPassword} showConfirmPassword={showConfirmPassword} tamanios={tamanios} sectores={sectores}/>}
      {step === 2 && <Paso2 errors={errors} formData={formData} manejarValorInput={manejarValorInput}/>}

      {/* Botones de navegación */}
      <div className="d-flex justify-content-between mt-4">
        {step > 1 && (
          <button className="btn-tipouno btn" onClick={retrocederPaso}>
            Anterior
          </button>
        )}
        <button className="btn-tipodos btn" onClick={avanzarPaso} disabled={isLoading}>
          {isLoading ? 'Enviando...' : step === 2 ? 'Enviar' : 'Siguiente'}
        </button>
      </div>

      {showModalTerminos && (
        <div className="modal-backdrop-custom d-flex align-items-center justify-content-center">
          <div className="modal-content-custom p-3 rounded shadow bg-white">
            <h4 className="mb-3 terminos-titulo">Términos y Condiciones para Empresas - CODEMX</h4>
            <div className="modal-body-custom mb-4" style={{ maxHeight: '300px', overflowY: 'auto'}}>
              <div className='texto'>
                <p>
                  En CODEMX valoramos la transparencia y la seguridad. Al aceptar estos términos, usted autoriza que la información proporcionada sobre su empresa, incluyendo nombre, descripción, sector, tamaño y datos de contacto, sea almacenada y usada para mostrar el perfil de su empresa en nuestra plataforma.
                </p>
                <p>
                  Esta información estará disponible para candidatos potenciales y otras empresas registradas en CODEMX, facilitando la creación de oportunidades de negocio y reclutamiento profesional.
                </p>
                <p>
                  Nos comprometemos a proteger sus datos conforme a la legislación vigente y no compartiremos información sensible con terceros sin su consentimiento, salvo requerimientos legales.
                </p>
                <p>
                  Usted tiene derecho a acceder, rectificar o solicitar la eliminación de sus datos en cualquier momento a través de los canales habilitados en la plataforma.
                </p>
                <p>
                  El uso de CODEMX implica la aceptación total de estos términos y condiciones. Si no está de acuerdo, le recomendamos no completar el registro.
                </p>
              </div>
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button
                className="btn btn-tipodos btn-sm"
                onClick={() => setShowModalTerminos(false)}
              >
                Cerrar
              </button>
              <button
                className="btn btn-tipouno btn-sm"
                onClick={enviarFormulario}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Paso1 = ({ errors, formData, manejarValorInput, visibilidadPassword, visibilidadConfirmarPassword, showPassword, showConfirmPassword, estados, tamanios, sectores }) => (
  <form className="form" data-step="1">

    <div className="mb-3">
      <label htmlFor="nombre" className="form-label">Nombre <span className="text-danger">*</span></label>
      <input type="text" id="nombre" name="nombre" className="form-control"  maxLength={50} value={formData.nombre} onChange={manejarValorInput} required/>
      {errors.nombre && <small className="text-danger">{errors.nombre}</small>}
    </div>

    <div className="mb-3">
      <label htmlFor="descripcion" className="form-label">Descripción <span className="text-danger">*</span></label>
      <textarea id="descripcion" name="descripcion" className="form-control" minLength={100} maxLength={250} value={formData.descripcion} onChange={manejarValorInput} required/>
      {errors.descripcion && <small className="text-danger">{errors.descripcion}</small>}
    </div>

    <div className="mb-3">
      <label htmlFor="email" className="form-label">Correo Electronico <span className="text-danger">*</span></label>
      <input type="text" id="email" name="email" className="form-control" maxLength={100} value={formData.email} onChange={manejarValorInput} required/>
      {errors.email && <small className="text-danger">{errors.email}</small>}
    </div>

    <div className="mb-3">
      <label htmlFor="password" className="form-label">Contraseña <span className="text-danger">*</span></label>
      <input type={showPassword ? "text" : "password"} id="password" name="password" className="form-control" maxLength={20} value={formData.password} onChange={manejarValorInput} required/>
      <span className="input-group-text" onClick={visibilidadPassword}>
        <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}></i>
      </span>
      {errors.password && <small className="text-danger">{errors.password}</small>}
    </div>

    <div className="mb-3">
      <label htmlFor="confirmarPassword" className="form-label">Confirmar contraseña <span className="text-danger">*</span></label>
      <input type={showConfirmPassword ? "text" : "password"} id="confirmarPassword" name="confirmarPassword" className="form-control" maxLength={20} value={formData.confirmarPassword} onChange={manejarValorInput} required/>
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
      <input type="text" id="telefono" name="telefono" className="form-control" maxLength={10} 
        onChange={(e) => {
          // Elimina espacios si los pegan
          const sinEspacios = e.target.value.replace(/\s/g, '');
          manejarValorInput({ target: { name: 'telefono', value: sinEspacios } });
        }}
        onKeyDown={(e) => {
          if (e.key === ' ') {
            e.preventDefault();
          }
        }}
        required
      />
      {errors.telefono && <small className="text-danger">{errors.telefono}</small>}
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
  <form className="form" data-step="2">

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
      <input type="text" id="rfc" name="rfc" className="form-control" maxLength={12} value={formData.rfc} onChange={manejarValorInput} required />
      {errors.rfc && <small className="text-danger">{errors.rfc}</small>}
    </div>
  </form>
);
