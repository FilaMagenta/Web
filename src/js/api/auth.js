/**
 * Attempts to log in using the API.
 * @param {string} dni
 * @param {string} password
 * @return {Promise<{success:boolean, data:?{token:string,expires:number}, error_code:?number, error_message:?string}>}
 */
async function login(dni, password) {
    return await (await getApi())?.post('auth/login', {nif: dni, password});
}

/**
 * Attempts to register in using the API.
 * @param {string} nif
 * @param {string} name
 * @param {string} surname
 * @param {string} email
 * @param {string} password
 * @return {Promise<{success:boolean, error_code:?number, error_message:?string}>}
 */
async function register(nif, name, surname, email, password) {
    return await (await getApi())?.post('auth/register', {nif, name, surname, email, password});
}
