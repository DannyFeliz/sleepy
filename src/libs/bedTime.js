// @ts-check

/**
 * @param {number} hours
 * @param {number} minutes
 * @param {string} period
 * @param {('wakeUp'|'sleepNow')} mode
 */
function calculateScheduledBedTime(hours, minutes, period, mode) {
  validateInputs(hours, minutes, period, mode);
  const baseDate = setHours(hours, period);
  baseDate.setMinutes(minutes);
  const sleepCycles = calculateCycles(baseDate, mode);

  return sleepCycles;
}

/**
 * @param {string} mode
 */
function getInitialCycleDuration(mode) {
  const DURATION_4_50_HRS_IN_MS = 270 * 60000;
  const DURATION_1_44_HRS_IN_MS = 104 * 60000;
  const cycles = {
    wakeUp: DURATION_4_50_HRS_IN_MS,
    sleepNow: DURATION_1_44_HRS_IN_MS,
  };

  return cycles[mode];
}
/**
 * @param {Date} baseDate
 * @param {string} mode
 */
function calculateCycles(baseDate, mode) {
  const DURATION_1_50_HRS_IN_MS = 90 * 60000;
  const SHORT_CYCLE_TIME_DURATION = DURATION_1_50_HRS_IN_MS;

  const sleepCycle1 = new Date(
    baseDate.getTime() - getInitialCycleDuration(mode),
  );
  const sleepCycle2 = new Date(
    sleepCycle1.getTime() - SHORT_CYCLE_TIME_DURATION,
  );
  const sleepCycle3 = new Date(
    sleepCycle2.getTime() - SHORT_CYCLE_TIME_DURATION,
  );
  const sleepCycle4 = new Date(
    sleepCycle3.getTime() - SHORT_CYCLE_TIME_DURATION,
  );

  const sleepCycleList = [sleepCycle4, sleepCycle3, sleepCycle2, sleepCycle1];

  return sleepCycleList.map(formatSleepCycle);
}

/**
 * @param {Date} date
 */
function isPostMeridiem(date) {
  return date.getHours() >= 12;
}

/**
 * @param {number} hours
 */
function formatHours(hours) {
  return hours === 12 ? 0 : hours;
}

/**
 * @param {number} hours
 * @param {string} period
 */
function setHours(hours, period) {
  const date = new Date();
  hours = formatHours(hours);

  if (period === 'AM') {
    date.setHours(hours);
  } else if (period === 'PM') {
    date.setHours(+hours + 12);
  }

  return date;
}
/**
 * @param {Date} date
 */
function getHours(date) {
  let hours;
  if (date.getHours() > 12) {
    hours = date.getHours() - 12;
  } else if (date.getHours() < 12 && date.getHours() !== 0) {
    hours = date.getHours();
  } else if (date.getHours() === 0 || date.getHours() === 12) {
    hours = 12;
  }

  return hours;
}

/**
 * @param {Date} date
 */
function getMinutes(date) {
  const leadingZero = date.getMinutes() < 10 ? '0' : '';
  return `${getHours(date)}:${leadingZero}${date.getMinutes()}`;
}

/**
 * @param {Date} date
 */
function formatSleepCycle(date) {
  return `${getMinutes(date)} ${isPostMeridiem(date) ? 'PM' : 'AM'}`;
}

/**
 * @param {number} hours
 * @param {number} minutes
 * @param {string} period
 * @param {string} mode
 */
function validateInputs(hours, minutes, period, mode) {
  if (!hours && hours !== 0) {
    throw new Error(
      `expects 'hours' to be a valid number but '${hours}' was received.`,
    );
  }

  if (!minutes && minutes !== 0) {
    throw new Error(
      `expects 'minutes' to be a valid number but '${minutes}' was received.`,
    );
  }

  if (!['AM', 'PM'].includes(period)) {
    throw new Error(
      `expects 'period' to be a valid option (AM | PM) but '${period}' was received.`,
    );
  }

  if (!['wakeUp', 'sleepNow'].includes(mode)) {
    throw new Error(
      `expects 'mode' to be a valid option (wakeUp | sleepNow) but '${mode}' was received.`,
    );
  }
}

module.exports = {
  calculateScheduledBedTime,
  isPostMeridiem,
  formatHours,
  setHours,
  getHours,
  getMinutes,
  formatSleepCycle,
  validateInputs,
  getInitialCycleDuration,
  calculateCycles,
};
