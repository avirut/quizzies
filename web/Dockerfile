FROM node:18-alpine AS builder
WORKDIR /app

# Add build dependencies
RUN apk add --no-cache python3 make g++ sqlite

# Install dependencies and build
COPY package*.json ./
RUN npm ci
COPY . .

# Build the application
ENV NODE_ENV=production
# Explicitly set the platform for libsql
ENV LIBSQL_PLATFORM=alpine
RUN npm run build

# Clean install production dependencies
RUN rm -rf node_modules
RUN npm ci --omit=dev
RUN npm install @libsql/linux-x64-musl

FROM node:18-alpine
WORKDIR /app

# Runtime dependencies
RUN apk add --no-cache sqlite

# Copy only what's needed for production
COPY --from=builder /app/build .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src/lib/server/db ./src/lib/server/db
COPY package.json .

EXPOSE 3000
ENV NODE_ENV=production
ENV DATABASE_URL=file:/app/src/lib/server/db/quizzies.db
ENV LIBSQL_PLATFORM=alpine

VOLUME /app/src/lib/server/db

CMD ["node", "index.js"]