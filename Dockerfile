FROM oven/bun:latest AS build

RUN apt-get update && apt-get install -y openssl vim bash curl wget && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json bun.lockb ./

RUN bun install

COPY . .

RUN bun run build

RUN bunx prisma generate

FROM oven/bun:latest

RUN apt-get update && apt-get install -y openssl vim bash curl tzdata && rm -rf /var/lib/apt/lists/*

ENV TZ=America/Fortaleza

WORKDIR /app

COPY --from=build /app/dist /app/dist
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/bun.lockb ./
COPY --from=build /app/prisma /app/prisma ./

EXPOSE 3000

CMD ["bun", "start"]