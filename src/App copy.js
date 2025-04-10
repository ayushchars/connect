import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./app.css";

function App() {
  const [count, setCount] = useState(0);
  const [isFlying, setIsFlying] = useState(false);
  const [showText, setShowText] = useState(false);
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
        console.error("Microphone access error:", err);
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
      setTimeout(() => setShowText(true), 1200);
    }
  }, [count]);

  const balloonSize = 150 + count / 2;

  return (
    <div className="container">
      <motion.img
        src="./dog1.png"
        alt="dog"
        className="dog"
        initial={{ y: 0 }}
        animate={{ y: isFlying ? -700 : 10 }}
        transition={{ type: "spring", stiffness: 60 }}
        style={{ width:`${balloonSize}px`, height: "auto" }}
      />

      <div className="count">Volume Score: {count}</div>

      <AnimatePresence>
        {showText && (
          <motion.div
            className="greeting-card"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1>Hi, I'm <span className="highlight">Ayush Chaurasia</span></h1>
            <p>React & Node.js Developer | 2+ Years Experience</p>
            <div className="button-row">
              <a href="https://www.linkedin.com/in/your-link" target="_blank" rel="noreferrer" className="glass-btn">
                <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="LinkedIn" />
                LinkedIn
              </a>
              <a href="https://yourportfolio.com" target="_blank" rel="noreferrer" className="glass-btn">
                <img src="https://cdn-icons-png.flaticon.com/512/1006/1006771.png" alt="Portfolio" />
                Portfolio
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App