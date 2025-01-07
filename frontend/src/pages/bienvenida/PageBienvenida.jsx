import React from 'react'
import { Seccion1Bienvenida } from '../../components/bienvenida/Seccion1Bienvenida'
import { Seccion2Bienvenida } from '../../components/bienvenida/Seccion2Bienvenida'
import { Seccion3Bienvenida } from '../../components/bienvenida/Seccion3Bienvenida'

export const PageBienvenida = () => {
  return (
    <>
      <Seccion1Bienvenida/>
      <Seccion2Bienvenida />
      <Seccion3Bienvenida />
    </>
  )
}
