import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs-extra';

// https://vitejs.dev/config/
export default defineConfig({
  // Use relative paths for assets
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/index.html'),
        background: resolve(__dirname, 'src/background/background.ts'),
      },
      output: {
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name) {
            const info = assetInfo.name.split('.');
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name)) {
              return `assets/[name][extname]`;
            }
            if (/\.css$/.test(assetInfo.name)) {
              return `css/[name][extname]`;
            }
          }
          return `[name][extname]`;
        },
      },
    },
    // Use relative paths
    assetsInlineLimit: 0,
    cssCodeSplit: true,
    minify: true,
    sourcemap: false,
  },
  plugins: [
    {
      name: 'copy-manifest-and-assets',
      closeBundle() {
        // Create dist directory if it doesn't exist
        if (!fs.existsSync('dist')) {
          fs.mkdirSync('dist', { recursive: true });
        }

        // Copy manifest.json
        fs.copyFileSync('src/manifest.json', 'dist/manifest.json');
        console.log('manifest.json copied to dist/manifest.json');

        // Copy _locales directory
        if (fs.existsSync('src/_locales')) {
          fs.copySync('src/_locales', 'dist/_locales');
          console.log('_locales directory copied to dist/_locales');
        }

        // Copy assets directory
        if (fs.existsSync('src/assets')) {
          fs.copySync('src/assets', 'dist/assets');
          console.log('assets directory copied to dist/assets');
        }

        // Copy css directory
        if (fs.existsSync('src/css')) {
          fs.copySync('src/css', 'dist/css');
          console.log('css directory copied to dist/css');
        }

        // Fix popup HTML path
        if (fs.existsSync('dist/src/popup/index.html')) {
          // Create popup directory if it doesn't exist
          if (!fs.existsSync('dist/popup')) {
            fs.mkdirSync('dist/popup', { recursive: true });
          }
          
          // Move popup HTML to the correct location
          fs.moveSync('dist/src/popup/index.html', 'dist/popup/index.html', { overwrite: true });
          console.log('Moved popup HTML to the correct location');
          
          // Clean up src directory
          fs.removeSync('dist/src');
          console.log('Cleaned up src directory');
        }
      },
    },
  ],
}); 