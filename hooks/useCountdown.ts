import { useState, useEffect } from "react";

type CountdownResult = {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  formatted: string;
};

export function useCountdown(expiresAt: string): CountdownResult {
  const calculateTimeLeft = (): CountdownResult => {
    if (!expiresAt) {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
        formatted: "Expired",
      };
    }

    const now = new Date().getTime();
    const target = new Date(expiresAt).getTime();
    const difference = target - now;

    if (difference <= 0) {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
        formatted: "Expired",
      };
    }

    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    const formatted = `${hours}h: ${minutes}m: ${seconds}s`;

    return {
      hours,
      minutes,
      seconds,
      isExpired: false,
      formatted,
    };
  };

  const [timeLeft, setTimeLeft] = useState<CountdownResult>(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  return timeLeft;
}