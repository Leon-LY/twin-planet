FROM node:22-alpine

WORKDIR /app

# 安装所有依赖（含 devDependencies 中的 tsx）
COPY package.json ./
RUN npm install

# 复制源码
COPY tsconfig.json ./
COPY drizzle.config.ts ./
COPY src/ ./src/
COPY drizzle/ ./drizzle/

EXPOSE 3000

# 用 tsx 直接运行 TypeScript（MVP 阶段，免编译）
CMD ["npx", "tsx", "src/index.ts"]
