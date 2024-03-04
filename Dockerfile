FROM node:21.6.2-bookworm AS builder
ENV PUBLIC_DB_HOST=https://db-p4phlb69d0sxhbb8.sf1.do.lunadb.io
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --production

FROM node:21.6.2-bookworm
WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY package.json .
EXPOSE 3000
ENV NODE_ENV=production
CMD [ "node", "build" ]
