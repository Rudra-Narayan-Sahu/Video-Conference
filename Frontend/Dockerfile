# Stage 1: Build the React + Vite Frontend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code and config
COPY . .

# Build production bundle
RUN npm run build

# Stage 2: Serve statically via Nginx
FROM nginx:alpine

# Copy custom Nginx SPA configuration
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
