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

const { Bot, InlineKeyboard } = require('grammy');

const bot = new Bot(process.env.TELEGRAM_BOT_KEY);

function createWelcomeMessage(ctx) {
  return (
    `Hi <b>${ctx.from.first_name || ''} ${ctx.from.last_name || ''}</b> 👋 \n\n` +
    'Ready for an exciting building adventure?\n\n' +
    'Here you can build incredible towers, earn points and exchange them for valuable coins that can become a real treasure!'
  );
}

const keyboard = new InlineKeyboard()
  .webApp('Start Game', 'https://get-info-about.me/')
  .row()
  .url('Join the community', 'https://t.me/box_stacker_community');

module.exports = () => {
  bot.on('pre_checkout_query', (ctx) => {
    return ctx.answerPreCheckoutQuery(true).catch((err) => {
      console.error('answerPreCheckoutQuery failed: ', err);
    });
  });
  
  // Create invoice
  bot.on('message:successful_payment', async (ctx) => {
    if (!ctx.message || !ctx.message.successful_payment || !ctx.from) {
      return;
    }
    try {
      await strapi.query('invoices').create({
        tgUserId: ctx.from.id,
        tgInvoiceId: ctx.message.successful_payment.telegram_payment_charge_id
      });
    } catch (error) {
      console.error(error);
    }
  });

  bot.command('start', (ctx) => {
    ctx.reply(
      createWelcomeMessage(ctx),
      {
        reply_markup: keyboard,
        parse_mode: 'HTML'
      }
    );
  });

  bot.start();

  console.log('Bot start successfully');

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
};
