import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Only import lovable-tagger in development – it injects a WebSocket client
  // that tries to connect to ws://localhost:* which breaks production.
  const devPlugins: any[] = [];
  if (mode === 'development') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { componentTagger } = require('lovable-tagger');
      devPlugins.push(componentTagger());
    } catch {
      // lovable-tagger not installed – ignore
    }
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      ...devPlugins,
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      // Ensure no HMR / dev-server code leaks into the production bundle
      sourcemap: false,
    },
  };
});
