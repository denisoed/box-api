'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

const { Bot } = require('grammy');

const bot = new Bot(process.env.TELEGRAM_BOT_KEY);

module.exports = {
  lifecycles: {
    async afterDelete(event) {
     try {
       const refund = await bot.api.refundStarPayment(event.user.telegramId, event.tgInvoiceId);
       console.log(refund);
     } catch (error) {
      console.log(error);
     }
   },
  }
};
