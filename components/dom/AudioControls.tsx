'use client';

import { AudioManager } from '@/lib/audio/AudioManager'; // Ajusta la ruta si es necesario

export function AudioControls() {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Obtenemos la instancia del AudioManager y le pasamos el archivo
        const audioManager = AudioManager.getInstance();
        await audioManager.loadAudioFile(file);
        console.log(`Archivo de audio "${file.name}" cargado y reproduciendo.`);
      } catch (error) {
        console.error("Error al cargar el archivo de audio:", error);
        alert("Hubo un error al procesar el archivo de audio.");
      }
    }
  };

  return (
    <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10 }}>
      <input type="file" accept="audio/*" onChange={handleFileChange} />
    </div>
  );
}
