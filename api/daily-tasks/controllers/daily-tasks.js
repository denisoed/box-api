'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

const { formatError, calcDailyScore } = require('../../../helpers')

module.exports = {
  async claimReward(ctx) {
    const { taskType } = ctx.request.body;
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
    const dailyTask = await strapi.query('daily-tasks').findOne({ type: taskType });
    if (!dailyTask) {
      return ctx.badRequest(
        null,
        formatError({
          id: 'Auth.form.error.dailyTask.notFound',
          message: 'Daily task not found',
        })
      );
    }
    if (user.tasks.some(task => task.type === taskType)) {
      return ctx.badRequest(
        null,
        formatError({
          id: 'Auth.form.error.dailyTask.alreadyClaimed',
          message: 'Daily task already claimed',
        })
      );
    }
    const newComponentTask = {
      __component: 'tasks.task',
      type: taskType,
    };
    user.score = +user.score + +dailyTask.reward;
    user.dailyScore = calcDailyScore(user, dailyTask.reward);
    user.tasks = [...user.tasks, newComponentTask];
    await strapi
      .query('user', 'users-permissions')
      .update({ id: user.id }, user);
    return ctx.send({ success: true, data: dailyTask });
  },
};
