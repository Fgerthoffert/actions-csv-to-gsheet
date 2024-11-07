/* eslint-disable  @typescript-eslint/no-explicit-any */
/* eslint-disable  @typescript-eslint/no-unsafe-call */
/* eslint-disable  @typescript-eslint/no-unsafe-member-access */
/* eslint-disable  @typescript-eslint/no-unsafe-assignment */

import { sleep } from './'
import * as core from '@actions/core'

/*
  This file contains write operations and is used to apply a retry mechanism if write operations are not successful.
*/

/**
 * Sets the header row of a worksheet, retrying up to a maximum number of attempts if it fails.
 *
 * @param {any} workSheet - The worksheet object where the header row will be set.
 * @param {any} missingHeaders - The headers that are missing and need to be added to the worksheet.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the operation was successful.
 *
 * @remarks
 * This function attempts to set the header row of the provided worksheet. If the operation fails, it will retry
 * up to a maximum of 3 times, waiting 60 seconds between each retry. After the retries, it waits an additional
 * 1 second before returning the result.
 */
export const setHeaderRow = async (
  workSheet: any,
  missingHeaders: any
): Promise<boolean> => {
  const maxRetries = 3
  let retries = 0
  let successful = false
  while (successful === false && retries < maxRetries) {
    await workSheet
      .setHeaderRow([...workSheet.headerValues, ...missingHeaders])
      .then(() => {
        successful = true
      })
      .catch((error: any) => {
        core.warning(`Error setting header row: ${JSON.stringify(error)}`)
      })
    if (successful === false) {
      core.info(`Retrying in 60 second...`)
      await sleep(60000)
    }
    retries++
  }
  await sleep(1000)
  return successful
}

/**
 * Saves a row with retry logic.
 *
 * This function attempts to save a row up to a maximum number of retries.
 * If the save operation fails, it waits for a specified amount of time before retrying.
 *
 * @param matchingRow - The row object to be saved. It should have a `save` method that returns a promise.
 * @returns A promise that resolves to a boolean indicating whether the save operation was successful.
 */
export const saveRow = async (matchingRow: any): Promise<boolean> => {
  const maxRetries = 3
  let retries = 0
  let successful = false
  while (successful === false && retries < maxRetries) {
    await matchingRow
      .save()
      .then(() => {
        successful = true
      })
      .catch((error: any) => {
        core.warning(`Error in saving a row: ${JSON.stringify(error)}`)
      })
    if (successful === false) {
      core.info(`Retrying in 60 second...`)
      await sleep(60000)
    }
    retries++
  }
  await sleep(1000)
  return successful
}

/**
 * Adds a row to the given worksheet with retry logic.
 *
 * @param workSheet - The worksheet object where the row will be added.
 * @param rowObject - The row data to be added to the worksheet.
 * @returns A promise that resolves to a boolean indicating whether the row was successfully added.
 *
 * The function attempts to add the row up to a maximum of 3 retries in case of failure.
 * If an error occurs, it logs a warning and retries after a 60-second delay.
 * After all retries, it waits for an additional second before returning the result.
 */
export const addRow = async (
  workSheet: any,
  rowObject: any
): Promise<boolean> => {
  const maxRetries = 3
  let retries = 0
  let successful = false
  while (successful === false && retries < maxRetries) {
    await workSheet
      .addRow(rowObject)
      .then(() => {
        successful = true
      })
      .catch((error: any) => {
        core.warning(`Error adding a row: ${JSON.stringify(error)}`)
      })
    if (successful === false) {
      core.info(`Retrying in 60 second...`)
      await sleep(60000)
    }
    retries++
  }
  await sleep(1000)
  return successful
}
