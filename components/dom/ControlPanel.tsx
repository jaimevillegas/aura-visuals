// components/dom/ControlPanel.tsx
'use client';

import { useState } from 'react';
import { useVisualizerStore, COLOR_PALETTES, VISUALIZER_CONFIGS } from '@/stores/visualizerStore';
import { VISUALIZER_REGISTRY } from '@/constants/visualizerRegistry';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function ControlPanel() {
  const [isExpanded, setIsExpanded] = useState(true);

  const {
    activePalette,
    activeVisualizer,
    setActivePalette,
    setActiveVisualizer,
    setVisualizerParam,
    getVisualizerParams,
  } = useVisualizerStore();

  const paletteNames = Object.keys(COLOR_PALETTES) as (keyof typeof COLOR_PALETTES)[];
  const visualizerIds = Object.keys(VISUALIZER_REGISTRY);

  // Get current visualizer parameters
  const currentParams = getVisualizerParams(activeVisualizer);
  const visualizerConfig = VISUALIZER_CONFIGS[activeVisualizer] || [];

  // Group parameters by category
  const groupedParams = visualizerConfig.reduce((acc, param) => {
    const category = param.category || 'visual';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(param);
    return acc;
  }, {} as Record<string, typeof visualizerConfig>);

  const categoryLabels = {
    audio: 'AUDIO REACTIVITY',
    visual: 'VISUAL PARAMETERS',
    motion: 'MOTION & ANIMATION',
    color: 'COLOR SETTINGS',
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: '80px',
        left: '20px',
        zIndex: 10,
        background: 'rgba(0, 0, 0, 0.85)',
        padding: '16px',
        borderRadius: '12px',
        width: '280px',
        color: 'white',
        backdropFilter: 'blur(10px)',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">Controls</h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-white/10 rounded"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {isExpanded && (
          <>
            {/* Visualizer Selector */}
            <div>
              <label className="text-sm font-bold text-cyan-400">Visualizer</label>
              <Select
                value={activeVisualizer}
                onValueChange={(value: string) => setActiveVisualizer(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select visualizer" />
                </SelectTrigger>
                <SelectContent>
                  {visualizerIds.map((id) => (
                    <SelectItem key={id} value={id}>
                      {VISUALIZER_REGISTRY[id as keyof typeof VISUALIZER_REGISTRY].name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color Palette (always visible) */}
            <div className="border-t border-white/20 pt-3">
              <p className="text-xs font-bold text-cyan-400 mb-3">COLOR</p>
              <div className="mb-3">
                <label className="text-xs">Color Palette</label>
                <Select
                  value={activePalette}
                  onValueChange={(value: keyof typeof COLOR_PALETTES) => setActivePalette(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select palette" />
                  </SelectTrigger>
                  <SelectContent>
                    {paletteNames.map(name => (
                      <SelectItem key={name} value={name}>
                        {name.charAt(0).toUpperCase() + name.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dynamic Parameters by Category */}
            {Object.entries(groupedParams).map(([category, params]) => (
              <div key={category} className="border-t border-white/20 pt-3">
                <p className="text-xs font-bold text-cyan-400 mb-3">
                  {categoryLabels[category as keyof typeof categoryLabels] || category.toUpperCase()}
                </p>

                {params.map((param) => {
                  const value = currentParams[param.name] ?? param.defaultValue;
                  const displayValue = param.step >= 1
                    ? Math.round(value)
                    : value.toFixed(param.step < 0.01 ? 3 : 2);

                  return (
                    <div key={param.name} className="mb-3">
                      <label className="text-xs">
                        {param.label}: {displayValue}
                      </label>
                      <Slider
                        value={[value]}
                        onValueChange={(newValue) =>
                          setVisualizerParam(activeVisualizer, param.name, newValue[0])
                        }
                        min={param.min}
                        max={param.max}
                        step={param.step}
                      />
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Show message if no custom parameters */}
            {visualizerConfig.length === 0 && (
              <div className="border-t border-white/20 pt-3">
                <p className="text-xs text-gray-400 italic">
                  This visualizer uses default parameters.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
