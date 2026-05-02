import { useEffect, useMemo, useState } from "react";

function formatInTimeZone(date, timeZone, options) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      ...options,
    }).format(date);
  } catch {
    return "Unavailable";
  }
}

export function useDestinationTime(timeZone) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  return useMemo(() => {
    if (!timeZone) {
      return {
        timeLabel: "Unavailable",
        dateLabel: "Unavailable",
      };
    }

    return {
      timeLabel: formatInTimeZone(now, timeZone, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
      dateLabel: formatInTimeZone(now, timeZone, {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    };
  }, [now, timeZone]);
}

