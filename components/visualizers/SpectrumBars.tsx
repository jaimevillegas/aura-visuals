// components/visualizers/SpectrumBars.tsx
'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useAudioStore } from '@/stores/audioStore'
import * as THREE from 'three'

// Definimos las propiedades que aceptará el componente, como se planeó.
interface SpectrumBarsProps {
  barCount?: number
  sensitivity?: number
}

export function SpectrumBars({ barCount = 64, sensitivity = 1.0 }: SpectrumBarsProps) {
  // Una referencia al InstancedMesh para poder manipularlo
  const meshRef = useRef<THREE.InstancedMesh>(null!)

  // Optimizamos creando la geometría y el material una sola vez
  const geometry = useMemo(() => new THREE.BoxGeometry(0.5, 1, 0.5), [])
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: 'cyan' }), [])

  // Un objeto temporal para las transformaciones, para no crear uno nuevo en cada frame.
  // ¡Esta es una optimización clave del plan!
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(() => {
    if (!meshRef.current) return

    // Obtenemos los datos de frecuencia directamente del store de Zustand.
    const { frequencyData } = useAudioStore.getState()
    const { low, mid, high } = frequencyData;

    // Un valor promedio de la energía del audio para este frame.
    const audioValue = (low + mid + high) / 3;

    for (let i = 0; i < barCount; i++) {
      // Por ahora, haremos que todas las barras reaccionen al promedio.
      // Más adelante lo haremos más granular.
      const scale = 1 + audioValue * sensitivity * 10 // Multiplicamos para que sea más visible

      // Aplicamos la posición y escala al objeto 'dummy'
      dummy.position.set((i - barCount / 2) * 0.6, scale / 2, 0)
      dummy.scale.set(1, Math.max(0.1, scale), 1) // Math.max para que nunca desaparezca
      dummy.updateMatrix()

      // Actualizamos la matriz de la instancia 'i' con los datos del 'dummy'
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }

    // ¡Muy importante! Le decimos a Three.js que actualice el InstancedMesh
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    // Creamos el InstancedMesh con la geometría, el material y el número de barras.
    <instancedMesh ref={meshRef} args={[geometry, material, barCount]} />
  )
}
