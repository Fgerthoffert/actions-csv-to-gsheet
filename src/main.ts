/*
 * Dealing with types and the google-spreadsheet library seems tricky, disabling the following rules
 */
/* eslint-disable  @typescript-eslint/no-explicit-any */
/* eslint-disable  @typescript-eslint/no-unsafe-call */
/* eslint-disable  @typescript-eslint/no-unsafe-member-access */
/* eslint-disable  @typescript-eslint/no-unsafe-assignment */
import * as core from '@actions/core'
import * as fs from 'fs'
import { parse } from 'csv-parse/sync'

import {
  getWorksheet,
  timeSinceStart,
  formatDate,
  setHeaderRow,
  saveRow,
  addRow
} from './utils'

interface CSVData {
  [key: string]: string
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const startTime = new Date()
    core.info(`Started job at: ${formatDate(startTime)}`)

    // Load the CSV file into memory
    const csvFilepath: string = core.getInput('csv_filepath')
    if (!fs.existsSync(csvFilepath)) {
      throw new Error(`The file ${csvFilepath} does not exist.`)
    }

    const csvData: CSVData[] = parse(fs.readFileSync(csvFilepath, 'utf-8'), {
      columns: true,
      skip_empty_lines: true
    })
    core.info(`The CSV file contains ${csvData.length} records`)

    const workSheet: any = await getWorksheet({
      googleSpreadsheetId: core.getInput('gsheet_id'),
      googleClientEmail: core.getInput('gsheet_auth_email'),
      googleApiKey: core.getInput('gsheet_auth_pkey'),
      googleWorksheetTitle: core.getInput('gsheet_worksheet_title')
    })
    if (!workSheet || workSheet === null) {
      throw new Error(
        `Unable to access the worksheet ${core.getInput('gsheet_worksheet_title')}.`
      )
    }

    // Before pushing the data, we need to ensure that no header from the CSV file is missing in the worksheet
    await core.group(
      `${timeSinceStart(startTime)} 🗒️ Setting up worksheet rows if needed`,
      async () => {
        // Decrementing by one, since the worksheet starts at 1 while the array starts at 0
        const headerRowId = parseInt(core.getInput('gsheet_header_row'), 10)
        core.info(
          `Using spreadsheet row number ${headerRowId} as the title row`
        )
        const headerRow: number = parseInt(
          core.getInput('gsheet_header_row'),
          10
        )
        await workSheet.loadHeaderRow(headerRow)

        const missingHeaders: string[] = []
        const csvFirstRowKeys = Object.keys(csvData[0])
        core.info(
          `The following headers are present in the CSV file: ${JSON.stringify(csvFirstRowKeys)}`
        )
        core.info(
          `The following headers are present in the worksheet: ${JSON.stringify(workSheet.headerValues)}`
        )
        for (const header of csvFirstRowKeys) {
          if (!workSheet.headerValues.includes(header)) {
            missingHeaders.push(header)
          }
        }

        if (missingHeaders.length === 0) {
          core.info('All headers are present in the worksheet')
        } else {
          core.info(
            `The following rows are present in the CSV but missing in the worksheet: ${JSON.stringify(missingHeaders)}`
          )

          // Adding the missing headers to the worksheet
          const successful: boolean = await setHeaderRow(
            workSheet,
            missingHeaders
          )
          if (!successful) {
            throw new Error('Unable to set the header row, exiting...')
          }

          core.info(
            `Missing headers have been added to the worksheet, headers are now: ${JSON.stringify(workSheet.headerValues)}`
          )
        }
      }
    )

    const workSheetRows: any = await workSheet.getRows()

    // Push the data to the Google Spreadsheet one row at a time
    await core.group(
      `${timeSinceStart(startTime)} 🗄️ Pushing data in bulk to Google Sheets`,
      async () => {
        const rowId = core.getInput('gsheet_title_key')
        core.info(`Searching matching data using column: ${rowId} as an ID`)
        for (const csvRow of csvData) {
          // Search for the row in the worksheet that matches the current CSV row
          const matchingRow: any = workSheetRows.find((sheetRow: any) => {
            if (sheetRow.get(rowId) === csvRow[rowId]) {
              return true
            }
            return false
          })
          if (matchingRow) {
            core.info(
              `[UPDATE] - Data with id: ${csvRow[rowId]} found in Google Worksheet, updating an existing row`
            )
            for (const key in csvRow) {
              matchingRow.set(key, csvRow[key])
            }
            const successful: boolean = await saveRow(matchingRow)
            if (!successful) {
              throw new Error('Unable to update a row, exiting...')
            }
          } else {
            core.info(
              `[CREATE] - Data with id: ${csvRow[rowId]} not found in Google Worksheet, adding a new row`
            )
            const rowObject: CSVData = {}
            for (const key in csvRow) {
              rowObject[key] = csvRow[key]
            }
            const successful: boolean = await addRow(workSheet, rowObject)
            if (!successful) {
              throw new Error('Unable to create a row, exiting...')
            }
          }
        }
      }
    )

    if (core.getInput('gsheet_url') !== '') {
      core.notice(
        `Google Spreadsheet avaialble here: ${core.getInput('gsheet_url')}`
      )
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
