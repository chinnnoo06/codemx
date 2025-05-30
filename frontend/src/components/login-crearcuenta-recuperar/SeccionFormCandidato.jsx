import React, { useState, useEffect } from 'react';
import '../../styles/login-crearcuenta-recuperar/form.css';
import { SeccionTecnologiasRequeridasDominadas } from './SeccionTecnologiasRequeridasDominadas.jsx';

export const SeccionFormCandidato = ({ onRegistroCompleto }) => {
  
  const [step, setStep] = useState(1); // Controla el paso actual del formulario
  const [errors, setErrors] = useState({}); // Manejo de errores de validación
  const [showPassword, setShowPassword] = useState(false); 
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [estados, setEstados] = useState([]);
  const [sexos, setSexos] = useState([]); 
  const [tecnologias, setTecnologias] = useState([]); 
  const [modalidades, setModalidades] = useState([]); 
  const [universidades, setUniversidades] = useState([]); 
  const [isLoading, setIsLoading] = useState(false); 
  const apiUrl = process.env.REACT_APP_API_URL;
  const [showModalTerminos, setShowModalTerminos] = useState(false);


  // Estado global para los valores del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmarPassword: '',
    fechaNacimiento: '',
    telefono: '',
    estado: '',
    direccion: '',
    sexo: '',
    fotografia: null,
    universidad: '',
    tiempoRestante: '',
    modalidadTrabajo: '',
    curriculum: null,
    tecnologias: []
  });

   useEffect(() => {
      // Función para obtener datos del backend
      const fetchData = async () => {
        try {
          // Fetch para obtener estados
          
          const estadosResponse = await fetch(`${apiUrl}/config/obtener_estados.php`);
          if (!estadosResponse.ok) {
            throw new Error('Error al obtener los estados');
          }
          const estadosData = await estadosResponse.json();
    
          // Fetch para obtener sexos
          const sexosResponse = await fetch(`${apiUrl}/config/obtener_sexos.php`);
          if (!sexosResponse.ok) {
            throw new Error('Error al obtener los sexos');
          }
          const sexosData = await sexosResponse.json();

          // Fetch para obtener tecnologias
          const tecnologiasResponse = await fetch(`${apiUrl}/config/obtener_tecnologias.php`);
          if (!tecnologiasResponse.ok) {
            throw new Error('Error al obtener las tecnologias');
          }
          const tecnologiasData = await tecnologiasResponse.json();

          // Fetch para obtener modalidades de trabajo
          const modalidadesResponse = await fetch(`${apiUrl}/config/obtener_modalidades.php`);
          if (!modalidadesResponse.ok) {
            throw new Error('Error al obtener las modalidades de trabajo');
          }
          const modalidadesData = await modalidadesResponse.json();

          // Fetch para obtener universidades
          const universidadesResponse = await fetch(`${apiUrl}/config/obtener_universidades.php`);
          if (!universidadesResponse.ok) {
            throw new Error('Error al obtener las universidades');
          }
          const universidadesData = await universidadesResponse.json();
 
          // Actualizar estados
          setEstados(estadosData);
          setSexos(sexosData);
          setTecnologias(tecnologiasData);
          setModalidades(modalidadesData);
          setUniversidades(universidadesData);

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

    if (step === 3) {
      setShowModalTerminos(true);  // Mostrar modal y NO enviar aún
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
        if (key === "fotografia" || key === "curriculum") {
          formDataToSend.append(key, formData[key]);
        } else if (key === "tecnologias") {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch('https://www.codemx.net/codemx/backend/login-crearcuenta/CrearCuentaCandidato.php', {
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


  const retrocederPaso = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const verificarEmail = async (email) => {
    try {
        console.log("Correo enviado:", email); // Verificar el valor de email
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
  
    // Validar inputs y selects del formulario actual
    const form = document.querySelector(`form[data-step="${currentStep}"]`);
    if (!form) return false;
  
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach((input) => {
      if (input.hasAttribute('required') && !input.value.trim()) {
        stepErrors[input.id] = 'Este campo es obligatorio';
      }
    });
  
    // Validaciones específicas para cada paso
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
      const telefonoRegex = /^[0-9]{10}$/;
      if (telefono && !telefonoRegex.test(telefono)) {
        stepErrors['telefono'] = 'El número de teléfono debe tener 10 dígitos numéricos';
      }
  
      // Validar contraseñas
      const password = formData.password.trim();
      const confirmarPassword = formData.confirmarPassword.trim();
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
      if (password && !passwordRegex.test(password)) {
        stepErrors['password'] = 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas y minúsculas';
      }
      if (password !== confirmarPassword) {
        stepErrors['confirmarPassword'] = 'Las contraseñas no coinciden';
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
    }
  
    if (currentStep === 3) {
      // Validar tecnologías (si es requerido)
      const tecnologias = formData.tecnologias;
      if (!tecnologias || tecnologias.length === 0) {
        stepErrors['tecnologias'] = 'Debes seleccionar al menos una tecnología';
      }
    }
  
    setErrors(stepErrors);
  
    return Object.keys(stepErrors).length === 0;
  };
  

  return (
    <div className="contenedor-form container mb-5">
      <h3 className="titulo-form text-center mb-4">Diseña tu perfil de Candidato</h3>

      {/* Render condicional basado en el paso */}
      {step === 1 && <Paso1 errors={errors} formData={formData} manejarValorInput={manejarValorInput} visibilidadPassword={visibilidadPassword} visibilidadConfirmarPassword={visibilidadConfirmarPassword} showPassword={showPassword} showConfirmPassword={showConfirmPassword} estados={estados} sexos={sexos}/>}
      {step === 2 && <Paso2 errors={errors} formData={formData} manejarValorInput={manejarValorInput} modalidades={modalidades} universidades={universidades}/>}
      {step === 3 && <Paso3 errors={errors} formData={formData} manejarValorInput={manejarValorInput} tecnologias={tecnologias} />}

      {/* Botones de navegación */}
      <div className="d-flex justify-content-between mt-4">
        {step > 1 && (
          <button className="btn-tipouno btn" onClick={retrocederPaso}>
            Anterior
          </button>
        )}
        <button className="btn-tipodos btn" onClick={avanzarPaso} disabled={isLoading}>
          {isLoading ? 'Enviando...' : step === 3 ? 'Enviar' : 'Siguiente'}
        </button>
      </div>

     {showModalTerminos && (
      <div className="modal-backdrop-custom d-flex align-items-center justify-content-center">
        <div className="modal-content-custom p-3 rounded shadow bg-white">
          <h4 className="mb-3 terminos-titulo">Términos y Condiciones de CODEMX</h4>
          <div className="modal-body-custom mb-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <div className='texto'>
              <p>
                Bienvenido a CODEMX, la plataforma que conecta talento profesional con oportunidades laborales. Al aceptar estos términos, usted reconoce y autoriza que los datos personales y profesionales que proporcione serán utilizados para mostrar su perfil dentro de nuestra plataforma.
              </p>
              <p>
                Entendemos que su privacidad es fundamental. Por ello, sus datos serán tratados con estricta confidencialidad y únicamente serán accesibles para las empresas registradas en CODEMX que busquen candidatos adecuados para sus vacantes.
              </p>
              <p>
                Al aceptar, usted consiente que su información, incluyendo pero no limitada a nombre, experiencia laboral, habilidades y formación académica, pueda ser visualizada por dichas empresas para fines de evaluación y contacto profesional.
              </p>
              <p>
                CODEMX se compromete a no compartir su información con terceros ajenos a la plataforma sin su consentimiento explícito, salvo obligación legal. Usted tiene derecho a solicitar la actualización, corrección o eliminación de sus datos en cualquier momento.
              </p>
              <p>
                El uso de CODEMX implica la aceptación total de estos términos y condiciones. Si no está de acuerdo, le recomendamos no continuar con el registro en nuestra plataforma.
              </p>
            </div>

          </div>
          <div className="d-flex justify-content-end gap-2">
            <button
              onClick={() => setShowModalTerminos(false)}
              className="btn btn-tipodos btn-sm"
            >
              Cerrar
            </button>
            <button
              onClick={() => enviarFormulario()}
              className="btn btn-tipouno btn-sm"
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

const Paso1 = ({ errors, formData, manejarValorInput, visibilidadPassword, visibilidadConfirmarPassword, showPassword, showConfirmPassword, estados, sexos }) => (
  <form className="form" data-step="1">

    <div className="mb-3">
      <label htmlFor="nombre" className="form-label">Nombre <span className="text-danger">*</span></label>
      <input type="text" id="nombre" name="nombre" className="form-control" maxLength={50} value={formData.nombre} onChange={manejarValorInput} required/>
      {errors.nombre && <small className="text-danger">{errors.nombre}</small>}
    </div>

    <div className="mb-3">
      <label htmlFor="apellido" className="form-label">Apellido <span className="text-danger">*</span></label>
      <input type="text" id="apellido" name="apellido" className="form-control" maxLength={50} value={formData.apellido} onChange={manejarValorInput} required/>
      {errors.apellido && <small className="text-danger">{errors.apellido}</small>}
    </div>

    <div className="mb-3">
      <label htmlFor="email" className="form-label">Correo Electronico <span className="text-danger">*</span></label>
      <input type="email" id="email" name="email" className="form-control" maxLength={100} value={formData.email} onChange={manejarValorInput} required/>
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
      <label htmlFor="fechaNacimiento" className="form-label">Fecha de Nacimiento <span className="text-danger">*</span></label>
      <input type="date" id="fechaNacimiento" name="fechaNacimiento" className="form-control" value={formData.fechaNacimiento} onChange={manejarValorInput} required/>
      {errors.fechaNacimiento && <small className="text-danger">{errors.fechaNacimiento}</small>}
    </div>

    <div className="mb-3">
      <label htmlFor="telefono" className="form-label">Teléfono <span className="text-danger">*</span></label>
      <input type="tel" id="telefono" name="telefono" className="form-control" maxLength={10} value={formData.telefono}
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
      <input type="text" id="direccion" name="direccion" className="form-control"  maxLength={100} value={formData.direccion} onChange={manejarValorInput} required/>
      {errors.direccion && <small className="text-danger">{errors.direccion}</small>}
    </div>

    <div className="mb-3">
      <label htmlFor="sexo" className="form-label">Sexo <span className="text-danger">*</span></label>
      <select id="sexo" name="sexo" className="form-select form-select-lg custom-font-select" value={formData.sexo} onChange={manejarValorInput} required>
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
      <label htmlFor="fotografia" className="form-label">Subir foto de perfil</label>
      <input type="file" id="fotografia" name="fotografia" className="form-control" accept=".jpg, .jpeg, .png"  onChange={manejarValorInput} />
      {formData.fotografia && (
        <small className="text-muted">
          Archivo seleccionado: {formData.fotografia.name}
        </small>
      )}
      {errors.fotografia && <small className="text-danger">{errors.fotografia}</small>}
    </div>

  </form>
);

const Paso2 = ({ errors, formData, manejarValorInput, modalidades, universidades }) => (
  <form className="form" data-step="2">

    <div className="mb-3">
      <label htmlFor="universidad" className="form-label">
        Universidad donde estudiaste o donde sigues estudiando <span className="text-danger">*</span>
      </label>
      <select id="universidad" name="universidad" className="form-select form-select-lg custom-font-select" value={formData.universidad} onChange={manejarValorInput} required>
      <option value="">Seleccione una universidad</option>
          {universidades.map((universidad) => (
            <option key={universidad.id} value={universidad.id}>
              {universidad.nombre}
            </option>
          ))}
      </select>
      {errors.universidad && <small className="text-danger">{errors.universidad}</small>}
    </div>

    {formData.universidad !== "56" && (
      <div className="mb-3">
        <label htmlFor="tiempoRestante" className="form-label">Tiempo restante (aproximado) para terminar la universidad <span className="text-danger">*</span></label>
        <select id="tiempoRestante" name="tiempoRestante" className="form-select form-select-lg custom-font-select" value={formData.tiempoRestante} onChange={manejarValorInput} required>
          <option value="">Seleccione una opción</option>
          <option value="6 MESES">6 meses</option>
          <option value="1 AÑO">1 año</option>
          <option value="2 AÑOS">2 años</option>
          <option value="MAS DE 2 AÑOS">Más de 2 años</option>
          <option value="GRADUADO">Graduado</option>
        </select>
        {errors.tiempoRestante && <small className="text-danger">{errors.tiempoRestante}</small>}
      </div>
    )}

    <div className="mb-3">
      <label htmlFor="modalidadTrabajo" className="form-label">Modalidad de trabajo preferida <span className="text-danger">*</span></label>
      <select id="modalidadTrabajo" name="modalidadTrabajo" className="form-select form-select-lg custom-font-select" value={formData.modalidadTrabajo} onChange={manejarValorInput} required>
      <option value="">Seleccione una modalidad</option>
          {modalidades.map((modalidad) => (
            <option key={modalidad.id} value={modalidad.id}>
              {modalidad.modalidad}
            </option>
          ))}
      </select>
      {errors.modalidadTrabajo && <small className="text-danger">{errors.modalidadTrabajo}</small>}
    </div>

    <div className="mb-3">
      <label htmlFor="curriculum" className="form-label">Subir Currículum</label>
      <input type="file" id="curriculum" name="curriculum" className="form-control" accept=".pdf" onChange={manejarValorInput} />
      {formData.curriculum && (
        <small className="text-muted">
          Archivo seleccionado: {formData.curriculum.name}
        </small>
      )}
      {errors.curriculum && <small className="text-danger">{errors.curriculum}</small>}
    </div>

  </form>

);

const Paso3 = ({ errors, formData, manejarValorInput, tecnologias }) => {
  const manejarCambioTecnologias = (valor) => {
    manejarValorInput({ target: { name: 'tecnologias', value: valor } });
  };

  return (
    <form className="form" data-step="3">


      <SeccionTecnologiasRequeridasDominadas
        tecnologias={tecnologias}
        seleccionadas={formData.tecnologias}
        onSeleccionChange={manejarCambioTecnologias}
        esperarConfirmacion={false} 
      />

      {errors.tecnologias && <small className="text-danger">{errors.tecnologias}</small>}
    </form>
  );
};


