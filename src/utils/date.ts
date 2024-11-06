import { format, differenceInSeconds } from 'date-fns'

/**
 * Calculates the time elapsed since a given start date and returns it as a formatted string.
 * This is useful for logging the time elapsed since a certain event.
 *
 * @param {Date} stardDate - The start date from which to calculate the elapsed time.
 * @returns {string} A string representing the time elapsed since the start date in the format `[+HH:MM:SS]`.
 */
export const timeSinceStart = (stardDate: Date): string => {
  const currentDate = new Date()
  let secondsDiff = differenceInSeconds(currentDate, stardDate)

  let hours = 0
  let minutes = 0
  let seconds = 0

  if (secondsDiff > 3600) {
    hours = Math.round(secondsDiff / 3600)
    secondsDiff = secondsDiff - hours * 3600
  }

  if (secondsDiff > 60) {
    minutes = Math.round(secondsDiff / 60)
    secondsDiff = secondsDiff - minutes * 3600
  }

  if (secondsDiff > 0) {
    seconds = secondsDiff
  }

  return `[+${hours < 10 ? `0${hours}` : hours}:${
    minutes < 10 ? `0${minutes}` : minutes
  }:${seconds < 10 ? `0${seconds}` : seconds}]`
}

/**
 * Formats a given date into a human-readable string.
 *
 * @param date - The date to format.
 * @returns A formatted string representing the date.
 */
export const formatDate = (date: Date): string => {
  return format(date, 'PPPP pppp')
}
