import type { Route } from "./+types/home";
import { ArtificialNeuron } from "../components/ArtificialNeuron";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Artificial Neuron Simulator" },
    { name: "description", content: "Interactive artificial neuron visualization with activation functions" },
  ];
}

export default function Home() {
  return <ArtificialNeuron />;
}
