function calcDailyScore(user, newScore) {
  const today = new Date();
  const lastUpdate = new Date(user.updated_at);
  if (lastUpdate.getDate() === today.getDate()) {
    return +user.dailyScore + +newScore;
  }
  return +newScore
}

const formatError = (error) => [
  { messages: [{ id: error.id, message: error.message, field: error.field }] },
];

module.exports = { calcDailyScore, formatError }