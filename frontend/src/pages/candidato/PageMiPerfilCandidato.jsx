import React, { useState, useEffect } from 'react';
import { Seccion1PageMiPerfil } from '../../components/candidato/Seccion1PageMiPerfil';
import { Seccion2PageMiperfil } from '../../components/candidato/Seccion2PageMiperfil';
import { Seccion3PageMiPerfil } from '../../components/candidato/Seccion3PageMiPerfil';
import '../../styles/candidato/miperfil.css';

export const PageMiPerfilCandidato = ({ candidato, actualizarCandidato }) => {
    if (!candidato) {
        return <p>Cargando datos del perfil...</p>;
    }

    return (
        <>
        <div className='contenedor-todo'>
            <div className='seccion container mt-4 d-flex justify-content-center'>
                <Seccion1PageMiPerfil candidato={candidato} actualizarCandidato={actualizarCandidato}/>
            </div>
            <div className='seccion container mt-4 py-5 d-flex justify-content-center'>
                <Seccion2PageMiperfil/>
            </div>
            <div className='seccion container mt-4 mb-4 py-5 d-flex justify-content-center'>
                <Seccion3PageMiPerfil/>
            </div>
        </div>

        </>
    );
};