'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const { formatError } = require('../../../helpers')
const { Bot } = require('grammy');

const bot = new Bot(process.env.TELEGRAM_BOT_KEY);

module.exports = {
  async find(ctx) {
    const user = await strapi.query('user', 'users-permissions').findOne({ id: ctx.state.user.id });
    if (!user) {
      return ctx.badRequest(
        null,
        formatError({
          id: 'Auth.form.error.user.notFound',
          message: 'User not found',
        })
      );
    }

    const boosters = await strapi.query('boosters').find(ctx.query);
    const formattedBoosters = await Promise.all(
      boosters.map(async (b) => ({
        ...b,
        invoiceLink: b.stars ? await bot.api.createInvoiceLink(
          `x${b.reward} for ${b.rounds} rounds`,
          `This booster multiplies earned points by ${b.reward} for ${b.rounds} of rounds after purchase`,
          '{}',
          '', // Provider token must be empty for Telegram Stars
          'XTR',
          [{
            amount: b.stars,
            label: `x${b.reward} for ${b.rounds} rounds`,
          }],
        ) : null,
      }))
    )
    return formattedBoosters;
  },
  async buyBooster(ctx) {
    const { boosterType } = ctx.request.body;
    const user = await strapi.query('user', 'users-permissions').findOne({ id: ctx.state.user.id });
    if (!user) {
      return ctx.badRequest(
        null,
        formatError({
          id: 'Auth.form.error.user.notFound',
          message: 'User not found',
        })
      );
    }
    const booster = await strapi.query('boosters').findOne({ type: boosterType });
    if (!booster) {
      return ctx.badRequest(
        null,
        formatError({
          id: 'Auth.form.error.booster.notFound',
          message: 'Booster not found',
        })
      );
    }
    if (user.boosters.some(b => b.type === booster.type)) {
      return ctx.badRequest(
        null,
        formatError({
          id: 'Auth.form.error.booster.alreadyBuyed',
          message: 'Booster already buyed',
        })
      );
    }
    if (+user.score < +booster.price) {
      return ctx.badRequest(
        null,
        formatError({
          id: 'Auth.form.error.booster.notEnoughBalance',
          message: 'Not enough balance',
        })
      );
    }

    // Set booster to user
    const newComponentBooster = {
      __component: 'user.boosters',
      type: booster.type,
      roundsLeft: booster.rounds,
      reward: booster.reward
    };
    user.score = user.score - booster.price;
    user.boosters = [...user.boosters, newComponentBooster];
    await strapi
      .query('user', 'users-permissions')
      .update({ id: user.id }, user);
    return ctx.send({ success: true, data: booster });
  },
};
