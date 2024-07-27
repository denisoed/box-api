FROM node:20-alpine

ENV APP_ROOT /src
ENV NODE_ENV production

WORKDIR ${APP_ROOT}

COPY ./package.json ${APP_ROOT}
COPY ./yarn.lock ${APP_ROOT}

RUN yarn install --frozen-lockfile --production

COPY . ${APP_ROOT}

ARG telegram_bot_key
ENV TELEGRAM_BOT_KEY=${telegram_bot_key}

RUN yarn global add @nestjs/cli
RUN yarn build

CMD [ "yarn", "start:prod" ]