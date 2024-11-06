/*
 * Dealing with types and the google-spreadsheet library seems tricky, disabling the following rules
 */
/* eslint-disable  @typescript-eslint/no-explicit-any */
/* eslint-disable  @typescript-eslint/no-unsafe-call */
/* eslint-disable  @typescript-eslint/no-unsafe-member-access */
/* eslint-disable  @typescript-eslint/no-unsafe-assignment */
/* eslint-disable  @typescript-eslint/no-var-requires */
/* eslint-disable  @typescript-eslint/no-require-imports */
/* eslint-disable  @typescript-eslint/explicit-function-return-type */
import * as core from '@actions/core'

import { JWT } from 'google-auth-library'

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file'
]

// This is needed since google-spreadsheet is a commonjs module
const GoogleSpreadsheet = require('google-spreadsheet').GoogleSpreadsheet

/**
 * Finds a sheet in a Google Spreadsheet by its title.
 *
 * This will return the first sheet found, even if there are multiple sheets with the same title.
 *
 * @param {GoogleSpreadsheet} doc - The Google Spreadsheet document.
 * @param {string} title - The title of the sheet to find.
 * @returns {type of GoogleSpreadsheetWorksheet | null} - The sheet with the specified title, or null if not found.
 */
const findSheetByTitle = (
  doc: typeof GoogleSpreadsheet,
  title: string
): any => {
  const sheetCount = doc.sheetCount
  for (let i = 0; i < sheetCount; i++) {
    core.info(`Found sheet with title: ${doc.sheetsByIndex[i].title}`)
    if (doc.sheetsByIndex[i].title === title) {
      return doc.sheetsByIndex[i]
    }
  }
  return null
}

/**
 * Retrieves a worksheet from a Google Spreadsheet using the provided credentials and worksheet title.
 *
 * @param {Object} params - The parameters for retrieving the worksheet.
 * @param {string} params.googleSpreadsheetId - The ID of the Google Spreadsheet.
 * @param {string} params.googleClientEmail - The client email for Google API authentication.
 * @param {string} params.googleApiKey - The API key for Google API authentication.
 * @param {string} params.googleWorksheetTitle - The title of the worksheet to retrieve.
 * @returns {Promise<GoogleSpreadsheetWorksheet>} A promise that resolves to the found worksheet.
 */
export const getWorksheet = async ({
  googleSpreadsheetId,
  googleClientEmail,
  googleApiKey,
  googleWorksheetTitle
}: {
  googleSpreadsheetId: string
  googleClientEmail: string
  googleApiKey: string
  googleWorksheetTitle: string
}): Promise<any> => {
  const jwt = new JWT({
    email: googleClientEmail,
    key: Buffer.from(googleApiKey, 'base64').toString(),
    scopes: SCOPES
  })

  const doc = new GoogleSpreadsheet(googleSpreadsheetId, jwt)
  core.info(`Loading data from spreadsheet`)

  await doc.loadInfo()

  core.info(`Searching for sheet with title: ${googleWorksheetTitle}`)
  return findSheetByTitle(doc, googleWorksheetTitle)
}
