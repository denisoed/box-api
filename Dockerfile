FROM node:14.17.3

ENV APP_ROOT /src
ENV NODE_ENV production

WORKDIR ${APP_ROOT}

COPY ./package.json ${APP_ROOT}
COPY ./package-lock.json ${APP_ROOT}

RUN npm ci

COPY . ${APP_ROOT}

ARG telegram_bot_key
ARG cors_origin

ENV TELEGRAM_BOT_KEY=${telegram_bot_key}
ENV CORS_ORIGIN=${cors_origin}

RUN npm run build:production

CMD ["npm", "run", "start"]
