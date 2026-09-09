# Build & Production Stage for Backend API
FROM node:20-alpine AS base

# Install dumb-init for proper signal forwarding and PID 1 reaping
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy application source
COPY src ./src

# Create logs directory and assign permissions to non-root node user
RUN mkdir -p logs && chown -R node:node /app

# Switch to non-root node user for container security
USER node

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "src/app.js"]
