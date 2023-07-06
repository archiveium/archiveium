# Stage release
FROM node:16.17.1
LABEL authors="Paritosh Bhatia"
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build

# Final build
FROM node:16.17.1
LABEL authors="Paritosh Bhatia"
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
COPY --from=0 /app/build ./build
COPY --from=0 /app/config ./config
RUN npm ci --omit dev
CMD [ "node", "build" ]