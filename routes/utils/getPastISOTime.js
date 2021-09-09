const NUMBERS = require("../../constants/numbers");
const timeGap = 15;

function getPastISOTime(today) {
  today.setUTCHours(
    timeGap, 0, 0, 0,
  );

  const pastMidnightInMS = today;
  const pastAWeekAgoInMS = pastMidnightInMS - NUMBERS.A_WEEK_IN_MS;
  const pastAMonthAgoInMS = pastMidnightInMS - NUMBERS.A_MONTH_IN_MS;

  const pastMidnight = new Date(pastMidnightInMS);
  const pastAWeekAgo = new Date(pastAWeekAgoInMS);
  const pastAMonthAgo = new Date(pastAMonthAgoInMS);

  return { pastMidnight, pastAWeekAgo, pastAMonthAgo };
}

module.exports = getPastISOTime;
