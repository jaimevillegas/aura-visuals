// components/dom/ControlPanel.tsx
'use client';

import { useVisualizerStore, COLOR_PALETTES } from '@/stores/visualizerStore';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function ControlPanel() {
  // Obtenemos los valores y las funciones para actualizarlos desde el store
  const {
    barCount,
    sensitivity,
    activePalette,
    setBarCount,
    setSensitivity,
    setActivePalette
  } = useVisualizerStore();

  const paletteNames = Object.keys(COLOR_PALETTES) as (keyof typeof COLOR_PALETTES)[];

  return (
    <div
      style={{
        position: 'absolute',
        top: '80px',
        left: '20px',
        zIndex: 10,
        background: 'rgba(0, 0, 0, 0.5)',
        padding: '16px',
        borderRadius: '8px',
        width: '250px',
        color: 'white'
      }}
    >
      <div className="space-y-4">
        {/* Slider para el Número de Barras */}
        <div>
          <label className="text-sm">Número de Barras: {barCount}</label>
          <Slider
            value={[barCount]}
            onValueChange={(value) => setBarCount(value[0])}
            min={16}
            max={128}
            step={16}
          />
        </div>

        {/* Slider para la Sensibilidad */}
        <div>
          <label className="text-sm">Sensibilidad: {sensitivity.toFixed(1)}</label>
          <Slider
            value={[sensitivity]}
            onValueChange={(value) => setSensitivity(value[0])}
            min={0.1}
            max={3.0}
            step={0.1}
          />
        </div>

        {/* Selector de Paleta de Colores */}
        <div>
          <label className="text-sm">Paleta de Colores</label>
          <Select
            value={activePalette}
            onValueChange={(value: keyof typeof COLOR_PALETTES) => setActivePalette(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una paleta" />
            </SelectTrigger>
            <SelectContent>
              {paletteNames.map(name => (
                <SelectItem key={name} value={name}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
