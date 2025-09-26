import { useState, useMemo, useRef, useCallback } from 'react';

interface Input {
  id: string;
  value: number;
  weight: number;
}

interface ActivationFunction {
  name: string;
  fn: (x: number) => number;
  derivative?: (x: number) => number;
}

const activationFunctions: ActivationFunction[] = [
  {
    name: 'Sigmoid',
    fn: (x: number) => 1 / (1 + Math.exp(-x)),
    derivative: (x: number) => {
      const sigmoid = 1 / (1 + Math.exp(-x));
      return sigmoid * (1 - sigmoid);
    }
  },
  {
    name: 'Tanh',
    fn: (x: number) => Math.tanh(x),
    derivative: (x: number) => 1 - Math.tanh(x) ** 2
  },
  {
    name: 'ReLU',
    fn: (x: number) => Math.max(0, x),
    derivative: (x: number) => x > 0 ? 1 : 0
  },
  {
    name: 'Leaky ReLU',
    fn: (x: number) => x > 0 ? x : 0.01 * x,
    derivative: (x: number) => x > 0 ? 1 : 0.01
  },
  {
    name: 'Linear',
    fn: (x: number) => x,
    derivative: (x: number) => 1
  },
  {
    name: 'Step',
    fn: (x: number) => x >= 0 ? 1 : 0,
    derivative: (x: number) => 0
  }
];

