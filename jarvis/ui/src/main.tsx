import "@fontsource/rajdhani/500.css";
import "@fontsource/rajdhani/600.css";
import "@fontsource/rajdhani/700.css";
import "@fontsource-variable/inter-tight";
import "@fontsource-variable/jetbrains-mono";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
import "./hud.css";

createRoot(document.getElementById("root")!).render(<App />);
