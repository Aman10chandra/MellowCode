FROM node:22-slim
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Accept VITE_API_URL as a build argument so Vite can bake it into the bundle
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
