import { useEffect, useRef, useState } from "react";

import { playTimerFeedback } from "../utils/sound";

export const useCountdown = ({ initialSeconds = 0, settings }) => {
  const [secondsLeft, setSecondsLeft] = useState(Math.max(0, Number(initialSeconds || 0)));
  const [running, setRunning] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    setSecondsLeft(Math.max(0, Number(initialSeconds || 0)));
    completedRef.current = false;
  }, [initialSeconds]);

  useEffect(() => {
    if (!running) return undefined;
    const interval = setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  useEffect(() => {
    if (running && secondsLeft === 0 && !completedRef.current) {
      completedRef.current = true;
      setRunning(false);
      playTimerFeedback(settings);
    }
  }, [running, secondsLeft, settings]);

  return {
    secondsLeft,
    running,
    start: () => {
      completedRef.current = false;
      setRunning(true);
    },
    pause: () => setRunning(false),
    reset: (nextSeconds = initialSeconds) => {
      completedRef.current = false;
      setSecondsLeft(Math.max(0, Number(nextSeconds || 0)));
      setRunning(false);
    }
  };
};

export const useStopwatch = () => {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return undefined;
    const interval = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(interval);
  }, [running]);

  return {
    seconds,
    running,
    start: () => setRunning(true),
    pause: () => setRunning(false),
    reset: () => {
      setSeconds(0);
      setRunning(false);
    }
  };
};
