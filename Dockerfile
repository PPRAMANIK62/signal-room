FROM oven/bun:1-alpine

WORKDIR /workspace

ENV HUSKY=0

COPY package.json bun.lock tsconfig.json ./
COPY apps ./apps
COPY packages ./packages
COPY tests ./tests
COPY simulators ./simulators
COPY load ./load

RUN bun install --frozen-lockfile

ENV NODE_ENV=development

EXPOSE 3000 3001 5173

CMD ["bun", "test"]
