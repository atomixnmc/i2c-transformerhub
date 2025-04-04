import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts', // Adjust the entry point as needed
      name: 'TransformersHubShared',
      fileName: (format) => `transformers-hub-shared.${format}.js`,
    },
    rollupOptions: {
      external: ['ajv'], // Specify external dependencies
      output: {
        globals: {
          ajv: 'Ajv',
        },
        hoistTransitiveImports: false, // Prevent hoisting of transitive imports
      },
    },
  },
});
