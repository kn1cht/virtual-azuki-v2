// LICENSE : MIT

import React, { useState, useEffect } from "https://cdn.skypack.dev/react@18.2.0?dts";
import ReactDOM from "https://cdn.skypack.dev/react-dom@18.2.0?dts";
import { AzukiWave } from './components/azukiwave.ts';
import { useWindowSize } from './components/useWindowSize.ts';
import { useDeviceOrientation } from './components/useDeviceOrientation.ts';
import { playReadySound, startAzukiSound } from './components/sound.ts'

const limit90 = (angle: number) => Math.min(Math.max(angle, -90), 90);

const xAxisAzuki = new AzukiWave(3600);
const yAxisAzuki = new AzukiWave(1200);

function App() {
  const [width, height] = useWindowSize();
  const { orientation, requestAccess } = useDeviceOrientation();
  const top = orientation ? (limit90(orientation.beta) / 90 + 1) * height / 2 : height;
  const left = orientation ? (limit90(orientation.gamma) / 90 + 1) * width / 2 : width;

  const [panNode, setPanNode] = useState();
  const [gainNode, setGainNode] = useState();
  const [clock, setClock] = useState(Math.random);
  useEffect(() => {
    const intervalId = setInterval(() => { setClock(Math.random()); }, 50);
    return () => { clearInterval(intervalId); };
  }, []);

  useEffect(() => {
    const xAzuki = xAxisAzuki.moveFromAngle(limit90(orientation ? orientation.beta : 0));
    const yAzuki = yAxisAzuki.moveFromAngle(limit90(orientation ? orientation.gamma : 0));
    if(!panNode) return;
    const ratio = xAzuki[0] != 0 ? xAzuki[1] / xAzuki[0] : 1e6;
    const balance = - 2 / (ratio + 1) + 1;
    const volume = ((xAzuki[1] + xAzuki[0]) * 0.7 + (yAzuki[1] + yAzuki[0]) * 0.3) / 100.0;
    panNode.pan.value = balance; // from -1 to 1
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
      {!panNode &&
        <button onClick={ () => { playReadySound(() => startAzukiSound(setPanNode, setGainNode)); } }>
          Enable sound
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
      {/* <ul>
        <li>ɑ: {orientation && orientation.alpha}</li>
        <li>β: {orientation && orientation.beta}</li>
        <li>γ: {orientation && orientation.gamma}</li>
        <li>top: {orientation && top}px</li>
        <li>left: {orientation && left}px</li>
        <li>xa: {orientation && xAzuki[0]}</li>
        <li>xb: {orientation && xAzuki[1]}</li>
        <li>ya: {orientation && yAzuki[0]}</li>
        <li>yb: {orientation && yAzuki[1]}</li>
      </ul> */}
      <h1 style={{ position: 'absolute', bottom: '10px' }}>↓ right</h1>
    </div>
  );
}

addEventListener("DOMContentLoaded", () => ReactDOM.render(<App />, document.querySelector("#main")));
