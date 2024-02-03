# Stage release
FROM node:18.19.0
LABEL authors="Paritosh Bhatia"
WORKDIR /app
COPY . .
RUN npm config set registry https://registry.npmjs.org/
RUN npm config set fetch-retry-maxtimeout 1200000
RUN npm ci --maxsockets 5
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
RUN npm config set registry https://registry.npmjs.org/
RUN npm config set fetch-retry-maxtimeout 1200000
RUN npm ci --omit dev --maxsockets 5
CMD [ "node", "build" ]
