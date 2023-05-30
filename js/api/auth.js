/**
 * Attempts to log in using the API.
 * @param {string} dni
 * @param {string} password
 * @return {Promise<{success:boolean, data:{token:string,expires:number}}>}
 */
async function login(dni, password) {
    return await (await getApi())?.post('auth/login', {dni, password});
}
