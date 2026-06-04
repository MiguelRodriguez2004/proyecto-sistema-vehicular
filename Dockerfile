# Usar una imagen oficial de Node.js ligera como base
FROM node:20-slim

# Instalar openssl (requerido por Prisma Client en entornos Debian/Ubuntu de node-slim)
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# Establecer el directorio de trabajo
WORKDIR /usr/src/app

# Copiar archivos de definición de dependencias
COPY package*.json ./

# Instalar dependencias del proyecto
RUN npm install

# Copiar el esquema de Prisma primero para generar el cliente
COPY prisma ./prisma/

# Generar el cliente de Prisma
RUN npx prisma generate

# Copiar el resto del código de la aplicación
COPY . .

# Exponer el puerto en el que corre la API (por defecto 3000)
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["npm", "run", "dev"]
