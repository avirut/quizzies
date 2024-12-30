FROM node:18-alpine AS builder
WORKDIR /app

# Only need build essentials for better-sqlite3 native compilation
RUN apk add --no-cache build-base sqlite-dev

# Install dependencies and build
COPY package*.json ./
RUN npm ci
COPY . .

# Build the application
ENV NODE_ENV=production
RUN npm run build

# Clean install production dependencies
RUN rm -rf node_modules
RUN npm ci --omit=dev

FROM node:18-alpine
WORKDIR /app

# Copy only what's needed for production
COPY --from=builder /app/build .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src/lib/server/db ./src/lib/server/db
COPY package.json .

EXPOSE 3000
ENV NODE_ENV=production
ENV DATABASE_URL=/app/src/lib/server/db/quizzies.db

# Mount point for the database
VOLUME /app/src/lib/server/db

CMD ["node", "index.js"]