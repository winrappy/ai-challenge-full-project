# --- Stage 1: Build ---
# Use node:slim instead of alpine because Vite/SWR requires native Node modules,
# which are not compatible with Alpine's musl libc
FROM --platform=linux/amd64 node:24.4.1-slim as builder

WORKDIR /app

# Install dependencies using package-lock.json for consistent builds
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and build the project
COPY . .
RUN npm run build

# --- Stage 2: Production Serve ---
# Create a lightweight production image
FROM --platform=linux/amd64 node:24.4.1-slim as production

WORKDIR /app

# Install 'serve' to serve the static build
RUN npm install -g serve

# Copy the built files from the builder stage
COPY --from=builder /app/dist ./dist

EXPOSE 30080

# Start the server on port 30080
CMD ["serve", "-s", "dist", "-l", "30080"]
