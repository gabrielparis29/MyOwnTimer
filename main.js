const background = document.querySelector(".background");


let currentMode = "work";

const lapButton = document.querySelector("#lap-button");
const splitButton = document.querySelector("#split-button");
const workMode = document.querySelector(".work");
const restMode = document.querySelector(".rest");

function closeInterval() {
    if (currentIntervalTime === 0) {
        return false;
    }

    recordInterval();

    currentIntervalTime = 0;

    if (isRunning) {
        startTime = Date.now();
        intervalStartTimestamp = Date.now();
    } else {
        intervalStartTimestamp = null;
    }

    timeDisplay.textContent = formatTime(currentIntervalTime);
    return true;
}

function switchMode() {
    if (currentMode === "work") {
        currentMode = "rest";

        workMode.classList.remove("active");
        restMode.classList.add("active");

        background.classList.remove("work");
        background.classList.add("rest");
    } else {
        currentMode = "work";

        restMode.classList.remove("active");
        workMode.classList.add("active");

        background.classList.remove("rest");
        background.classList.add("work");
    }
}

// Original lap: record + reset + change mode
lapButton.addEventListener("click", () => {
    if (closeInterval()) {
        switchMode();
    }
});

// New lap: record + reset, stays in the current mode
splitButton.addEventListener("click", closeInterval);

let playPauseButton = document.querySelector("#playPause-button");
let playIcon = document.getElementById("play-icon");

let isRunning = false;

playPauseButton.addEventListener("click", () => {

    isRunning = !isRunning;

    if (isRunning) {

        playIcon.src = "icons/pause.png";

        startTime = Date.now() - (currentIntervalTime * 1000);
        totalStartTime = Date.now() - (totalTime * 1000);

        if (intervalStartTimestamp === null) {
            intervalStartTimestamp = Date.now();
        }

        timerId = setInterval(updateTimer, 1000);

    } else {

        playIcon.src = "icons/play.png";

        clearInterval(timerId);
        timerId = null;

    }

});

const timeDisplay = document.querySelector(".time");
let currentIntervalTime = 0;
let totalTime = 0;

let startTime = null;
let totalStartTime = null;
let intervalStartTimestamp = null;

let timerId = null;

const totalTimeDisplay = document.querySelector("#total-time");

function updateTimer() {
    currentIntervalTime = Math.floor((Date.now() - startTime) / 1000);
    totalTime = Math.floor((Date.now() - totalStartTime) / 1000);

    timeDisplay.textContent = formatTime(currentIntervalTime);
    totalTimeDisplay.textContent = formatTime(totalTime);
}

function formatTime(timeInSeconds) {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

let intervals = [];
const intervalHistory = document.querySelector(".IntervalHistory");

const totalWorkDuration = document.querySelector("#total-work-duration");
const totalRestDuration = document.querySelector("#total-rest-duration");

function updateTotalDurations() {
    const totalWork = intervals
        .filter(interval => interval.mode === "work")
        .reduce((sum, interval) => sum + interval.duration, 0);

    const totalRest = intervals
        .filter(interval => interval.mode === "rest")
        .reduce((sum, interval) => sum + interval.duration, 0);

    totalWorkDuration.textContent = `${formatTime(totalWork)}`;
    totalRestDuration.textContent = `${formatTime(totalRest)}`;
}


function recordInterval() {
    intervals.push({
        mode: currentMode,
        duration: currentIntervalTime,
        startTime: intervalStartTimestamp,
        note: ""
    });

    renderIntervals();
    updateTotalDurations();
}

function renderIntervals() {
    intervalHistory.innerHTML = "";

    intervals.slice().reverse().forEach((interval) => {

        const intervalElement = document.createElement("div");

        intervalElement.classList.add("interval");
        intervalElement.classList.add(`interval-${interval.mode}`);

        // Name
        const name = document.createElement("p");
        name.classList.add("notBold");

        const modeIntervals = intervals.filter(
            item => item.mode === interval.mode
        );

        const occurrence = modeIntervals.indexOf(interval) + 1;

        const modeName = interval.mode === "work" ? "T" : "D";

        name.textContent = `${modeName}-${occurrence}`;

        // Duration
        const duration = document.createElement("p");
        duration.classList.add("bold");
        duration.textContent = formatTime(interval.duration);

        // Divider
        const divider = document.createElement("div");
        divider.classList.add("interval-divider");

        // Start time
        const intervalTime = document.createElement("p");
        intervalTime.classList.add("interval-time");

        const start = new Date(interval.startTime);

        const startFormatted = start.toLocaleTimeString("es-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        }).toLocaleLowerCase();

        intervalTime.textContent = startFormatted;

        // Note
        const note = document.createElement("input");
        note.type = "text";
        note.classList.add("interval-note");
        note.placeholder = "Add a note...";
        note.value = interval.note;

        note.addEventListener("input", () => {
            interval.note = note.value;
        });

        // Build interval
        intervalElement.appendChild(name);
        intervalElement.appendChild(duration);
        intervalElement.appendChild(divider);
        intervalElement.appendChild(intervalTime);
        intervalElement.appendChild(note);

        intervalHistory.appendChild(intervalElement);
    });
}