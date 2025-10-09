// components/canvas/Scene.tsx
'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei' // Un helper para mover la cámara
import { RotatingCube } from './RotatingCube'
import { AudioDataProvider } from './AudioDataProvider'

export default function Scene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
      {/* Luces */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {/* Helpers */}
      <OrbitControls /> {/* Permite rotar la escena con el ratón */}
      <gridHelper args={[10, 10]} /> {/* Muestra una cuadrícula en el suelo */}

      <RotatingCube />
      <AudioDataProvider />
    </Canvas>
  )
}
