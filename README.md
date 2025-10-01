# Artificial Neuron Simulator

An interactive artificial neuron simulator with real-time activation function visualization.

## Features

- 🧠 **Input & Weight Management**: Add, remove, and modify inputs with their corresponding weights
- ⚡ **Activation Functions**: Choose from 6 different activation functions:
  - Sigmoid
  - Tanh
  - Linear
  - Step
  - Sign
- 📊 **Real-time Graph**: Visualize the selected function graph with current point highlighted
- 🎯 **Transparent Calculations**: See weighted sum and output calculations in real-time
- 🎨 **Modern Design**: Responsive interface with dark mode support
- 🔧 **Configurable Bias**: Add bias to the neuron for greater flexibility
- 🔍 **Interactive Visualization**: Zoom (20% to 150%) and pan functionality
- 📐 **Infinite Coordinate System**: Dynamic grid lines and infinite axes

## How to Use

### Basic Usage
1. **Add Inputs**: Use the "+ Add Input" button to add new inputs
2. **Set Values**: Enter input values and their corresponding weights
3. **Configure Bias**: Set the bias value for the neuron
4. **Select Function**: Choose from 6 different activation functions
5. **View Results**: See real-time calculations and graph visualization

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

**Developed by Arturo Marino**



