const NUMBERS = require("../../constants/numbers");
const timeGap = 15;

function getPastISOTime(today) {
  today.setUTCHours(
    timeGap, 0, 0, 0,
  );

  const pastMidnightInMS = today;
  const pastAWeekAgoInMS = pastMidnightInMS - NUMBERS.A_WEEK_IN_MS;
  const pastAMonthAgoInMS = pastMidnightInMS - NUMBERS.A_MONTH_IN_MS;

  const pastMidnight = new Date(pastMidnightInMS).toISOString();
  const pastAWeekAgo = new Date(pastAWeekAgoInMS).toISOString();
  const pastAMonthAgo = new Date(pastAMonthAgoInMS).toISOString();

  return { pastMidnight, pastAWeekAgo, pastAMonthAgo };
}

module.exports = getPastISOTime;
