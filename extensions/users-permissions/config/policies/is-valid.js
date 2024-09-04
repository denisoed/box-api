'use strict';

/**
 * `is-valid` policy.
 */
const formatError = (error) => [
  { messages: [{ id: error.id, message: error.message, field: error.field }] },
];

function generateFutureTimestamp({ years = 0, months = 0, days = 0, hours = 0, minutes = 0, seconds = 0 }) {
  const now = new Date();
  now.setFullYear(now.getFullYear() + years);
  now.setMonth(now.getMonth() + months);
  now.setDate(now.getDate() + days);
  now.setHours(now.getHours() + hours);
  now.setMinutes(now.getMinutes() + minutes);
  now.setSeconds(now.getSeconds() + seconds);
  const isoString = now.toISOString();
  return Math.floor(new Date(isoString).getTime() / 1000);
}

module.exports = async (ctx, next) => {
  const body = ctx.request.body;
  const ts = body?.timestamp / 1000;
  const toleranceSec = 2;
  const serverTimestampEnd = generateFutureTimestamp({
    years: 10,
    days: 8,
    hours: 18,
    seconds: toleranceSec
  });
  if (serverTimestampEnd >= ts) {
    return await next();
  }
  return ctx.badRequest(
    null,
    formatError({
      id: "Auth.form.error.invalid",
      message: "Invalid request",
    })
  );
};
