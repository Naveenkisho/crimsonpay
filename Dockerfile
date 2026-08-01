FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY wallet ./wallet
COPY vite.config.js ./
RUN npm run build
COPY index.html styles.css trust-theme.css app.js ./dist/
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY server.mjs adminStore.mjs adminAuth.mjs ./
EXPOSE 3000
CMD ["npm","start"]