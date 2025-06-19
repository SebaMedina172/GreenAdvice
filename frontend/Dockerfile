FROM node:18-alpine

WORKDIR /app

# Copia package.json y lock antes para cachear npm install
COPY package.json package-lock.json* ./
RUN npm install

# Copia el resto del código
COPY . .

# Expone puerto (Next.js por defecto 3000)
EXPOSE 3000

# Anulamos ENTRYPOINT de la imagen base que quizá sea ["node"]
ENTRYPOINT []

# CMD para producción: build y luego start
CMD ["sh", "-c", "npm run build && npm run start"]
