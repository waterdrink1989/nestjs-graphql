# Stage 1: Build stage
FROM node:20 AS builder

WORKDIR /usr/src/my-first-nest

# Copy package files first for better build cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Stage 2: Production runtime stage
FROM node:20-slim

# Create a non-root user for security
RUN useradd -m appuser

WORKDIR /usr/src/my-first-nest

# Copy built app and dependencies from builder
COPY --from=builder /usr/src/my-first-nest/dist ./dist
COPY --from=builder /usr/src/my-first-nest/node_modules ./node_modules
COPY --from=builder /usr/src/my-first-nest/package*.json ./

RUN chown -R appuser:appuser /usr/src/my-first-nest

USER appuser

EXPOSE 3000

ENV NODE_ENV=production

# CMD ["node", "dist/main.js"]
CMD ["node", "--inspect=0.0.0.0:9229", "dist/main.js"]
