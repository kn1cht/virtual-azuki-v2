// LICENSE : MIT

import React, { useState, useEffect } from "https://cdn.skypack.dev/react@18.2.0?dts";
import ReactDOM from "https://cdn.skypack.dev/react-dom@18.2.0?dts";
import { AzukiWave } from './components/azukiwave.ts';
import { useWindowSize } from './components/useWindowSize.ts';
import { useDeviceOrientation } from './components/useDeviceOrientation.ts';

const limit90 = (angle: number) => Math.min(Math.max(angle, -90), 90);

const xAxisAzuki = new AzukiWave(3600);
const yAxisAzuki = new AzukiWave(1200);

function App() {
  const [width, height] = useWindowSize();
  const { orientation, requestAccess } = useDeviceOrientation();
  const top = orientation ? (limit90(orientation.beta) / 90 + 1) * height / 2 : height;
  const left = orientation ? (limit90(orientation.gamma) / 90 + 1) * width / 2 : width;
  const [ratioVal, setRatio] = useState();
  const [balanceVal, setBalance] = useState();

  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioCtx, setAudioCtx] = useState();
  const [panNode, setPanNode] = useState();
  const [gainNode, setGainNode] = useState();
  const [clock, setClock] = useState(Math.random);
  useEffect(() => {
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
        _audioCtx.suspend();
        setAudioCtx(_audioCtx);
        setPanNode(_panNode);
        setGainNode(_gainNode);
      });
    };
    request.send();
    const intervalId = setInterval(() => { setClock(Math.random()); }, 50);
    return () => { clearInterval(intervalId); };
  }, []);

  useEffect(() => {
    const xAzuki = xAxisAzuki.moveFromAngle(limit90(orientation ? orientation.beta : 0));
    const yAzuki = yAxisAzuki.moveFromAngle(limit90(orientation ? orientation.gamma : 0));
    if(!panNode) return;
    const ratio = xAzuki[0] != 0 ? xAzuki[1] / xAzuki[0] : 1;
    const balance = - 2 / (ratio + 1) + 1;
    const balanceSigmoid = 2 / (1 + Math.E ** (- 5 * balance)) - 1;
    setRatio(ratio);
    setBalance(balanceSigmoid);
    const volume = ((xAzuki[1] + xAzuki[0]) * 0.7 + (yAzuki[1] + yAzuki[0]) * 0.3) / 100.0;
    panNode.pan.value = balanceSigmoid; // from -1 to 1
    gainNode.gain.value = Math.max(0, volume);
  }, [clock]);

  return (
    <div id="app">
      <div class="nav">
        <h1>Virtual Azuki V2</h1>
      </div>
      <h1>↑ left</h1>
      {!orientation &&
        <button onClick={requestAccess}>
          Enable orientation sensor
        </button>
      }
      {!audioEnabled &&
        <button onClick={ () => { audioCtx.resume(); setAudioEnabled(true); } }>
          Start sound
        </button>
      }
      <div className="orientation-mark" style={{ top, left }}></div>
      <div className="notice">
        <ul>
          <li>This page requires device orientation sensors of smartphones.</li>
          <li>For the best experience, please lock the screen orientation.</li>
        </ul>
      </div>
      {/* debug */}
      <ul>
        <li>ɑ: {orientation && orientation.alpha}</li>
        <li>β: {orientation && orientation.beta}</li>
        <li>γ: {orientation && orientation.gamma}</li>
        <li>top: {orientation && top}px</li>
        <li>left: {orientation && left}px</li>
        <li>ratio: {orientation && ratioVal}</li>
        <li>balance: {orientation && balanceVal}</li>
      </ul>
      <h1 style={{ position: 'absolute', bottom: '10px' }}>↓ right</h1>
    </div>
  );
}

addEventListener("DOMContentLoaded", () => ReactDOM.render(<App />, document.querySelector("#main")));
