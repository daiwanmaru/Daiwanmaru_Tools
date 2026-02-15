# Use Node.js base image
FROM node:20-slim AS base

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

FROM base AS builder
WORKDIR /app

# Copy the entire monorepo
COPY . .

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Build everything
RUN pnpm build

# Final production image
FROM base AS runner
WORKDIR /app

# Copy production node_modules and built files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/core ./packages/core
COPY --from=builder /app/packages/tools ./packages/tools
COPY --from=builder /app/apps/worker ./apps/worker
COPY --from=builder /app/package.json ./package.json

# Set environment variables (these should ideally be passed at runtime)
# ENV DATABASE_URL=...
# ENV UPSTASH_REDIS_URL=...
# ...

WORKDIR /app/apps/worker
CMD ["node", "dist/index.js"]
