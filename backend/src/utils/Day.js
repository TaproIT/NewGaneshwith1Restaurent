// at top
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
dayjs.extend(utc);
dayjs.extend(timezone);

const TZ = "Asia/Colombo";

// Helpers in controller
function sodTZ(d) {                 // start-of-day in Colombo
    return d ? dayjs(d).tz(TZ).startOf('day') : null;
}

function clampToTodayTZ(d, todaySOD) {
    if (!d) return null;
    const t = sodTZ(d);
    return t.isAfter(todaySOD) ? todaySOD : t;
}

function diffNightsTZ(start, end) {
    if (!start || !end) return 0;
    const s = start.valueOf();
    const e = end.valueOf();
    const MS_PER_DAY = 24*60*60*1000;
    const raw = Math.ceil((e - s) / MS_PER_DAY);
    return Math.max(raw, 1);
}
