import React from 'react';
import { Seccion1PageMiPerfil } from '../../components/candidato/Seccion1PageMiPerfil';
import { Seccion2PageMiperfil } from '../../components/candidato/Seccion2PageMiperfil';
import { Seccion3PageMiPerfil } from '../../components/candidato/Seccion3PageMiPerfil';
import '../../styles/candidato/miperfil.css';
import LoadingSpinner from '../../components/LoadingSpinner';

export const PageMiPerfilCandidato = ({candidato}) => {

    if (!candidato) {
        return <LoadingSpinner></LoadingSpinner> 
    }

    return (
        <>
        <div className='contenedor-todo'>
            <div className='seccion container mt-4 d-flex justify-content-center'>
                <Seccion1PageMiPerfil candidato={candidato}/>
            </div>
            <div className='seccion container mt-4 py-3 d-flex justify-content-center'>
                <Seccion2PageMiperfil candidato={candidato}/>
            </div>
            <div className='seccion container mt-4 mb-4 py-3 d-flex justify-content-center'>
                <Seccion3PageMiPerfil candidato={candidato}/>
            </div>
        </div>

        </>
    );
};