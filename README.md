# Artificial Neuron Simulator

Un simulatore interattivo di neurone artificiale con visualizzazione in tempo reale delle funzioni di attivazione.

## Caratteristiche

- 🧠 **Gestione Input e Pesi**: Aggiungi, rimuovi e modifica input con i relativi pesi
- ⚡ **Funzioni di Attivazione**: Scegli tra 6 diverse funzioni di attivazione:
  - Sigmoid
  - Tanh
  - ReLU
  - Leaky ReLU
  - Linear
  - Step
- 📊 **Grafico in Tempo Reale**: Visualizza il grafico della funzione selezionata con il punto corrente evidenziato
- 🎯 **Calcoli Trasparenti**: Vedi il calcolo della somma pesata e dell'output in tempo reale
- 🎨 **Design Moderno**: Interfaccia responsive con supporto per modalità scura
- 🔧 **Bias Configurabile**: Aggiungi un bias al neurone per maggiore flessibilità

## Funzionalità Tecniche

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS per lo styling
- 📖 [React Router docs](https://reactrouter.com/)

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

---

Built with ❤️ using React Router.
