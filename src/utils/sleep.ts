/**
 * sleep for a number of milliseconds.
 * @param milliseconds The number of milliseconds to sleep.
 * @returns {Promise<string>} Resolves with 'done!' after the wait is over.
 */
export async function sleep(milliseconds: number): Promise<string> {
  return new Promise(resolve => {
    if (isNaN(milliseconds)) {
      throw new Error('milliseconds not a number')
    }

    setTimeout(() => resolve('done!'), milliseconds)
  })
}
