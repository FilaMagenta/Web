/**
 * Blocks the current thread until a given amount of time has passed.
 * @param {number} millis The number of milliseconds to delay.
 * @return {Promise<void>}
 */
function delay(millis) {
    return new Promise((resolve) => {
        setTimeout(() => { resolve() }, millis)
    })
}
