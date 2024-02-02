# Stage release
FROM node:18.19.0
LABEL authors="Paritosh Bhatia"
WORKDIR /app
COPY . .
RUN npm ci --maxsockets 1
RUN npm run build

# Final build
FROM node:18.19.0
LABEL authors="Paritosh Bhatia"
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
COPY --from=0 /app/build ./build
COPY --from=0 /app/config ./config
COPY --from=0 /app/src/lib/mailTransport/templates ./templates
RUN npm ci --omit dev
CMD [ "node", "build" ]