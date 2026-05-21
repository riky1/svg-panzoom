import { useRef, useEffect } from 'react';
import { createSvgPanZoom } from '@riky1/svg-panzoom';
import '@riky1/svg-panzoom/style.css';
import './SvgPanZoomDemo.css';

export default function SvgPanZoomDemo() {
  const containerRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    // Create the instance when the component mounts
    if (containerRef.current) {
      instanceRef.current = createSvgPanZoom({
        element: containerRef.current,
        viewportSelector: '[data-spz-viewport]',
        maxZoom: 6,
        wheelZoom: true,
        panEnabled: true,
        bounds: { enabled: true, padding: 20, overflow: true },
        fitOnInit: true,
        centerOnInit: true,
        zoomStep: 0.25
      });

      // (Optional) Listen to events
      instanceRef.current.on('change', (state) => {
        console.log('State changed:', state);
      });

      instanceRef.current.on('zoom', (e) => {
        console.log('Zoom:', e);
      });
    }

    // Cleanup: destroy the instance when the component unmounts
    return () => {
      if (instanceRef.current) {
        instanceRef.current.destroy();
        instanceRef.current = null;
      }
    };
  }, []);

  const handleZoomIn = () => {
    instanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    instanceRef.current?.zoomOut();
  };

  const handleReset = () => {
    instanceRef.current?.reset();
  };

  const handleFit = () => {
    instanceRef.current?.fit();
  };

  const handleCenter = () => {
    instanceRef.current?.center();
  };

  return (
    <div className="svg-container">
      <div className="controls">
        <button onClick={handleZoomIn}>Zoom In</button>
        <button onClick={handleZoomOut}>Zoom Out</button>
        <button onClick={handleReset}>Reset</button>
        <button onClick={handleFit}>Fit</button>
        <button onClick={handleCenter}>Center</button>
      </div>

      <div ref={containerRef} className="demo">
        <svg viewBox="0 0 800 450" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#60a5fa" />
              <stop offset="1" stopColor="#a78bfa" />
            </linearGradient>
          </defs>

          <g data-spz-viewport="true">
            <rect x="0" y="0" width="800" height="450" fill="#0b1220" />
            <rect x="40" y="40" width="720" height="370" rx="24" fill="url(#g)" opacity="0.35" />
            <circle cx="200" cy="220" r="70" fill="#22c55e" opacity="0.85" />
            <circle cx="580" cy="220" r="95" fill="#ef4444" opacity="0.75" />
          </g>
        </svg>
      </div>
    </div>
  );
}
