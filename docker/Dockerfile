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
COPY --from=0 /app/public ./public
COPY --from=0 /app/.cache ./.cache
COPY --from=0 /app/config ./config
COPY ./docker/docker-entrypoint.sh /usr/local/bin/
RUN ["chmod", "+x", "/usr/local/bin/docker-entrypoint.sh"]
RUN npm ci
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD [ "npm", "run", "start" ]