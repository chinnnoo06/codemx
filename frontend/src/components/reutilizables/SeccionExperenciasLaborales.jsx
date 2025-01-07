import React, { useState } from 'react';

export const SeccionExperenciasLaborales = ({ onExperienciasChange }) => {
    const [experiencias, setExperiencias] = useState([
    { empresa: '', tiempo: '', proyectos: [{ nombre: '', descripcion: '' }] },
    ]);

    const manejarCambioExperiencia = (index, field, value) => {
    const nuevasExperiencias = [...experiencias];
    nuevasExperiencias[index][field] = value;   
    setExperiencias(nuevasExperiencias);
    if (onExperienciasChange) onExperienciasChange(nuevasExperiencias);
    };

    const manejarCambioProyecto = (expIndex, projIndex, field, value) => {
    const nuevasExperiencias = [...experiencias];
    nuevasExperiencias[expIndex].proyectos[projIndex][field] = value;
    setExperiencias(nuevasExperiencias);
    if (onExperienciasChange) onExperienciasChange(nuevasExperiencias);
    };

    const agregarExperiencia = () => {
    setExperiencias([...experiencias, { empresa: '', tiempo: '', proyectos: [{ nombre: '', descripcion: '' }] }]);
    };

    const eliminarExperiencia = (index) => {
    const nuevasExperiencias = experiencias.filter((_, i) => i !== index);
    setExperiencias(nuevasExperiencias);
    if (onExperienciasChange) onExperienciasChange(nuevasExperiencias);
    };

    const agregarProyecto = (index) => {
    const nuevasExperiencias = [...experiencias];
    nuevasExperiencias[index].proyectos.push({ nombre: '', descripcion: '' });
    setExperiencias(nuevasExperiencias);
    if (onExperienciasChange) onExperienciasChange(nuevasExperiencias);
    };

    const eliminarProyecto = (expIndex, projIndex) => {
    const nuevasExperiencias = [...experiencias];
    nuevasExperiencias[expIndex].proyectos = nuevasExperiencias[expIndex].proyectos.filter((_, i) => i !== projIndex);
    setExperiencias(nuevasExperiencias);
    if (onExperienciasChange) onExperienciasChange(nuevasExperiencias);
    };

    return (
    <div>
        <h4>Experiencia Laboral</h4>
        {experiencias.map((exp, expIndex) => (
        <div key={expIndex} className="mb-4 border p-3">
            <div className="d-flex justify-content-between align-items-center">
            <h5>Experiencia #{expIndex + 1}</h5>
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

            <div className="mb-3">
            <label htmlFor={`empresa-${expIndex}`} className="form-label">
                Empresa
            </label>
            <input
                type="text"
                id={`empresa-${expIndex}`}
                name={`empresa-${expIndex}`}
                className="form-control"
                value={exp.empresa}
                onChange={(e) => manejarCambioExperiencia(expIndex, 'empresa', e.target.value)}
                required
            />
            </div>
            <div className="mb-3">
            <label htmlFor={`tiempo-${expIndex}`} className="form-label">
                Tiempo trabajado (en meses)
            </label>
            <input
                type="number"
                id={`tiempo-${expIndex}`}
                name={`tiempo-${expIndex}`}
                className="form-control"
                value={exp.tiempo}
                onChange={(e) => manejarCambioExperiencia(expIndex, 'tiempo', e.target.value)}
                required
            />
            </div>

            <h5>Proyectos</h5>
            {exp.proyectos.map((proj, projIndex) => (
            <div key={projIndex} className="mb-3 border p-2">
                <div className="d-flex justify-content-between align-items-center">
                <h6>Proyecto #{projIndex + 1}</h6>
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
                <label htmlFor={`proyecto-nombre-${expIndex}-${projIndex}`} className="form-label">
                    Nombre del Proyecto
                </label>
                <input
                    type="text"
                    id={`proyecto-nombre-${expIndex}-${projIndex}`}
                    name={`proyecto-nombre-${expIndex}-${projIndex}`}
                    className="form-control"
                    value={proj.nombre}
                    onChange={(e) => manejarCambioProyecto(expIndex, projIndex, 'nombre', e.target.value)}
                    required
                />
                </div>
                <div className="mb-2">
                <label htmlFor={`proyecto-descripcion-${expIndex}-${projIndex}`} className="form-label">
                    Descripción del Proyecto
                </label>
                <textarea
                    id={`proyecto-descripcion-${expIndex}-${projIndex}`}
                    name={`proyecto-descripcion-${expIndex}-${projIndex}`}
                    className="form-control"
                    value={proj.descripcion}
                    onChange={(e) => manejarCambioProyecto(expIndex, projIndex, 'descripcion', e.target.value)}
                    required
                />
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
        ))}

        <button type="button" className="btn btn-tipodos" onClick={agregarExperiencia}>
        Agregar Experiencia Laboral
        </button>
    </div>
    );
}
/*
const Paso4 = ({ formData, manejarValorInput }) => {
    const manejarCambioExperiencias = (nuevasExperiencias) => {
      manejarValorInput({
        target: { name: 'experiencias', value: nuevasExperiencias },
      });
    };
  
    return (
      <form className="form-crearcuenta" data-step="4">
        <SeccionExperenciasLaborales
          onExperienciasChange={manejarCambioExperiencias}
        />
      </form>
    );
  };
  */