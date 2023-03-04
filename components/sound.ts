export const playReadySound = (onPlayEnd: () => void) => {
  const audioCtx = new window.AudioContext();
  const oscillator = audioCtx.createOscillator();
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(0, audioCtx.currentTime);
  oscillator.connect(audioCtx.destination);
  oscillator.onended = () => onPlayEnd();
  oscillator.start(0);
  oscillator.stop(0);
};

export const startAzukiSound = (
  setPanNode: (panNode: StereoPannerNode) => void,
  setGainNode: (gainNode: GainNode) => void
) => {
  const _audioCtx = new window.AudioContext();
  const request = new XMLHttpRequest();
  request.open('GET', 'azuki.wav', true);
  request.responseType = 'arraybuffer';
  request.onload = () => {
    const audioData = request.response;
    const source = _audioCtx.createBufferSource();
    _audioCtx.decodeAudioData(audioData).then((decodedData) => {
      source.buffer = decodedData;
      source.loop = true;
      const _gainNode = _audioCtx.createGain();
      source.connect(_gainNode);
      _gainNode.connect(_audioCtx.destination);
      const _panNode = _audioCtx.createStereoPanner();
      source.connect(_panNode);
      _panNode.connect(_gainNode);
      source.start();
      setPanNode(_panNode);
      setGainNode(_gainNode);
    });
  };
  request.send();
};
