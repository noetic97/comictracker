FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Generate Prisma client
RUN npx prisma generate

CMD ["npm", "run", "dev"]
