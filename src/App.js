import React, { useEffect, useRef, useState } from "react";
import "./app.css";

function App() {
  const [count, setCount] = useState(0);
  const [isFlying, setIsFlying] = useState(false);
  const [showText, setshowText] = useState(false);
  const balloonRef = useRef(null);
  const containerRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    let rafId;

    const initMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const audioCtx = audioContextRef.current;

        const analyser = audioCtx.createAnalyser();
        const source = audioCtx.createMediaStreamSource(stream);

        source.connect(analyser);
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const checkLoudNoise = () => {
          analyser.getByteFrequencyData(dataArray);
          const volume = dataArray.reduce((a, b) => a + b, 0) / bufferLength;

          if (volume > 100) {
            setCount(prev => prev + 1);
          }

          rafId = requestAnimationFrame(checkLoudNoise);
        };

        checkLoudNoise();
      } catch (err) {
        console.error("Error accessing microphone:", err);
      }
    };

    initMic();

    return () => {
      cancelAnimationFrame(rafId);
      audioContextRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (count > 100) {
      setIsFlying(true);
      setTimeout(() => {
        setshowText(true)
      }, 1000);
    }
  }, [count]);

  const balloonSize = 100 + count / 2;

  return (
    <div
      ref={containerRef}
      className={`container ${isFlying ? "fly" : ""}`}
      style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/background.jpg)` }}
    >
      <img
        src={`${process.env.PUBLIC_URL}/dog1.png`}
        alt="dog with balloon"
        ref={balloonRef}
        className={`dog ${isFlying ? "fly" : ""}`}
        style={{ width: `${balloonSize}px`, height: "auto" }}
      />

      {showText && (
        <div className="message">
          Hi I'm Ayush Chaurasia, let's connect
        </div>
      )}
    </div>
  );
}

export default App;
