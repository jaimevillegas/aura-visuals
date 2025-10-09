// components/canvas/RotatingCube.tsx
'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function RotatingCube() {
  // useRef nos da acceso directo al objeto 3D (el mesh)
  const meshRef = useRef<THREE.Mesh>(null!)

  // useFrame se ejecuta en cada fotograma (ideal para animaciones)
  useFrame((state, delta) => {
    // Rotamos el cubo en los ejes X e Y
    meshRef.current.rotation.x += delta * 0.5
    meshRef.current.rotation.y += delta * 0.5
  })

  // Optimizaciones del plan de desarrollo:
  // Usamos useMemo para que la geometría y el material no se recalculen en cada render.
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: 'cyan' }), [])

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} />
  )
}
