import { defineConfig, loadEnv } from "vite"
import { visualizer } from "rollup-plugin-visualizer"
import react from "@vitejs/plugin-react-swc"
import UnoCSS from "unocss/vite"

export default ({ mode }) => {
  const env = loadEnv(mode, "")

  return defineConfig({
    plugins: [react(), UnoCSS(), visualizer({ open: true })],
    server: {
      port: Number(env.VITE_FRONTEND_PORT) || 300080,
    },
    build: {
      target: "esnext",
      minify: "esbuild",
      cssCodeSplit: false,
      sourcemap: false,
    },
    esbuild: {
      drop: ["console", "debugger"],
    },
  })
}
