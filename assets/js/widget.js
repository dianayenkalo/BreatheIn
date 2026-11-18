document.addEventListener("DOMContentLoaded", () => {
  const durationInput = document.getElementById("duration-minutes");
  const goalSelect = document.getElementById("goal-select");
  const stressInput = document.getElementById("stress-level");
  const stressValue = document.getElementById("stress-value");
  const silenceOption = document.getElementById("silence-opt");
  const durationError = document.getElementById("error-duration");
  const resultExercise = document.getElementById("result-exercise");
  const resultCycles = document.getElementById("result-cycles");
  const resultSession = document.getElementById("result-session");
  const resultSessionsDay = document.getElementById("result-sessions-day");
  const resultTotal = document.getElementById("result-total");

  const results = [
    resultExercise,
    resultCycles,
    resultSession,
    resultSessionsDay,
    resultTotal,
  ];

  if (
    !durationInput ||
    !goalSelect ||
    !stressInput ||
    !stressValue ||
    !silenceOption ||
    !durationError ||
    results.some((result) => !result)
  ) {
    throw new Error("Не знайдено необхідні елементи віджета дихальної практики.");
  }

  const exercises = {
    calm: { name: "Дихання 4-7-8", cycleSeconds: 19, moodKey: "Тривога" },
    focus: { name: "Квадратне дихання", cycleSeconds: 16, moodKey: "Втома" },
    release: { name: "Довгий видих", cycleSeconds: 12, moodKey: "Роздратування" },
  };
  const initialDurationClasses = [
    "border-[#8FD1C2]",
    "focus:border-[#2F6F9F]",
    "focus:ring-[#2F6F9F]",
  ];
  let durationTouched = false;

  const clearResults = () => {
    results.forEach((result) => {
      result.textContent = "—";
    });
  };

  const restoreDurationField = () => {
    durationInput.classList.remove(
      "border-red-500",
      "focus:border-red-500",
      "focus:ring-red-500",
    );
    durationInput.classList.add(...initialDurationClasses);
    durationInput.removeAttribute("aria-invalid");
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return remainingSeconds === 0
      ? `${minutes} хв`
      : `${minutes} хв ${remainingSeconds} с`;
  };

  const updateWidget = () => {
    stressValue.textContent = stressInput.value;

    if (!durationTouched) {
      durationError.textContent = "";
      durationError.classList.add("hidden");
      restoreDurationField();
      clearResults();
      return;
    }

    const rawMinutes = durationInput.value.trim();
    const minutes = Number(rawMinutes);
    const validDuration =
      rawMinutes !== "" &&
      Number.isFinite(minutes) &&
      Number.isInteger(minutes) &&
      minutes >= 1 &&
      minutes <= 10;

    if (!validDuration) {
      durationError.textContent = "Введіть від 1 до 10 хвилин";
      durationError.classList.remove("hidden");
      durationInput.classList.remove(
        "border-[#8FD1C2]",
        "focus:border-[#2F6F9F]",
        "focus:ring-[#2F6F9F]",
      );
      durationInput.classList.add(
        "border-red-500",
        "focus:border-red-500",
        "focus:ring-red-500",
      );
      durationInput.setAttribute("aria-invalid", "true");
      clearResults();
      return;
    }

    durationError.textContent = "";
    durationError.classList.add("hidden");
    restoreDurationField();

    const exercise = exercises[goalSelect.value];
    const stress = Number(stressInput.value);
    const validStress =
      Number.isFinite(stress) &&
      Number.isInteger(stress) &&
      stress >= 1 &&
      stress <= 10;

    if (!exercise || !validStress) {
      clearResults();
      return;
    }

    const breathingSeconds = minutes * 60;
    const cycles = Math.floor(breathingSeconds / exercise.cycleSeconds);
    const silenceEnabled = silenceOption.isConnected && silenceOption.checked;
    const sessionSeconds = breathingSeconds + (silenceEnabled ? 60 : 0);
    const sessionsPerDay = stress <= 3 ? 1 : stress <= 6 ? 2 : 3;
    const totalSeconds = sessionSeconds * sessionsPerDay;

    const exerciseLink = document.createElement("a");
    exerciseLink.textContent = exercise.name;
    exerciseLink.href = "#timer-card";
    exerciseLink.setAttribute(
      "aria-label",
      `Перейти до вправи: ${exercise.name}`,
    );
    exerciseLink.classList.add(
      "text-[#2F6F9F]",
      "underline",
      "hover:text-[#245A82]",
      "focus:outline-none",
      "focus:ring-2",
      "focus:ring-[#2F6F9F]",
      "rounded",
    );
    exerciseLink.addEventListener("click", () => {
      document.dispatchEvent(
        new CustomEvent("breathein:select-exercise", {
          detail: {
            mood: exercise.moodKey,
            cycles,
            silenceSeconds: silenceEnabled ? 60 : 0,
          },
        }),
      );
    });
    resultExercise.replaceChildren(exerciseLink);
    resultCycles.textContent = String(cycles);
    resultSession.textContent = formatDuration(sessionSeconds);
    resultSessionsDay.textContent = String(sessionsPerDay);
    resultTotal.textContent = formatDuration(totalSeconds);
  };

  const touchDuration = () => {
    durationTouched = true;
    updateWidget();
  };

  durationInput.addEventListener("input", touchDuration);
  durationInput.addEventListener("blur", touchDuration);
  stressInput.addEventListener("input", updateWidget);
  goalSelect.addEventListener("change", updateWidget);
  silenceOption.addEventListener("change", updateWidget);

  updateWidget();
});
