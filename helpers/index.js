function calcDailyScore(user, newScore) {
  const today = new Date();
  const lastUpdate = new Date(user.updated_at);
  if (lastUpdate.getDate() === today.getDate()) {
    return +user.dailyScore + +newScore;
  }
  return +newScore
}

function checkDailyTaskDone(user, taskType) {
  const today = new Date();
  const lastUpdate = new Date(user.updated_at);
  if (lastUpdate.getDate() === today.getDate()) {
    return user.tasks.some(task => task.type === taskType);
  }
  return false;
}

function checkResetDailyScore(user) {
  const today = new Date();
  const lastUpdate = new Date(user.updated_at);
  if (lastUpdate.getDate() === today.getDate()) {
    return false;
  }
  return true;
}

function updateUserBoosters(user) {
  const updatedBoosters = user.boosters.map(booster => ({
    ...booster,
    roundsLeft: booster.roundsLeft - 1
  }))
  const filteredBoosters = updatedBoosters.filter(booster => booster.roundsLeft > 0)
  return filteredBoosters;
}

const formatError = (error) => [
  { messages: [{ id: error.id, message: error.message, field: error.field }] },
];

module.exports = {
  checkResetDailyScore,
  calcDailyScore,
  updateUserBoosters,
  formatError,
  checkDailyTaskDone
}