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

const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.TELEGRAM_BOT_KEY);

function createWelcomeMessage(ctx) {
  return (
    `Hi <b>${ctx.from.first_name || ''} ${ctx.from.last_name || ''}</b> 👋 \n\n` +
    'Ready for an exciting building adventure?\n\n' +
    'Here you can build incredible towers, earn points and exchange them for valuable coins that can become a real treasure!'
  );
}

async function createInvoice(ctx) {
  const user = await strapi.query('user', 'users-permissions').findOne({ telegramId: ctx.from.id });
  if (user) {
    try {
      await strapi.query('invoices').create({
        user: user.id,
        tgInvoiceId: ctx.message.successful_payment.telegram_payment_charge_id
      });
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = () => {
  bot.on('pre_checkout_query', (ctx) => {
    return ctx.answerPreCheckoutQuery(true).catch((err) => {
      console.error('answerPreCheckoutQuery failed: ', err);
    });
  });
  
  // Create invoice
  bot.on('message', async (ctx) => {
    if (ctx.update.message.successful_payment) {
      createInvoice(ctx);
    }
  });

  bot.start((ctx) => {
    ctx.replyWithHTML(
      createWelcomeMessage(ctx),
      Markup.inlineKeyboard([
        [Markup.button.webApp('Start Game', 'https://get-info-about.me/')],
        [Markup.button.url('Join the community', 'https://t.me/box_stacker_community')],
      ]),
    );
  });

  bot.launch();

  console.log('Bot start successfully');

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
};
