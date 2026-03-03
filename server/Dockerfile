# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install

# Copy source code
COPY . .

# Create data directory for SQLite
RUN mkdir -p prisma

EXPOSE 3001

CMD ["node", "index.js"]
