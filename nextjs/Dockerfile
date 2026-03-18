# Next.js Dockerfile (Multi-stage build)
# Build context should be the parent directory (git root)
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files from nextjs directory
COPY nextjs/package.json nextjs/package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code from nextjs directory
COPY nextjs/ ./

# Copy database file to the location expected by the app
COPY wordapp.db /wordapp.db

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose port
EXPOSE 3000

# Run the application
CMD ["node", "server.js"]
