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
       const refund = await bot.api.refundStarPayment(event.tgUserId, event.tgInvoiceId);
       if (refund) {
         console.log('Refund done');
       }
     } catch (error) {
      console.log(error);
     }
   },
  }
};