export function ArtificialNeuron() {
  const [inputs, setInputs] = useState<Input[]>([
    { id: '1', value: 0, weight: 1 },
    { id: '2', value: 0, weight: 1 }
  ]);
  const [selectedFunction, setSelectedFunction] = useState(activationFunctions[0]);
  const [bias, setBias] = useState(0);
  const [biasInput, setBiasInput] = useState('0');
  
  // Pan and zoom state
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Calculate weighted sum
  const weightedSum = useMemo(() => {
    return inputs.reduce((sum, input) => sum + (input.value * input.weight), 0) + bias;
  }, [inputs, bias]);

  // Calculate output using selected activation function
  const output = useMemo(() => {
    return selectedFunction.fn(weightedSum);
  }, [selectedFunction, weightedSum]);

  // Generate data points for the graph
  const graphData = useMemo(() => {
    const points = [];
    // Calculate visible range based on pan position
    const panXRange = Math.abs(panX) / 10; // Convert pan to x range
    const range = Math.max(30, 30 + panXRange); // Much larger base range
    const step = 0.05;
    
    // Start from a much larger negative range to ensure continuity
    const startX = -range - 20;
    const endX = range + 20;
    
    for (let x = startX; x <= endX; x += step) {
      points.push({
        x,
        y: selectedFunction.fn(x)
      });
    }
    return points;
  }, [selectedFunction, panX]);

  // Pan and zoom handlers
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.2, 1.5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.2, 0.2));
  }, []);

  const handleResetView = useCallback(() => {
    setPanX(0);
    setPanY(0);
    setZoom(1);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.2, Math.min(1.5, prev * delta)));
  }, []);


  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  }, [panX, panY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPanX(e.clientX - dragStart.x);
      setPanY(e.clientY - dragStart.y);
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const addInput = () => {
    const newId = (inputs.length + 1).toString();
    setInputs([...inputs, { id: newId, value: 0, weight: 1 }]);
  };

  const removeInput = (id: string) => {
    if (inputs.length > 1) {
      setInputs(inputs.filter(input => input.id !== id));
    }
  };

  const updateInput = (id: string, field: 'value' | 'weight', value: string) => {
    setInputs(inputs.map(input => 
      input.id === id ? { ...input, [field]: value === '' ? 0 : parseFloat(value) || 0 } : input
    ));
  };

  const handleBiasChange = (value: string) => {
    setBiasInput(value);
    setBias(value === '' ? 0 : parseFloat(value) || 0);
  };

  return (
    <div className="neuron-interface">
      <div className="neuron-header">
        <h1 className="neuron-title">Artificial Neuron Simulator</h1>
        <p className="neuron-subtitle">Interactive neural network visualization</p>
        <p className="developer-credit">Developed by Arturo Marino</p>
      </div>

      <div className="neuron-content">
        <div className="neuron-controls">
          <div className="inputs-section">
            <div className="section-header">
              <h2>Inputs & Weights</h2>
              <button 
                className="add-input-btn"
                onClick={addInput}
                disabled={inputs.length >= 10}
              >
                + Add Input
              </button>
            </div>
            
            <div className="inputs-list">
              {inputs.map((input, index) => (
                <div key={input.id} className="input-item">
                  <div className="input-label">Input {index + 1}</div>
                  <div className="input-controls">
                    <div className="input-group">
                      <label>Value:</label>
                      <input
                        type="number"
                        value={input.value === 0 ? '' : input.value.toString()}
                        onChange={(e) => updateInput(input.id, 'value', e.target.value)}
                        step="0.1"
                        className="input-field"
                        placeholder="0"
                      />
                    </div>
                    <div className="input-group">
                      <label>Weight:</label>
                      <input
                        type="number"
                        value={input.weight === 0 ? '' : input.weight.toString()}
                        onChange={(e) => updateInput(input.id, 'weight', e.target.value)}
                        step="0.1"
                        className="input-field"
                        placeholder="0"
                      />
                    </div>
                    {inputs.length > 1 && (
                      <button 
                        className="remove-input-btn"
                        onClick={() => removeInput(input.id)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bias-control">
              <label>Bias:</label>
              <input
                type="number"
                value={biasInput}
                onChange={(e) => handleBiasChange(e.target.value)}
                step="0.1"
                className="input-field"
                placeholder="0"
              />
            </div>
          </div>

          <div className="activation-section">
            <h2>Activation Function</h2>
            <div className="function-selector">
              {activationFunctions.map((func) => (
                <button
                  key={func.name}
                  className={`function-btn ${selectedFunction.name === func.name ? 'active' : ''}`}
                  onClick={() => setSelectedFunction(func)}
                >
                  {func.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="neuron-visualization">
          <div className="calculation-display">
            <h3>Calculation</h3>
            <div className="calculation-steps">
              <div className="step">
                <span className="step-label">Weighted Sum:</span>
                <span className="step-value">
                  {inputs.map((input, index) => (
                    <span key={input.id}>
                      {index > 0 && ' + '}
                      ({input.value} × {input.weight})
                    </span>
                  ))}
                  {bias !== 0 && ` + ${bias}`} = {weightedSum.toFixed(3)}
                </span>
              </div>
              <div className="step">
                <span className="step-label">Output:</span>
                <span className="step-value">
                  {selectedFunction.name}({weightedSum.toFixed(3)}) = {output.toFixed(3)}
                </span>
              </div>
            </div>
          </div>

          <div className="graph-container">
            <div className="graph-header">
              <h3>Activation Function Graph</h3>
              <div className="graph-controls">
                <div className="zoom-controls">
                  <button 
                    className="zoom-btn"
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.2}
                    title="Zoom Out"
                  >
                    −
                  </button>
                  <span className="zoom-level">{(zoom * 100).toFixed(0)}%</span>
                  <button 
                    className="zoom-btn"
                    onClick={handleZoomIn}
                    disabled={zoom >= 1.5}
                    title="Zoom In"
                  >
                    +
                  </button>
                </div>
                <button 
                  className="reset-view-btn"
                  onClick={handleResetView}
                  title="Reset View"
                >
                  Reset View
                </button>
              </div>
            </div>
            <div className="graph-wrapper">
              <div className="graph-instructions">
                <p>🖱️ Drag to pan • Scroll to zoom</p>
              </div>
              <svg 
                ref={svgRef}
                className="activation-graph" 
                viewBox="0 0 400 300"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                {/* Transform group for pan and zoom */}
                <g transform={`translate(${panX}, ${panY}) scale(${zoom})`}>
                  {/* Infinite Axes - Extended beyond viewport */}
                  <line x1="200" y1="-1000" x2="200" y2="1000" stroke="#374151" strokeWidth="2"/>
                  <line x1="-1000" y1="150" x2="1000" y2="150" stroke="#374151" strokeWidth="2"/>
                  
                  {/* Axis labels */}
                  <text x="200" y="20" textAnchor="middle" className="axis-label">y</text>
                  <text x="390" y="155" textAnchor="middle" className="axis-label">x</text>
                  
                  {/* Dynamic grid lines based on pan position */}
                  {Array.from({ length: 41 }, (_, i) => {
                    const gridSpacing = 20;
                    const centerX = 200;
                    const centerY = 150;
                    const offset = (i - 20) * gridSpacing;
                    const isMainGrid = offset % (gridSpacing * 5) === 0; // Every 5th line is main grid
                    
                    return (
                      <g key={`grid-${i}`}>
                        {/* Vertical grid lines */}
                        <line 
                          x1={centerX + offset} 
                          y1="-1000" 
                          x2={centerX + offset} 
                          y2="1000" 
                          stroke={isMainGrid ? "#9ca3af" : "#d1d5db"} 
                          strokeWidth={isMainGrid ? "0.8" : "0.5"}
                          opacity={isMainGrid ? "0.5" : "0.3"}
                        />
                        {/* Horizontal grid lines */}
                        <line 
                          x1="-1000" 
                          y1={centerY + offset} 
                          x2="1000" 
                          y2={centerY + offset} 
                          stroke={isMainGrid ? "#9ca3af" : "#d1d5db"} 
                          strokeWidth={isMainGrid ? "0.8" : "0.5"}
                          opacity={isMainGrid ? "0.5" : "0.3"}
                        />
                      </g>
                    );
                  })}
                  
                  {/* Function curve */}
                  <path
                    d={graphData.map((point, index) => {
                      const x = 200 + (point.x * 10); // Adjusted scale for larger range
                      const y = 150 - (point.y * 10); // Adjusted scale for larger range
                      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    vectorEffect="non-scaling-stroke"
                  />
                  
                  {/* Current point */}
                  <circle
                    cx={200 + (weightedSum * 10)}
                    cy={150 - (output * 10)}
                    r="6"
                    fill="#ef4444"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  
                  {/* Current point label */}
                  <text
                    x={200 + (weightedSum * 10)}
                    y={150 - (output * 10) - 15}
                    textAnchor="middle"
                    className="point-label"
                  >
                    ({weightedSum.toFixed(1)}, {output.toFixed(1)})
                  </text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
