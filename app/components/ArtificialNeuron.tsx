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

interface AggregationFunction {
  name: string;
  fn: (inputs: Input[]) => number;
  formula: (inputs: Input[], theta: number) => string;
}

const aggregationFunctions: AggregationFunction[] = [
  {
    name: 'Sum',
    fn: (inputs: Input[]) => inputs.reduce((sum, input) => sum + (input.value * input.weight), 0),
    formula: (inputs: Input[], theta: number) => {
      const terms = inputs.map(input => `(${input.value} × ${input.weight})`).join(' + ');
      return theta !== 0 ? `${terms} + ${theta}` : terms;
    }
  },
  {
    name: 'Product',
    fn: (inputs: Input[]) => inputs.reduce((prod, input) => prod * (input.value * input.weight), 1),
    formula: (inputs: Input[], theta: number) => {
      const terms = inputs.map(input => `(${input.value} × ${input.weight})`).join(' × ');
      return theta !== 0 ? `(${terms}) + ${theta}` : terms;
    }
  },
  {
    name: 'Maximum',
    fn: (inputs: Input[]) => Math.max(...inputs.map(input => input.value * input.weight)),
    formula: (inputs: Input[], theta: number) => {
      const terms = inputs.map(input => `(${input.value} × ${input.weight})`).join(', ');
      return theta !== 0 ? `max(${terms}) + ${theta}` : `max(${terms})`;
    }
  },
  {
    name: 'Minimum',
    fn: (inputs: Input[]) => Math.min(...inputs.map(input => input.value * input.weight)),
    formula: (inputs: Input[], theta: number) => {
      const terms = inputs.map(input => `(${input.value} × ${input.weight})`).join(', ');
      return theta !== 0 ? `min(${terms}) + ${theta}` : `min(${terms})`;
    }
  }
];

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
    name: 'Linear',
    fn: (x: number) => x,
    derivative: (x: number) => 1
  },
  {
    name: 'Step',
    fn: (x: number) => x >= 0 ? 1 : 0,
    derivative: (x: number) => 0
  },
  {
    name: 'Sign',
    fn: (x: number) => x > 0 ? 1 : -1,
    derivative: (x: number) => 0
  }
];

