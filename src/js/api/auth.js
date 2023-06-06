/**
 * Attempts to log in using the API.
 * @param {string} dni
 * @param {string} password
 * @return {Promise<{success:boolean, data:?{token:string,expires:number}, error_code:?number, error_message:?string}>}
 */
async function login(dni, password) {
    return await (await getApi())?.post('auth/login', {nif: dni, password});
}
