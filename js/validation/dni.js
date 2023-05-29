/**
 * The sequence of characters associated with the DNI modulus.
 * @private
 * @type {string}
 */
const dniLetters = "TRWAGMYFPDXBNJZSQVHLCKE";

/**
 * Gets the letter associated with the passed dni.
 * @private
 * @param {string} dni The dni to use.
 * @return {string}
 */
function dniLetter(dni) {
    const numStr = dni.substring(0, 8);
    const num = parseInt(numStr);
    const mod = num % 23;
    return dniLetters[mod];
}

/**
 * Checks whether a DNI is valid or not.
 * @param {string} dni The DNI to be checked.
 * @return {boolean} Whether the DNI is valid.
 */
function validateDni(dni) {
    return dni.length === 9 && dniLetter(dni) === dni[8];
}
