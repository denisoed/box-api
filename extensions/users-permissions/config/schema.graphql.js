const _ = require("lodash");

/**
 * Throws an ApolloError if context body contains a bad request
 * @param contextBody - body of the context object given to the resolver
 * @throws ApolloError if the body is a bad request
 */
function checkBadRequest(contextBody) {
  if (_.get(contextBody, "statusCode", 200) !== 200) {
    const message = _.get(contextBody, "error", "Bad Request");
    const exception = new Error(message);
    exception.code = _.get(contextBody, "statusCode", 400);
    exception.data = contextBody;
    throw exception;
  }
}

module.exports = {
  definition: /* GraphQL */ `
    type UsersPermissionsAuthResponse {
      jwt: String!
      user: UsersPermissionsUser!
    },

    type UserScore {
      success: Boolean!
      score: Int!
    },

    type UserDailyReward {
      success: Boolean!
      reward: Int!
    }

    type UserClaim {
      success: Boolean!
    }

    type UserCheckClaim {
      success: Boolean!
      claimUntil: String
    }
  `,
  query: `
    checkDailyReward: UserDailyReward!
    checkClaim: UserCheckClaim!
  `,
  mutation: `
    telegram(initDataUnsafe: String!): UsersPermissionsAuthResponse!,
    updateScore(score: Int!): UserScore!,
    collectDailyReward: UserDailyReward!,
    claim: UserClaim!
  `,
  resolver: {
    Query: {
      checkDailyReward: {
        description: "Check Daily Reward",
        resolverOf: "plugins::users-permissions.auth.checkDailyReward",
        resolver: async (obj, options, { context }) => {
          context.query = _.toPlainObject(options);
          await strapi.plugins[
            "users-permissions"
          ].controllers.auth.checkDailyReward(context);
          let output = context.body.toJSON
            ? context.body.toJSON()
            : context.body;
          checkBadRequest(output);
          return output;
        },
      },
      checkClaim: {
        description: "Check Claim",
        resolverOf: "plugins::users-permissions.auth.checkClaim",
        resolver: async (obj, options, { context }) => {
          context.query = _.toPlainObject(options);
          await strapi.plugins[
            "users-permissions"
          ].controllers.auth.checkClaim(context);
          let output = context.body.toJSON
            ? context.body.toJSON()
            : context.body;
          checkBadRequest(output);
          return output;
        },
      },
    },
    Mutation: {
      telegram: {
        description: "Telegram Auth",
        resolverOf: "plugins::users-permissions.auth.telegram",
        resolver: async (obj, options, { context }) => {
          context.query = _.toPlainObject(options);

          await strapi.plugins[
            "users-permissions"
          ].controllers.auth.telegram(context);
          let output = context.body.toJSON
            ? context.body.toJSON()
            : context.body;

          checkBadRequest(output);

          return output;
        },
      },

      updateScore: {
        description: "Update Score",
        resolverOf: "plugins::users-permissions.auth.updateScore",
        resolver: async (obj, options, { context }) => {
          context.query = _.toPlainObject(options);
          await strapi.plugins[
            "users-permissions"
          ].controllers.auth.updateScore(context);
          let output = context.body.toJSON
            ? context.body.toJSON()
            : context.body;
          checkBadRequest(output);
          return output;
        },
      },

      collectDailyReward: {
        description: "Collect Daily Reward",
        resolverOf: "plugins::users-permissions.auth.collectDailyReward",
        resolver: async (obj, options, { context }) => {
          context.query = _.toPlainObject(options);
          await strapi.plugins[
            "users-permissions"
          ].controllers.auth.collectDailyReward(context);
          let output = context.body.toJSON
            ? context.body.toJSON()
            : context.body;
          checkBadRequest(output);
          return output;
        },
      },

      claim: {
        description: "Claim",
        resolverOf: "plugins::users-permissions.auth.claim",
        resolver: async (obj, options, { context }) => {
          context.query = _.toPlainObject(options);
          await strapi.plugins[
            "users-permissions"
          ].controllers.auth.claim(context);
          let output = context.body.toJSON
            ? context.body.toJSON()
            : context.body;
          checkBadRequest(output);
          return output;
        },
      },
    },
  },
};
