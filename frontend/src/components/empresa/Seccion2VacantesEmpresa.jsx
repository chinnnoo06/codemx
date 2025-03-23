import React, { useState, useEffect } from 'react';
import { SeccionTecnologiasRequeridasDominadas } from '../login-crearcuenta-recuperar/SeccionTecnologiasRequeridasDominadas.jsx';


export const Seccion2VacantesEmpresa = ({empresa, manejarOcultarSeccion, fetchData}) => {
    const [estados, setEstados] = useState([]);
    const [tecnologias, setTecnologias] = useState([]); 
    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        estado: '',
        ubicacion: '',
        fechaLimite: '',
        modalidad: '',
    });
    const [responsabilidades, setResponsabilidades] = useState(['']);
    const [requerimientos, setRequerimientos] = useState(['']);
    const [tecnologiasRequeridas, setTecnologiasRequeridas] = useState(['']);
    const [errors, setErrors] = useState({}); 
    const [isLoading, setIsLoading] = useState(false); 
    const [seccionActiva, setSeccionActiva] = useState("form");

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

            const tecnologiasResponse = await fetch('https://www.codemx.net/codemx/backend/config/obtener_tecnologias.php');
            if (!tecnologiasResponse.ok) {
              throw new Error('Error al obtener las tecnologias');
            }
            const tecnologiasData = await tecnologiasResponse.json();

            // Actualizar estados
            setEstados(estadosData);
            setTecnologias(tecnologiasData);
        } catch (error) {
            console.error('Error al obtener los datos:', error);
        }
        };
    
        fetchData();
    }, []);

    const manejarValorInput = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
          });
    };


    const handleResponsabilidadChange = (e, index) => {
        const updated = [...responsabilidades];
        updated[index] = e.target.value;
        setResponsabilidades(updated);
    };

    const agregarResponsabilidad = () => {
        setResponsabilidades([...responsabilidades, '']);
    };

    const eliminarResponsabilidad = () => {
        setResponsabilidades(prev => prev.slice(0, -1));
    };

    const handleRequerimientoChange = (e, index) => {
        const updated = [...requerimientos];
        updated[index] = e.target.value;
        setRequerimientos(updated);
    };

    const agregarRequerimiento = () => {
        setRequerimientos([...requerimientos, '']);
    };

    const eliminarRequerimiento = () => {
        setRequerimientos(prev => prev.slice(0, -1));
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

        // Validar fecha de creación
        const fechaLimite = formData.fechaLimite.trim();
        const today = new Date().toISOString().split('T')[0]; 
        if (fechaLimite && fechaLimite < today) {
        stepErrors['fechaLimite'] = 'La fecha de limite no puede ser menor al día de hoy';
        }

        // Validación de responsabilidades
        responsabilidades.forEach((resp, index) => {
            if (!resp.trim()) {
                stepErrors[`responsabilidad-${index}`] = 'Este campo es obligatorio';
            }
        });

        // Validación de requerimientos
        requerimientos.forEach((req, index) => {
            if (!req.trim()) {
                stepErrors[`requerimiento-${index}`] = 'Este campo es obligatorio';
            }
        });

        if(tecnologiasRequeridas < 1){
            stepErrors[`tecnologias`] = 'Este campo es obligatorio';
        }

        setErrors(stepErrors);

        return Object.keys(stepErrors).length === 0;
    };

    const enviarVacante = async (e) => {
                
        e.preventDefault();
        if (isLoading) return;

        const isValid = validarCampos();

        if (!isValid) {
            setIsLoading(false);
            return; 
        }
    
        setIsLoading(true);

        try {
            const formDataToSend = new FormData();

            Object.keys(formData).forEach((key) => {
                formDataToSend.append(key, formData[key]);
            });

            // Agregar el id de la empresa
            formDataToSend.append('empresa_id', empresa.id);
            // Agregar responsabilidades y requerimientos como cadenas JSON
            formDataToSend.append('responsabilidades', JSON.stringify(responsabilidades));
            formDataToSend.append('requerimientos', JSON.stringify(requerimientos));
            //Agregar tecnologias requeridad al formdata para enviar
            const tecnologiasFiltradas = tecnologiasRequeridas.filter(tecnologia => tecnologia.trim() !== '');
            formDataToSend.append('tecnologias', JSON.stringify(tecnologiasFiltradas));

            console.log("Enviando datos:", Object.fromEntries(formDataToSend));
      
            const response = await fetch('https://www.codemx.net/codemx/backend/empresa/agregar_vacante_empresa.php', {
              method: 'POST',
              body: formDataToSend,
            });

            if (!response.ok) {
                throw new Error('Error al enviar los datos al servidor');
              }
        
            const result = await response.json();

            if (result.success) {
                fetchData();
                manejarOcultarSeccion();
            } else {
                alert(result.error || 'Hubo un error al actualizar.');
            }
        } catch (error) {
            console.error('Error al actualizar:', error);
            alert('Hubo un error al enviar los datos.');
        } finally {
            setIsLoading(false);
        }
    };

    const manejarCambioTecnologias = (seleccionadas) => {
        setTecnologiasRequeridas(seleccionadas);
        setSeccionActiva("form"); 
    };

  return (
    <>
        {seccionActiva === "form" && (
            <form className="form " onSubmit={enviarVacante} noValidate>
                <div className='header-agregar-vacante d-flex align-items-center mb-3'>

                    <h2 className="mx-auto text-center titulo-header">Agregar Vacante</h2>
                </div>
                

                <div className="mb-4">
                    <label htmlFor="titulo" className="form-label">Título de la Vacante <span className="text-danger">*</span></label>
                    <input type="text" id="titulo" name="titulo" className="form-control" maxLength={50} value={formData.titulo} onChange={manejarValorInput} required/>
                    {errors.titulo && <small className="text-danger">{errors.titulo}</small>}
                </div>

                <div className="mb-4">
                    <label htmlFor="descripcion" className="form-label">Descripción <span className="text-danger">*</span></label>
                    <textarea id="descripcion" name="descripcion" className="form-control" maxLength={250}  value={formData.descripcion} onChange={manejarValorInput}required></textarea>
                    {errors.descripcion && <small className="text-danger">{errors.descripcion}</small>}
                </div>

                <div className="row">
                    <div className="col-md-6 mb-4">
                        <label className="form-label">Responsabilidades <span className="text-danger">*</span></label>
                        {responsabilidades.map((resp, index) => (
                            <div key={index} className="mb-2">
                            <input 
                                type="text" 
                                name={`responsabilidad-${index}`} 
                                className="form-control" 
                                maxLength={50} 
                                value={resp} 
                                onChange={(e) => handleResponsabilidadChange(e, index)} 
                                required
                            />
                            {errors[`responsabilidad-${index}`] && <small className="text-danger">{errors[`responsabilidad-${index}`]}</small>}
                            </div>
                        ))}
                        <div className='botones-requerimientos-responsabilidades d-flex justify-content-between '>
                            <button type="button" className="btn-sumar-restar" onClick={agregarResponsabilidad}>
                                <i className="fa-solid fa-plus"></i>
                            </button>
                            {responsabilidades.length > 1 &&(
                                <button type="button" className="btn-sumar-restar"  onClick={() => eliminarResponsabilidad()}>
                                    <i className="fas fa-minus"></i>
                                </button>
                            )}

                        </div>
                    </div>

                    <div className="col-md-6 mb-4">
                        <label className="form-label">Requerimientos <span className="text-danger">*</span></label>
                        {requerimientos.map((req, index) => (
                            <div key={index} className="mb-2">
                            <input 
                                type="text" 
                                name={`requerimiento-${index}`} 
                                className="form-control" 
                                maxLength={50} 
                                value={req} 
                                onChange={(e) => handleRequerimientoChange(e, index)} 
                                required
                            />
                            {errors[`requerimiento-${index}`] && <small className="text-danger">{errors[`requerimiento-${index}`]}</small>}
                            </div>
                        ))}
                        <div className='botones-requerimientos-responsabilidades d-flex justify-content-between '>
                            <button type="button" className="btn-sumar-restar" onClick={agregarRequerimiento}>
                                <i className="fa-solid fa-plus"></i>
                            </button>
                            {requerimientos.length > 1 && (
                                <button type="button" className="btn-sumar-restar" onClick={eliminarRequerimiento}>
                                    <i className="fas fa-minus"></i>
                                </button>
                            )}
                        </div>

                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-4">
                        <label htmlFor="estado" className="form-label">Estado <span className="text-danger">*</span></label>
                        <select id="estado" name="estado" className="form-select custom-font-select"  value={formData.estado} onChange={manejarValorInput} required>
                            <option value="">Seleccione un estado</option>
                            {estados.map((estado) => (
                                <option key={estado.id} value={estado.id}>{estado.nombre}</option>
                            ))}
                        </select>
                        {errors.estado && <small className="text-danger">{errors.estado}</small>}
                    </div>
                    <div className="col-md-6 mb-4">
                        <label htmlFor="ubicacion" className="form-label">Ubicación <span className="text-danger">*</span></label>
                        <input type="text" id="ubicacion" name="ubicacion" className="form-control" maxLength={70}  value={formData.ubicacion} onChange={manejarValorInput} required/>
                        {errors.ubicacion && <small className="text-danger">{errors.ubicacion}</small>}
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-4">
                        <label htmlFor="fechaLimite" className="form-label">Fecha Límite <span className="text-danger">*</span></label>
                        <input type="date" id="fechaLimite" name="fechaLimite" className="form-control"  value={formData.fechaLimite} onChange={manejarValorInput} required/>
                        {errors.fechaLimite && <small className="text-danger">{errors.fechaLimite}</small>}
                    </div>
                    <div className="col-md-6 mb-4">
                        <label htmlFor="fechaLimite" className="form-label">Modalidad <span className="text-danger">*</span></label>
                        <select id="modalidad" name="modalidad" className="form-select custom-font-select"  value={formData.modalidad} onChange={manejarValorInput} required>
                            <option value="">Seleccione una modalidad</option>
                            <option value="1">Presencial</option>
                            <option value="2">Remota</option>
                            <option value="3">Híbrido</option>
                        </select>
                        {errors.modalidad && <small className="text-danger">{errors.modalidad}</small>}
                    </div>
                </div>

                <div className="mb-4">
                    <label htmlFor="tecnologias" className="form-label">Tecnologías Requeridas <span className="text-danger">*</span></label>
                    
                    {tecnologiasRequeridas.length > 1 ? (
                        <div className='mostrar-tecnologias p-3'>
                            <div className="d-flex flex-wrap gap-2">
                                {tecnologiasRequeridas.map((id) => {
                                    const tecnologia = tecnologias.find(t => t.id === id);
                                    return tecnologia ? (
                                        <button key={id} className="btn-tecnologia">{tecnologia.tecnologia}</button>
                                    ) : null;
                                })}
                            </div>
                            <button type="button" className="btn btn-tipodos  mt-2" onClick={() => setSeccionActiva("seleccionar-tecnologias")}>
                                Editar tecnologías
                            </button>
                        </div>
                    ) : (
                        <div className='mostrar-tecnologias p-3 text-center'>
                            <span onClick={() => setSeccionActiva("seleccionar-tecnologias")}>
                                Agregar tecnologías
                            </span>
                        </div>
                    )}
                    {errors.tecnologias && <small className="text-danger">{errors.tecnologias}</small>}
                </div>

                <div className="d-flex justify-content-between mb-4">
                    <button className="btn btn-cancelar-vacante" onClick={manejarOcultarSeccion}>Cancelar</button>
                    <button type="submit" className="btn btn-publicar-vacante">
                        {isLoading ? 'Cargando...' : 'Publicar Vacante'}
                    </button>
                </div>
            </form>
        )}

        {seccionActiva === "seleccionar-tecnologias" && (
            
            <form className="form" data-step="3">
        
                <SeccionTecnologiasRequeridasDominadas
                tecnologias={tecnologias}
                seleccionadas={tecnologiasRequeridas}
                onSeleccionChange={manejarCambioTecnologias}
                tecnologiasVacante={1}
                />


            </form>
        )}
  
    </>

  )
}