export function ArtificialNeuron() {
  const [inputs, setInputs] = useState<Input[]>([
    { id: '1', value: 0, weight: 1 },
    { id: '2', value: 0, weight: 1 }
  ]);
  const [selectedAggregation, setSelectedAggregation] = useState(aggregationFunctions[0]);
  const [selectedFunction, setSelectedFunction] = useState(activationFunctions[0]);
  const [theta, setTheta] = useState(0);
  const [thetaInput, setThetaInput] = useState('0');
  const [linearSlope, setLinearSlope] = useState(1);
  const [linearSlopeInput, setLinearSlopeInput] = useState('1');
  const [sigmoidGain, setSigmoidGain] = useState(1);
  const [sigmoidGainInput, setSigmoidGainInput] = useState('1');
  
  const svgRef = useRef<SVGSVGElement>(null);

  // Graph dimensions - fixed professional layout (horizontal rectangle)
  const width = 1200;
  const height = 500;
  const padding = 0; // no padding - full graph area
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  // Calculate aggregated value
  const aggregatedValue = useMemo(() => {
    const baseValue = selectedAggregation.fn(inputs);
    // Theta is always added (summed) for all aggregation functions
    return baseValue + theta;
  }, [inputs, theta, selectedAggregation]);

  // Calculate output using selected activation function
  const output = useMemo(() => {
    // For Linear function, apply the slope parameter and clamp between -1 and 1
    if (selectedFunction.name === 'Linear') {
      const linearOutput = linearSlope !== 0 ? aggregatedValue / linearSlope : aggregatedValue;
      return Math.max(-1, Math.min(1, linearOutput));
    }
    // For Sigmoid and Tanh, apply the gain parameter
    if (selectedFunction.name === 'Sigmoid') {
      return 1 / (1 + Math.exp(-sigmoidGain * aggregatedValue));
    }
    if (selectedFunction.name === 'Tanh') {
      return Math.tanh(sigmoidGain * aggregatedValue);
    }
    return selectedFunction.fn(aggregatedValue);
  }, [selectedFunction, aggregatedValue, linearSlope, sigmoidGain]);

  // Convert world coordinates to screen coordinates
  const worldToScreen = useCallback((x: number, y: number) => {
    // Map x from [-5, 5] to [padding, width - padding]
    const screenX = padding + ((x + 5) / 10) * graphWidth;
    // Map y from [-1.5, 1.5] to [height - padding, padding] (inverted for screen coordinates)
    const screenY = height - padding - ((y + 1.5) / 3) * graphHeight;
    return { x: screenX, y: screenY };
  }, [padding, graphWidth, graphHeight, height]);

  // Generate data points for the graph (X: -5 to 5, Y: -1.5 to 1.5)
  const graphData = useMemo(() => {
    const points = [];
    const numPoints = 1000;
    const step = 10 / numPoints; // Range of 10 (from -5 to 5) divided by number of points
    
    for (let i = 0; i <= numPoints; i++) {
      const x = -5 + i * step;
      let y;
      
      if (selectedFunction.name === 'Linear') {
        const linearY = linearSlope !== 0 ? x / linearSlope : x;
        // Linear function must stay between -1 and 1
        y = Math.max(-1, Math.min(1, linearY));
      } else if (selectedFunction.name === 'Sigmoid') {
        y = 1 / (1 + Math.exp(-sigmoidGain * x));
      } else if (selectedFunction.name === 'Tanh') {
        y = Math.tanh(sigmoidGain * x);
      } else {
        y = selectedFunction.fn(x);
      }
      
      // Clamp y to the visible range
      y = Math.max(-1.5, Math.min(1.5, y));
      
      const screen = worldToScreen(x, y);
      points.push({ x: screen.x, y: screen.y });
    }
    return points;
  }, [selectedFunction, linearSlope, sigmoidGain, worldToScreen]);

  // Generate professional grid lines (GeoGebra style)
  const gridLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; type: 'minor' | 'major' }[] = [];
    
    // Minor grid spacing: 0.1 units
    // Major grid spacing: 0.5 units (every 5 minor lines)
    const minorSpacing = 0.1;
    const majorInterval = 5; // Every 5 minor lines (0.5 units)
    
    // Vertical lines (X axis: from -5 to 5)
    for (let i = -50; i <= 50; i++) {
      const x = i * minorSpacing;
      const screen = worldToScreen(x, 0);
      const isMajor = i % majorInterval === 0;
      
      lines.push({
        x1: screen.x,
        y1: padding,
        x2: screen.x,
        y2: height - padding,
        type: isMajor ? 'major' : 'minor'
      });
    }
    
    // Horizontal lines (Y axis: from -1.5 to 1.5)
    for (let i = -15; i <= 15; i++) {
      const y = i * minorSpacing;
      const screen = worldToScreen(0, y);
      const isMajor = i % majorInterval === 0;
      
      lines.push({
        x1: padding,
        y1: screen.y,
        x2: width - padding,
        y2: screen.y,
        type: isMajor ? 'major' : 'minor'
      });
    }
    
    return lines;
  }, [worldToScreen, padding, width, height]);

  // Generate tick marks and labels (decimals visible)
  const tickMarks = useMemo(() => {
    const ticks: { x: number; y: number; label: string; axis: 'x' | 'y' }[] = [];
    
    // X-axis ticks - every 1 unit
    const xValues = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5];
    for (const x of xValues) {
      const screen = worldToScreen(x, 0);
      ticks.push({
        x: screen.x,
        y: screen.y,
        label: x.toString(),
        axis: 'x'
      });
    }
    
    // Y-axis ticks - every 0.25 units
    const yValues = [-1.5, -1.25, -1, -0.75, -0.5, -0.25, 0.25, 0.5, 0.75, 1, 1.25, 1.5];
    for (const y of yValues) {
      const screen = worldToScreen(0, y);
      ticks.push({
        x: screen.x,
        y: screen.y,
        label: y % 1 === 0 ? y.toString() : y.toFixed(2),
        axis: 'y'
      });
    }
    
    return ticks;
  }, [worldToScreen]);


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

  const handleThetaChange = (value: string) => {
    setThetaInput(value);
    setTheta(value === '' ? 0 : parseFloat(value) || 0);
  };

  const handleLinearSlopeChange = (value: string) => {
    setLinearSlopeInput(value);
    const numValue = parseFloat(value);
    // Ensure a is always 1 or greater
    if (value === '') {
      setLinearSlope(1);
    } else if (!isNaN(numValue) && numValue >= 1) {
      setLinearSlope(numValue);
    } else {
      setLinearSlope(1); // Minimum value is 1
    }
  };

  const handleSigmoidGainChange = (value: string) => {
    setSigmoidGainInput(value);
    const numValue = parseFloat(value);
    // Ensure g is always greater than 1
    if (value === '') {
      setSigmoidGain(1);
    } else if (!isNaN(numValue) && numValue > 1) {
      setSigmoidGain(numValue);
    } else {
      setSigmoidGain(1.1); // Minimum value slightly greater than 1
    }
  };

  return (
    <div className="neuron-interface">
      <div className="neuron-header">
        <h1 className="neuron-title">Artificial Neuron Simulator</h1>
        <p className="neuron-subtitle">Interactive neural network visualization</p>
        <p className="developer-credit">
          Developed by Arturo Marino 
          <a 
            href="https://github.com/arturomarino/artificial-neuron" 
            target="_blank" 
            rel="noopener noreferrer"
            className="github-link"
            title="View on GitHub"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="currentColor"
              className="github-icon"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        </p>
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

            <div className="theta-control">
              <label>θ (Theta):</label>
              <input
                type="number"
                value={thetaInput}
                onChange={(e) => handleThetaChange(e.target.value)}
                step="0.1"
                className="input-field"
                placeholder="0"
              />
            </div>
          </div>

          <div className="aggregation-section">
            <h2>Aggregation Function</h2>
            <div className="function-selector">
              {aggregationFunctions.map((func) => (
                <button
                  key={func.name}
                  className={`function-btn ${selectedAggregation.name === func.name ? 'active' : ''}`}
                  onClick={() => setSelectedAggregation(func)}
                >
                  {func.name}
                </button>
              ))}
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
            
            {selectedFunction.name === 'Linear' && (
              <div className="linear-slope-control">
                <label>a (Slope):</label>
                <input
                  type="number"
                  value={linearSlopeInput}
                  onChange={(e) => handleLinearSlopeChange(e.target.value)}
                  step="0.1"
                  min="1"
                  className="input-field"
                  placeholder="1"
                />
              </div>
            )}
            
            {(selectedFunction.name === 'Sigmoid' || selectedFunction.name === 'Tanh') && (
              <div className="sigmoid-gain-control">
                <label>g (Gain):</label>
                <input
                  type="number"
                  value={sigmoidGainInput}
                  onChange={(e) => handleSigmoidGainChange(e.target.value)}
                  step="0.1"
                  min="1.01"
                  className="input-field"
                  placeholder="1"
                />
              </div>
            )}
          </div>
        </div>

        <div className="neuron-visualization">
          <div className="calculation-display">
            <h3>Calculation</h3>
            <div className="calculation-steps">
              <div className="step">
                <span className="step-label">Aggregated Value:</span>
                <span className="step-value">
                  {selectedAggregation.formula(inputs, theta)} = {aggregatedValue.toFixed(3)}
                </span>
              </div>
              <div className="step">
                <span className="step-label">Output:</span>
                <span className="step-value">
                  {selectedFunction.name === 'Linear' 
                    ? `clamp(${aggregatedValue.toFixed(3)} / ${linearSlope}, -1, 1) = ${output.toFixed(3)}`
                    : (selectedFunction.name === 'Sigmoid' || selectedFunction.name === 'Tanh')
                    ? `${selectedFunction.name}(${sigmoidGain} × ${aggregatedValue.toFixed(3)}) = ${output.toFixed(3)}`
                    : `${selectedFunction.name}(${aggregatedValue.toFixed(3)}) = ${output.toFixed(3)}`
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="graph-container">
            <div className="graph-header">
              <h3>Activation Function Graph</h3>
            </div>
            <div className="graph-wrapper">
              <svg 
                ref={svgRef}
                className="activation-graph" 
                viewBox={`0 0 ${width} ${height}`}
              >
                {/* Background */}
                <rect x="0" y="0" width={width} height={height} fill="#ffffff" />
                
                {/* Graph area background */}
                <rect 
                  x={padding} 
                  y={padding} 
                  width={graphWidth} 
                  height={graphHeight} 
                  fill="#fafafa" 
                  stroke="#e0e0e0"
                  strokeWidth="1"
                />
                
                {/* Grid lines */}
                <g>
                  {gridLines.map((line, i) => (
                    <line
                      key={`grid-${i}`}
                      x1={line.x1}
                      y1={line.y1}
                      x2={line.x2}
                      y2={line.y2}
                      stroke={line.type === 'major' ? '#cccccc' : '#e8e8e8'}
                      strokeWidth={line.type === 'major' ? 1.2 : 0.6}
                    />
                  ))}
                </g>
                
                {/* Axes */}
                {(() => {
                  const origin = worldToScreen(0, 0);
                  return (
                    <g>
                      {/* X-axis */}
                      <line
                        x1={padding}
                        y1={origin.y}
                        x2={width - padding}
                        y2={origin.y}
                        stroke="#333333"
                        strokeWidth={2}
                      />
                      {/* Y-axis */}
                      <line
                        x1={origin.x}
                        y1={padding}
                        x2={origin.x}
                        y2={height - padding}
                        stroke="#333333"
                        strokeWidth={2}
                      />
                      
                      {/* Axis arrows */}
                      <polygon
                        points={`${width - padding + 6},${origin.y - 5} ${width - padding + 6},${origin.y + 5} ${width - padding + 12},${origin.y}`}
                        fill="#333333"
                      />
                      <polygon
                        points={`${origin.x - 5},${padding - 6} ${origin.x + 5},${padding - 6} ${origin.x},${padding - 12}`}
                        fill="#333333"
                      />
                      
                      {/* Axis labels */}
                      <text
                        x={width - padding + 20}
                        y={origin.y - 10}
                        className="axis-label"
                        fill="#333333"
                        fontSize="16"
                        fontWeight="600"
                        fontStyle="italic"
                      >
                        x
                      </text>
                      <text
                        x={origin.x + 15}
                        y={padding - 15}
                        className="axis-label"
                        fill="#333333"
                        fontSize="16"
                        fontWeight="600"
                        fontStyle="italic"
                      >
                        y
                      </text>
                      
                      {/* Origin label */}
                      <text
                        x={origin.x - 18}
                        y={origin.y + 18}
                        className="origin-label"
                        fill="#666666"
                        fontSize="13"
                        fontWeight="500"
                      >
                        0
                      </text>
                    </g>
                  );
                })()}
                
                {/* Tick marks and labels */}
                <g>
                  {tickMarks.map((tick, i) => {
                    if (tick.axis === 'x') {
                      return (
                        <g key={`tick-${i}`}>
                          <line
                            x1={tick.x}
                            y1={tick.y - 6}
                            x2={tick.x}
                            y2={tick.y + 6}
                            stroke="#333333"
                            strokeWidth={1.5}
                          />
                          <text
                            x={tick.x}
                            y={tick.y + 22}
                            textAnchor="middle"
                            fill="#555555"
                            fontSize="12"
                            fontWeight="500"
                            fontFamily="Arial, sans-serif"
                          >
                            {tick.label}
                          </text>
                        </g>
                      );
                    } else {
                      return (
                        <g key={`tick-${i}`}>
                          <line
                            x1={tick.x - 6}
                            y1={tick.y}
                            x2={tick.x + 6}
                            y2={tick.y}
                            stroke="#333333"
                            strokeWidth={1.5}
                          />
                          <text
                            x={tick.x - 12}
                            y={tick.y + 5}
                            textAnchor="end"
                            fill="#555555"
                            fontSize="12"
                            fontWeight="500"
                            fontFamily="Arial, sans-serif"
                          >
                            {tick.label}
                          </text>
                        </g>
                      );
                    }
                  })}
                </g>
                
                {/* Clip path for function curve */}
                <defs>
                  <clipPath id="graphClip">
                    <rect x={padding} y={padding} width={graphWidth} height={graphHeight} />
                  </clipPath>
                </defs>
                
                {/* Function curve */}
                <g clipPath="url(#graphClip)">
                  {graphData.length > 0 && (
                    <path
                      d={graphData.map((point, index) => 
                        `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
                      ).join(' ')}
                      fill="none"
                      stroke="#1976d2"
                      strokeWidth={3}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  )}
                  
                  {/* Current point */}
                  {(() => {
                    const point = worldToScreen(aggregatedValue, output);
                    // Only show if in graph bounds
                    if (point.x < padding || point.x > width - padding || 
                        point.y < padding || point.y > height - padding) {
                      return null;
                    }
                    return (
                      <>
                        {/* Point indicator lines */}
                        <line
                          x1={point.x}
                          y1={worldToScreen(0, 0).y}
                          x2={point.x}
                          y2={point.y}
                          stroke="#d32f2f"
                          strokeWidth={1.5}
                          strokeDasharray="4,4"
                          opacity={0.6}
                        />
                        <line
                          x1={worldToScreen(0, 0).x}
                          y1={point.y}
                          x2={point.x}
                          y2={point.y}
                          stroke="#d32f2f"
                          strokeWidth={1.5}
                          strokeDasharray="4,4"
                          opacity={0.6}
                        />
                        
                        {/* Point */}
                        <circle
                          cx={point.x}
                          cy={point.y}
                          r="6"
                          fill="#d32f2f"
                          stroke="#ffffff"
                          strokeWidth="2.5"
                        />
                        
                        {/* Point label */}
                        <text
                          x={point.x}
                          y={point.y - 18}
                          textAnchor="middle"
                          className="point-label"
                          fill="#d32f2f"
                          fontSize="13"
                          fontWeight="700"
                          fontFamily="Arial, sans-serif"
                        >
                          ({aggregatedValue.toFixed(2)}, {output.toFixed(2)})
                        </text>
                      </>
                    );
                  })()}
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
