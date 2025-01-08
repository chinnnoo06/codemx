import React, { useState, useEffect } from 'react';
import '../../styles/login-crearcuenta-recuperar/form.css';
import { SeccionTecnologiasDominadas } from '../reutilizables/SeccionTecnologiasDominadas';

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
          const estadosResponse = await fetch('https://www.codemx.net/codemx/backend/config/obtener_estados.php');
          if (!estadosResponse.ok) {
            throw new Error('Error al obtener los estados');
          }
          const estadosData = await estadosResponse.json();
    
          // Fetch para obtener sexos
          const sexosResponse = await fetch('/config/obtener_sexos.php');
          if (!sexosResponse.ok) {
            throw new Error('Error al obtener los sexos');
          }
          const sexosData = await sexosResponse.json();

          // Fetch para obtener tecnologias
          const tecnologiasResponse = await fetch('https://www.codemx.net/codemx/backend/config/obtener_tecnologias.php');
          if (!tecnologiasResponse.ok) {
            throw new Error('Error al obtener las tecnologias');
          }
          const tecnologiasData = await tecnologiasResponse.json();

          // Fetch para obtener modalidades de trabajo
          const modalidadesResponse = await fetch('https://www.codemx.net/codemx/backend/config/obtener_modalidades.php');
          if (!modalidadesResponse.ok) {
            throw new Error('Error al obtener las modalidades de trabajo');
          }
          const modalidadesData = await modalidadesResponse.json();

          // Fetch para obtener universidades
          const universidadesResponse = await fetch('https://www.codemx.net/codemx/backend/config/obtener_universidades.php');
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
    const isValid = await validarPaso(step); // Espera el resultado de la validación
    if (!isValid) {
      return; 
    }
  
    if (step === 3) {
      try {
        const formDataToSend = new FormData();
  
        // Añadir cada campo del formulario a FormData
        Object.keys(formData).forEach((key) => {
          if (key === "fotografia" || key === "curriculum") {
            formDataToSend.append(key, formData[key]); // Añadir archivos
          } else if (key === "tecnologias") {
            // Convertir tecnologías a formato JSON
            formDataToSend.append(key, JSON.stringify(formData[key]));
          } else {
            formDataToSend.append(key, formData[key]);
          }
        });
  
        const response = await fetch('/login-crearcuenta/CrearCuentaCandidato.php', {
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

  const retrocederPaso = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const verificarEmail = async (email) => {
    try {
      const response = await fetch('/config/verificar_email.php', {
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
    <div className="contenedor-crear-cuenta container py-5">
      <h3 className="titulo-form text-center">Diseña tu perfil de Candidato</h3>

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
        <button className="btn-tipodos btn" onClick={avanzarPaso}>
          {step === 3 ? 'Enviar' : 'Siguiente'}
        </button>
      </div>
    </div>
  );
};

const Paso1 = ({ errors, formData, manejarValorInput, visibilidadPassword, visibilidadConfirmarPassword, showPassword, showConfirmPassword, estados, sexos }) => (
  <form className="form-crearcuenta" data-step="1">

    <div className="mb-3">
      <label htmlFor="nombre" className="form-label">Nombre <span className="text-danger">*</span></label>
      <input type="text" id="nombre" name="nombre" className="form-control" value={formData.nombre} onChange={manejarValorInput} required/>
      {errors.nombre && <small className="text-danger">{errors.nombre}</small>}
    </div>

    <div className="mb-3">
      <label htmlFor="apellido" className="form-label">Apellido <span className="text-danger">*</span></label>
      <input type="text" id="apellido" name="apellido" className="form-control" value={formData.apellido} onChange={manejarValorInput} required/>
      {errors.apellido && <small className="text-danger">{errors.apellido}</small>}
    </div>

    <div className="mb-3">
      <label htmlFor="email" className="form-label">Correo Electronico <span className="text-danger">*</span></label>
      <input type="email" id="email" name="email" className="form-control" value={formData.email} onChange={manejarValorInput} required/>
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
      <label htmlFor="fechaNacimiento" className="form-label">Fecha de Nacimiento <span className="text-danger">*</span></label>
      <input type="date" id="fechaNacimiento" name="fechaNacimiento" className="form-control" value={formData.fechaNacimiento} onChange={manejarValorInput} required/>
      {errors.fechaNacimiento && <small className="text-danger">{errors.fechaNacimiento}</small>}
    </div>

    <div className="mb-3">
      <label htmlFor="telefono" className="form-label">Teléfono <span className="text-danger">*</span></label>
      <input type="tel" id="telefono" name="telefono" className="form-control" value={formData.telefono} onChange={manejarValorInput} required/>
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
      <input type="text" id="direccion" name="direccion" className="form-control" value={formData.direccion} onChange={manejarValorInput} required/>
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
  <form className="form-crearcuenta" data-step="2">

    <div className="mb-3">
      <label htmlFor="universidad" className="form-label">
        Universidad donde estudiaste o donde sigues estudiando <span className="text-danger">*</span>
      </label>
      <select id="universidad" name="universidad" className="form-select form-select-lg custom-font-select" value={formData.universidad}
        onChange={(e) => {
          const { value } = e.target;
          manejarValorInput({
            target: {
              name: 'universidad',
              value: value === 'Otra' || value === 'No estudio' ? null : value,
            },
          });
        }}
        required
      >
        <option value="">Seleccione una universidad</option>
        {universidades.map((universidad) => (
          <option key={universidad.id} value={universidad.id}>
            {universidad.nombre}
          </option>
        ))}
        <option value="Otra">Otra</option>
        <option value="No estudio">No estudio</option>
      </select>
      {errors.universidad && <small className="text-danger">{errors.universidad}</small>}
    </div>

    {formData.universidad !== null && (
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
    <form className="form-crearcuenta" data-step="3">


      <SeccionTecnologiasDominadas
        tecnologias={tecnologias}
        seleccionadas={formData.tecnologias}
        onSeleccionChange={manejarCambioTecnologias}
      />

      {errors.tecnologias && <small className="text-danger">{errors.tecnologias}</small>}
    </form>
  );
};


