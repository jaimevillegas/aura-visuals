// components/visualizers/SpectrumBars.tsx
'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useVisualizerStore, COLOR_PALETTES } from '@/stores/visualizerStore'
import { useAudioStore } from '@/stores/audioStore'
import * as THREE from 'three'

// ¡Importante! El componente ahora no recibe props, lee todo desde el store.
export function SpectrumBars() {
  const meshRef = useRef<THREE.InstancedMesh>(null!)

  // Leemos los parámetros desde nuestro store
  const { barCount, sensitivity, activePalette } = useVisualizerStore();
  const palette = COLOR_PALETTES[activePalette];

  const geometry = useMemo(() => new THREE.BoxGeometry(0.5, 1, 0.5), [])
  const material = useMemo(() => new THREE.MeshStandardMaterial(), [])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const color = useMemo(() => new THREE.Color(), [])

  // useEffect se ejecuta cuando el componente se monta y cuando el barCount cambia
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.count = barCount;

      // Inicializamos el instanceColor correctamente
      if (!meshRef.current.instanceColor) {
        const colors = new Float32Array(128 * 3);
        meshRef.current.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
      }
    }
  }, [barCount]);

  useFrame(() => {
    if (!meshRef.current) return;

    const { rawData } = useAudioStore.getState().frequencyData;

    // Validación: asegurar que rawData existe y tiene datos
    if (!rawData || rawData.length === 0) return;

    // Usamos solo la primera mitad del espectro ya que la segunda mitad
    // suele tener muy poca energía en música típica
    const usableLength = Math.floor(rawData.length / 2);
    const dataPointsPerBar = usableLength / barCount;

    // Validación adicional: si no hay suficientes datos, salir
    if (dataPointsPerBar <= 0) return;

    for (let i = 0; i < barCount; i++) {
      // Usar interpolación continua en lugar de chunks discretos
      const start = Math.floor(i * dataPointsPerBar);
      const end = Math.floor((i + 1) * dataPointsPerBar);
      const dataChunk = rawData.slice(start, Math.min(end, usableLength));

      // Validación: asegurar que el chunk tiene datos
      if (dataChunk.length === 0) continue;

      const chunkAverage = dataChunk.reduce((a, b) => a + b, 0) / dataChunk.length;

      const normalizedValue = (isNaN(chunkAverage) ? 0 : chunkAverage / 255);

      // Aplicamos un boost a las frecuencias altas para que se vean mejor
      const highFreqBoost = 1 + (i / barCount) * 3;
      const finalValue = normalizedValue * highFreqBoost * sensitivity;
      const scale = 1 + finalValue * 10;

      dummy.position.set((i - barCount / 2) * 0.6, scale / 2, 0);
      dummy.scale.set(1, Math.max(0.05, scale), 1);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      // Lógica de color
      const colorIndex = Math.floor((i / barCount) * (palette.length - 1));
      const nextColorIndex = (colorIndex + 1) % palette.length;
      const lerpFactor = (i / barCount) * (palette.length - 1) - colorIndex;
      color.copy(palette[colorIndex]).lerp(palette[nextColorIndex], lerpFactor);

      meshRef.current.setColorAt(i, color);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  // La clave aquí es que el `InstancedMesh` ahora tiene un máximo de barras posible
  // y usamos la propiedad `count` para mostrar solo las que necesitamos.
  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, 128]} // 128 es el máximo de `barCount`
    />
  )
}
