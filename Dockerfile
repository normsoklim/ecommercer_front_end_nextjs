FROM node:24-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@12.14.0 --activate

# Copy dependency files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
