document.documentElement.classList.add("js-enhanced");

const schedule = {
  monday: [],
  tuesday: [{ open: "17:30", close: "21:30" }],
  wednesday: [{ open: "11:30", close: "21:30" }],
  thursday: [{ open: "11:30", close: "21:30" }],
  friday: [{ open: "11:30", close: "21:30" }],
  saturday: [{ open: "11:30", close: "21:30" }],
  sunday: [{ open: "17:30", close: "21:30" }]
};

const weekdayOrder = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday"
];

const statusElement = document.getElementById("open-status");
const noteElement = document.getElementById("open-note");

function getMelbourneParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Melbourne",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  const parts = formatter.formatToParts(date);
  const data = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return {
    weekday: data.weekday.toLowerCase(),
    minutes: Number(data.hour) * 60 + Number(data.minute)
  };
}

function toMinutes(value) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function formatTime(value) {
  const [hour, minute] = value.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function capitalise(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function nextOpening(currentDayIndex, currentMinutes) {
  for (let offset = 0; offset < 7; offset += 1) {
    const candidateIndex = (currentDayIndex + offset) % 7;
    const candidateDay = weekdayOrder[candidateIndex];
    const windows = schedule[candidateDay];

    if (!windows.length) {
      continue;
    }

    for (const window of windows) {
      const openingMinutes = toMinutes(window.open);
      if (offset > 0 || openingMinutes > currentMinutes) {
        return { day: candidateDay, time: window.open };
      }
    }
  }

  return null;
}

function updateOpenStatus() {
  if (!statusElement || !noteElement) {
    return;
  }

  const { weekday, minutes } = getMelbourneParts();
  const dayIndex = weekdayOrder.indexOf(weekday);
  const todaysWindows = schedule[weekday] || [];

  const currentWindow = todaysWindows.find((window) => {
    const open = toMinutes(window.open);
    const close = toMinutes(window.close);
    return minutes >= open && minutes < close;
  });

  if (currentWindow) {
    statusElement.textContent = "Open now";
    noteElement.textContent = `Serving until ${formatTime(currentWindow.close)} Melbourne time today.`;
  } else {
    const next = nextOpening(dayIndex, minutes);
    statusElement.textContent = "Currently closed";
    noteElement.textContent = next
      ? `Reopens ${next.day === weekday ? "today" : capitalise(next.day)} at ${formatTime(next.time)} Melbourne time.`
      : "Trading hours are currently unavailable.";
  }

  const activeRow = document.querySelector(`[data-day="${weekday}"]`);
  if (activeRow) {
    activeRow.classList.add("is-today");
  }
}

function revealAll() {
  const items = document.querySelectorAll("[data-reveal]");
  if (!items.length) {
    return;
  }

  items.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 55, 300)}ms`;
  });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  requestAnimationFrame(() => {
    items.forEach((item) => item.classList.add("is-visible"));
  });
}

updateOpenStatus();
revealAll();
