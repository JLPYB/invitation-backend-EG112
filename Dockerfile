# 1️⃣ Base image: Node 22 on Debian
FROM node:22-bullseye

# 2️⃣ Set working directory
WORKDIR /app

# 3️⃣ Install LibreOffice headless
RUN apt-get update && \
    apt-get install -y libreoffice && \
    rm -rf /var/lib/apt/lists/*

# 4️⃣ Copy package.json + pnpm lockfile first (for caching)
COPY package.json pnpm-lock.yaml ./

# 5️⃣ Install pnpm & dependencies
RUN npm install -g pnpm
RUN pnpm install

# 6️⃣ Copy the rest of the backend code
COPY . .

# 7️⃣ Expose port
EXPOSE 3000

# 8️⃣ Start server
CMD ["node", "src/index.js"]
