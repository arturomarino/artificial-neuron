# Artificial Neuron Simulator

An interactive artificial neuron simulator with real-time activation function visualization.

## Features

- 🧠 **Input & Weight Management**: Add, remove, and modify inputs with their corresponding weights
- ⚡ **Activation Functions**: Choose from 6 different activation functions:
  - Sigmoid
  - Tanh
  - ReLU
  - Leaky ReLU
  - Linear
  - Step
- 📊 **Real-time Graph**: Visualize the selected function graph with current point highlighted
- 🎯 **Transparent Calculations**: See weighted sum and output calculations in real-time
- 🎨 **Modern Design**: Responsive interface with dark mode support
- 🔧 **Configurable Bias**: Add bias to the neuron for greater flexibility
- 🔍 **Interactive Visualization**: Zoom (20% to 150%) and pan functionality
- 📐 **Infinite Coordinate System**: Dynamic grid lines and infinite axes

## Technical Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## How to Use

### Basic Usage
1. **Add Inputs**: Use the "+ Add Input" button to add new inputs
2. **Set Values**: Enter input values and their corresponding weights
3. **Configure Bias**: Set the bias value for the neuron
4. **Select Function**: Choose from 6 different activation functions
5. **View Results**: See real-time calculations and graph visualization

### Interactive Features
- **Zoom**: Use mouse wheel or +/- buttons to zoom (20% to 150%)
- **Pan**: Drag the graph to move around the coordinate system
- **Reset**: Use "Reset View" to return to original position and zoom
- **Dark Mode**: Automatically adapts to your system theme

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

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

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

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

## Developer

**Developed by Arturo Marino**

This project demonstrates advanced React concepts including:
- Interactive data visualization with SVG
- Real-time mathematical calculations
- Responsive design with CSS Grid and Flexbox
- TypeScript for type safety
- Modern React patterns with hooks

## License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ using React Router.
