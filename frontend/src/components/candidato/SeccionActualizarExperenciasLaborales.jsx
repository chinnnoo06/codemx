import React, { useState } from 'react';

export const SeccionActualizarExperenciasLaborales = ({ candidato, manejarMostrarSeccion, experienciasIniciales, actualizarExperiencias }) => {

    const [experiencias, setExperiencias] = useState(
        experienciasIniciales.map((exp) => ({
            id: exp.experiencia.ID || null, // ID de la experiencia
            empresa: exp.experiencia.Empresa,
            tiempo: exp.experiencia.Duracion,
            proyectos: exp.proyectos.map((proj) => ({
            id: proj.ID || null, // ID del proyecto
            nombre: proj.Nombre,
            descripcion: proj.Descripcion,
            })),
        }))
        );
    const [errors, setErrors] = useState({});
    
    const manejarCambioExperiencia = (index, field, value) => {
        const nuevasExperiencias = [...experiencias];
        nuevasExperiencias[index][field] = value;
        setExperiencias(nuevasExperiencias);

        const nuevosErrores = { ...errors };
        if (value.trim() !== '') {
          delete nuevosErrores[`experiencia-${index}-${field}`];
        }
        setErrors(nuevosErrores);
    };

    const manejarCambioProyecto = (expIndex, projIndex, field, value) => {
        const nuevasExperiencias = [...experiencias];
        nuevasExperiencias[expIndex].proyectos[projIndex][field] = value;
        setExperiencias(nuevasExperiencias);

        const nuevosErrores = { ...errors };
        if (value.trim() !== '') {
          delete nuevosErrores[`proyecto-${expIndex}-${projIndex}-${field}`];
        }
        setErrors(nuevosErrores);
    };

    const agregarExperiencia = () => {
        setExperiencias([...experiencias, { empresa: '', tiempo: '', proyectos: [{ nombre: '', descripcion: '' }] }]);
    };

    const eliminarExperiencia = (index) => {
        const nuevasExperiencias = experiencias.filter((_, i) => i !== index);
        setExperiencias(nuevasExperiencias);
    };

    const agregarProyecto = (index) => {
        const nuevasExperiencias = [...experiencias];
        nuevasExperiencias[index].proyectos.push({ nombre: '', descripcion: '' });
        setExperiencias(nuevasExperiencias);
    };

    const eliminarProyecto = (expIndex, projIndex) => {
        const nuevasExperiencias = [...experiencias];
        nuevasExperiencias[expIndex].proyectos = nuevasExperiencias[expIndex].proyectos.filter((_, i) => i !== projIndex);
        setExperiencias(nuevasExperiencias);
    };

    const validarCampos = () => {
        const nuevosErrores = {};
    
        // Validar experiencias
            experiencias.forEach((exp, expIndex) => {
            if (!exp.empresa.trim()) {
                nuevosErrores[`experiencia-${expIndex}-empresa`] = 'Este campo es obligatorio.';
            }
            // Validar que el tiempo sea un número y esté lleno
            if (!exp.tiempo.trim()) {
                nuevosErrores[`experiencia-${expIndex}-tiempo`] = 'Este campo es obligatorio.';
            } 
        
            // Validar proyectos de cada experiencia
            exp.proyectos.forEach((proj, projIndex) => {
                if (!proj.nombre.trim()) {
                nuevosErrores[`proyecto-${expIndex}-${projIndex}-nombre`] = 'Este campo es obligatorio.';
                }
                if (!proj.descripcion.trim()) {
                nuevosErrores[`proyecto-${expIndex}-${projIndex}-descripcion`] = 'Este campo es obligatorio.';
                }
            });
        });
    
        setErrors(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0; // Devuelve true si no hay errores
    };

    const manejarGuardar = async () => {
        if (!validarCampos()) {
            return;
          }
        try {
        const payload = {
            idCandidato: candidato.id,
            experiencias,
        };
    
        console.log('Datos enviados al servidor:', payload);
    
        const response = await fetch(
            'https://www.codemx.net/codemx/backend/candidato/actualizar_experencias_proyectos.php',
            {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            }
        );
    
        const result = await response.json();
    
        if (result.success) {
            actualizarExperiencias(experiencias); // Actualiza el estado global
        } else {
            alert('Error al actualizar las experiencias.');
        }
        } catch (error) {
        console.error('Error al guardar las experiencias:', error);
        alert('Error al guardar las experiencias.');
        }
    
        manejarMostrarSeccion("Ver-Experencias");
    };


    return (
        <div>
        <div className="d-flex justify-content-between align-items-center">
            <h2 className="text-center mb-2">Editar Experiencia Laboral</h2>
        </div>

        {experiencias.map((exp, expIndex) => (
            <div key={expIndex} className="card mb-4 shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="experencia-titulo">Experiencia #{expIndex + 1}</h5>
                {expIndex > 0 && (
                <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => eliminarExperiencia(expIndex)}
                >
                    Eliminar Experiencia
                </button>
                )}
            </div>

            <div className="card-body">
                <div className="mb-2">
                    <h5 className="titulos">Empresa</h5>
                    <input
                        type="text"
                        className="form-control"
                        value={exp.empresa}
                        onChange={(e) => manejarCambioExperiencia(expIndex, 'empresa', e.target.value)}
                        required
                    />
                    {errors[`experiencia-${expIndex}-empresa`] && (
                        <span className="text-danger">{errors[`experiencia-${expIndex}-empresa`]}</span>
                    )}
                </div>
                <div className="mb-3">
                    <h5 className="titulos">Tiempo trabajado (en meses)</h5>
                    <input
                        type="number"
                        className="form-control"
                        value={exp.tiempo}
                        onChange={(e) => manejarCambioExperiencia(expIndex, 'tiempo', e.target.value)}
                        required
                    />
                    {errors[`experiencia-${expIndex}-tiempo`] && (
                        <span className="text-danger">{errors[`experiencia-${expIndex}-tiempo`]}</span>
                    )}
                </div>

                <h5 className="titulos">Proyectos</h5>
                {exp.proyectos.map((proj, projIndex) => (
                <div key={projIndex} className="mb-3 border p-2">
                    <div className="d-flex justify-content-between align-items-center">
                    <h6 className="num-proyecto">Proyecto #{projIndex + 1}</h6>
                    {projIndex > 0 && (
                        <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => eliminarProyecto(expIndex, projIndex)}
                        >
                        Eliminar Proyecto
                        </button>
                    )}
                    </div>
                    <div className="mb-2">
                    <label className="form-label">Nombre del Proyecto</label>
                    <input
                        type="text"
                        className="form-control"
                        value={proj.nombre}
                        onChange={(e) => manejarCambioProyecto(expIndex, projIndex, 'nombre', e.target.value)}
                        required
                    />
                        {errors[`proyecto-${expIndex}-${projIndex}-nombre`] && (
                            <span className="text-danger">{errors[`proyecto-${expIndex}-${projIndex}-nombre`]}</span>
                        )}
                    </div>
                    <div className="mb-2">
                    <label className="form-label">Descripción del Proyecto</label>
                    <textarea
                        className="form-control"
                        value={proj.descripcion}
                        onChange={(e) => manejarCambioProyecto(expIndex, projIndex, 'descripcion', e.target.value)}
                        required
                    />
                        {errors[`proyecto-${expIndex}-${projIndex}-descripcion`] && (
                            <span className="text-danger">{errors[`proyecto-${expIndex}-${projIndex}-descripcion`]}</span>
                        )}
                    </div>
                </div>
                ))}
                <button
                type="button"
                className="btn btn-tipodos btn-sm"
                onClick={() => agregarProyecto(expIndex)}
                >
                Agregar Proyecto
                </button>
            </div>
            </div>
        ))}

        <div className="d-flex justify-content-between">
            <button
            type="button"
            className="btn btn-tipodos btn-sm"
            onClick={agregarExperiencia}
            >
            Agregar Experiencia Laboral
            </button>
            <button
                type="button"
                className="btn btn-tipouno btn-sm"
                onClick={() => manejarGuardar()}
                >
                Guardar Cambios
            </button>
        </div>
        </div>
    );
};
