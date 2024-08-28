'use strict';

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/configurations.html#bootstrap
 */

const { Bot } = require('grammy');

const bot = new Bot(process.env.TELEGRAM_BOT_KEY);

module.exports = () => {
  bot.on('pre_checkout_query', (ctx) => {
    console.log('!!!!!!!!');
    return ctx.answerPreCheckoutQuery(true).catch((err) => {
      console.error('answerPreCheckoutQuery failed: ', err);
    });
  });

  bot.on('message:successful_payment', (ctx) => {
    console.log(
      ctx.from.id,
      ctx.message.successful_payment.telegram_payment_charge_id,
    );
    if (!ctx.message || !ctx.message.successful_payment || !ctx.from) {
      return;
    }
  });
};
