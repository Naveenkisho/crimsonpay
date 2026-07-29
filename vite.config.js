import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({root:'wallet',base:'/connect/',plugins:[react()],build:{outDir:'../dist/connect',emptyOutDir:true}});