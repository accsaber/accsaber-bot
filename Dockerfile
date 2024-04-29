FROM node:20-slim AS build

RUN apt-get update && apt-get -y install python3 build-essential

WORKDIR /app
COPY ["./package.json", "package-lock.json", "./"]
RUN npm ci
COPY . .
RUN rm -r ./src/superSecretRewardStuff

RUN npm run build
ENV NODE_ENV=production
RUN npm prune --omit=dev

FROM node:20-slim
WORKDIR /app
COPY --from=build /app/ .

CMD ["node", "build/Bot.js"]
