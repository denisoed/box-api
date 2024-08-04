"use strict";

/**
 * Auth.js controller
 *
 * @description: A set of functions called "actions" for managing `Auth`.
 */

/* eslint-disable no-useless-escape */
const _ = require("lodash");
const { sanitizeEntity } = require("strapi-utils");
const { validateInitDataUnsafe } = require("./helpers");
const { checkResetDailyScore, calcDailyScore } = require("../../../helpers");

const formatError = (error) => [
  { messages: [{ id: error.id, message: error.message, field: error.field }] },
];

function createUsername(user) {
  const firstName = user.first_name || "";
  const lastName = user.last_name || "";
  return `${firstName} ${lastName}`.trim();
}

function generateNewJWT(user) {
  const sanitizedUser = sanitizeEntity(user, {
    model: strapi.query("user", "users-permissions").model,
  });

  const jwt = strapi.plugins["users-permissions"].services.jwt.issue(
    _.pick(user, ["id"])
  );

  return {
    jwt,
    user: sanitizedUser,
  }
}

Date.prototype.addDays = function(days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
}

function verifyWebTgAuthData(data) {
  if ((new Date() - new Date(data.auth_date * 1000)) > 86400000) { // milisecond
    return false;
  }
  return validateInitDataUnsafe(data);
}

module.exports = {
  async telegram(ctx) {
    const today = new Date();
    const pluginStore = await strapi.store({
      environment: "",
      type: "plugin",
      name: "users-permissions",
    });

    const settings = await pluginStore.get({
      key: "advanced",
    });

    if (!settings.allow_register) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.advanced.allow_register",
          message: "Register action is currently disabled.",
        })
      );
    }

    const params = {
      ..._.omit(ctx.request.body, [
        "confirmed",
        "confirmationToken",
        "resetPasswordToken",
      ]),
      provider: "local",
      expiredAt: today.addDays(14)
    };

    const role = await strapi
      .query("role", "users-permissions")
      .findOne({ type: settings.default_role }, []);

    if (!role) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.role.notFound",
          message: "Impossible to find the default role.",
        })
      );
    }

    if (!params?.initDataUnsafe) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.initDataUnsafe",
          message: "Missing initDataUnsafe",
        })
      );
    }

    if (!verifyWebTgAuthData(params.initDataUnsafe)) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.initDataUnsafe",
          message: "Invalid initDataUnsafe",
        })
      );
    }

    const tgUser = params.initDataUnsafe.user;

    // fetch user based on subject
    const user = await strapi
      .query("user", "users-permissions")
      .findOne({ telegramId: tgUser.id });

    if (user) {
      const data = generateNewJWT(user);
      if (checkResetDailyScore(user)) {
        user.tasks = [];
        user.dailyScore = 0;
        strapi.query("user", "users-permissions").update({ id: user.id }, user);
      }
      return ctx.send(data);
    }

    params.role = role.id;
    params.telegramId = tgUser.id;
    params.username = tgUser.id;
    params.firstname = tgUser.first_name;
    params.lastname = tgUser.last_name;
    params.fullname = createUsername(tgUser);
    params.email = "";
    params.confirmed = true;

    try {
      const user = await strapi
        .query("user", "users-permissions")
        .create(params);

      const data = generateNewJWT(user);

      return ctx.send(data);
    } catch (err) {
      const adminError = _.includes(err.message, "username")
        ? {
            id: "Auth.form.error.username.taken",
            message: "Username already taken",
          }
        : err;
      ctx.badRequest(null, formatError(adminError));
    }
  },
  async updateScore(ctx) {
    const { score } = ctx.request.body;

    if (!score || score === 0 || typeof score !== "number") {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.score.missing",
          message: "Missing score",
        })
      );
    }

    if (score < 0) {
      return ctx.badRequest(
        null,
        formatError({
          id: "Auth.form.error.score.invalid",
          message: "Invalid score",
        })
      );
    }

    const user = await strapi
      .query("user", "users-permissions")
      .findOne({ id: ctx.state.user.id }, []);
    user.score = +user.score + +score;
    user.dailyScore = calcDailyScore(user, score);
    if (checkResetDailyScore(user)) {
      user.tasks = [];
    }
    await strapi
      .query("user", "users-permissions")
      .update({ id: user.id }, user);
    return ctx.send({ success: true, score: user.score });
  }
};
