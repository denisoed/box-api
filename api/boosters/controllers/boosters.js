'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const { formatError } = require('../../../helpers')

module.exports = {
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
