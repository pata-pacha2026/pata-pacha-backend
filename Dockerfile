FROM node:22-alpine

WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies (use --no-frozen-lockfile for flexibility)
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN pnpm run build

EXPOSE 3000

# Start: run migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
