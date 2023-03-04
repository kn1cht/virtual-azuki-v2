// LICENSE : MIT

import React, { useState } from "https://cdn.skypack.dev/react@18.2.0?dts";
import ReactDOM from "https://cdn.skypack.dev/react-dom@18.2.0?dts";
import { useWindowSize } from './components/useWindowSize.ts';
import { useDeviceOrientation } from './components/useDeviceOrientation.ts';

const limit90 = (angle: number) => Math.min(Math.max(angle, -90), 90);

function App() {
  const { orientation, requestAccess } = useDeviceOrientation();
  const [width, height] = useWindowSize();
  const [orientationAvailable, setOrientationAvailable] = useState(false);

  const top = orientation ? (limit90(orientation.beta) / 90 + 1) * height / 2 : height;
  const left = orientation ? (limit90(orientation.gamma) / 90 + 1) * width / 2 : width;
  return (
    <div id="app">
      <div class="nav">
        <h1>Virtual Azuki V2</h1>
        <button className="enable-orientation" onClick={requestAccess}>
          Enable orientation sensor
        </button>
      </div>
      <div className="orientation-mark" style={{ top, left }}></div>
      {/* debug */}
      {/* <ul>
        <li>ɑ: {orientation && orientation.alpha}</li>
        <li>β: {orientation && orientation.beta}</li>
        <li>γ: {orientation && orientation.gamma}</li>
        <li>top: {orientation && {top}}px</li>
        <li>left: {orientation && {left}}px</li>
      </ul>*/}
    </div>
  );
}

addEventListener("DOMContentLoaded", () => ReactDOM.render(<App />, document.querySelector("#main")));
