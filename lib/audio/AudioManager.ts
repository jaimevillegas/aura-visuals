// lib/audio/AudioManager.ts

export class AudioManager {
  private static instance: AudioManager;

  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private source: AudioBufferSourceNode | null = null;

  private constructor() {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    console.log("AudioManager inicializado y listo");

    // Para solucionar la política de autoplay de los navegadores
    this.resumeAudioContext();
  }

  // Método para reanudar el contexto de audio con un gesto del usuario
  private resumeAudioContext() {
    if (this.audioContext.state === 'suspended') {
      const resume = async () => {
        await this.audioContext.resume();
        document.removeEventListener('click', resume);
        document.removeEventListener('keydown', resume);
      };
      document.addEventListener('click', resume);
      document.addEventListener('keydown', resume);
    }
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  async loadAudioFile(file: File): Promise<void> {
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

    if (this.source) {
      this.source.disconnect();
    }

    this.source = this.audioContext.createBufferSource();
    this.source.buffer = audioBuffer;
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
    this.source.start(0);
  }

  getFrequencyData(): {
    low: number;
    mid: number;
    high: number;
    rawData: Uint8Array;
  } {
    const frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(frequencyData);

    const bufferLength = this.analyser.frequencyBinCount;
    const sampleRate = this.audioContext.sampleRate;

    return {
      low: this.calculateBandAverage(frequencyData, 10, 250, bufferLength, sampleRate),
      mid: this.calculateBandAverage(frequencyData, 250, 4000, bufferLength, sampleRate),
      high: this.calculateBandAverage(frequencyData, 4000, 16000, bufferLength, sampleRate),
      rawData: frequencyData,
    };
  }

  private calculateBandAverage(
    frequencyData: Uint8Array,
    startFreq: number,
    endFreq: number,
    bufferLength: number,
    sampleRate: number
  ): number {
    const startIndex = Math.floor((startFreq / (sampleRate / 2)) * bufferLength);
    const endIndex = Math.floor((endFreq / (sampleRate / 2)) * bufferLength);

    let sum = 0;
    for (let i = startIndex; i < endIndex; i++) {
      sum += frequencyData[i];
    }

    const average = sum / (endIndex - startIndex);
    return isNaN(average) ? 0 : average / 255;
  }
}
