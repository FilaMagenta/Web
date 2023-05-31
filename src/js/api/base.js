const api_logger = new Logger('api', '#e1d00e');

/**
 * Performs an HTTP GET request to the desired URL.
 * @private
 * @param {string} url
 * @param {?Map<string, string>} headers
 * @return {Promise<string>}
 */
function httpGet(url, headers = null) {
    const http = new XMLHttpRequest();
    http.open('GET', url, true);
    if (headers != null)
        headers.forEach((value, key) => {
            http.setRequestHeader(key, value);
        })

    return new Promise((resolve, reject) => {
        http.onreadystatechange = () => {
            // Wait until complete
            if (http.readyState !== 4 || http.status !== 200) return;

            resolve(http.responseText)
        };
        http.onerror = () => { reject(new Error(`Error ${http.status}: ${http.statusText}`)); };
        api_logger.log('Running GET request to', url);
        http.send();
    });
}

/**
 * Performs an HTTP GET request to the desired URL.
 * @private
 * @param {string} url
 * @param {Object} data Some data to append to the body of the request. Formats to JSON.
 * @param {?Map<string, string>} headers
 * @return {Promise<string>}
 */
function httpPost(url, data = {}, headers = null) {
    const http = new XMLHttpRequest();
    http.open('POST', url, true);
    http.setRequestHeader('Content-Type', 'application/json');
    if (headers != null)
        headers.forEach((value, key) => {
            http.setRequestHeader(key, value);
        })

    return new Promise((resolve, reject) => {
        http.onreadystatechange = () => {
            // Wait until done
            if (http.readyState !== 4) return;
            if (http.status >= 200 && http.status < 300)
                resolve(http.responseText)
            else
                reject(http.responseText);
        };
        http.onerror = () => { reject(new Error(`Error ${http.status}: ${http.statusText}`)); };
        api_logger.log('Running POST request to', url);
        http.send(JSON.stringify(data));
    });
}

class API {
    /**
     * Builds a new API interface.
     * @param {string} server The url of the target server. Do not add any trailing slashes (/). Specify protocol.
     * @param {'v1'} version The version of the API to use.
     */
    constructor(server, version = 'v1') {
        this.server = server;
        this.version = version;
    }

    /**
     * The target server's address.
     * @private
     * @readonly
     * @type {string}
     */
    server;

    /**
     * The version of the api to use, e.g. 'v1'.
     * @private
     * @readonly
     * @type {'v1'}
     */
    version;

    /**
     * Stores the token to use for authentication, if any.
     * @private
     * @type {?string}
     */
    _token = null;

    /**
     * Checks the connection with the target server.
     * @return {Promise<string>}
     */
    ping() { return httpGet(`${this.server}/${this.version}`); }

    /**
     * Updates the currently stored token.
     * @param {?string} token
     */
    setToken(token) { this._token = token; }

    /**
     * @typedef {Object} Result
     * @property {boolean} success
     * @property {?Object} data
     */

    /**
     * Performs an HTTP GET request to the desired endpoint.
     * @param {string} endpoint The endpoint to make the request to. Relative to the server url. Do not append any
     * leading slashes.
     * @return {Promise<Result>}
     */
    async get(endpoint) {
        /** @type {Map<string, string>} */ const headers = new Map();
        headers.set('Authorization', `Bearer ${this._token}`);

        const result = await httpGet(`${this.server}/${this.version}/${endpoint}`, headers);
        return JSON.parse(result);
    }

    /**
     * Performs an HTTP POST request to the desired endpoint.
     * @param {string} endpoint The endpoint to make the request to. Relative to the server url. Do not append any
     * leading slashes.
     * @param {Object} data Some optional data to append to the body of the request. Formats to JSON.
     * @return {Promise<Result>}
     */
    post(endpoint, data) {
        /** @type {Map<string, string>} */ const headers = new Map();
        headers.set('Authorization', `Bearer ${this._token}`);

        return new Promise((resolve) => {
            httpPost(`${this.server}/${this.version}/${endpoint}`, data, headers)
                .then(result => { resolve(JSON.parse(result)) })
                .catch(result => { resolve(JSON.parse(result)) })
        })
    }
}

/**
 * @private
 * @type {?API}
 */
let api = null;

/**
 * Gives access to the API, if available. Drops after timeout.
 * @param {number} timeout The amount of time in milliseconds to wait until giving up for API access.
 * @return {Promise<?API>} Returns a reference to the API instance, or null if timed out.
 */
function getApi(timeout = 10_000) {
    const start = Date.now();
    return new Promise(waitForApi);

    function waitForApi(resolve, reject) {
        if (api != null)
            resolve(api);
        else if (timeout && (Date.now() - start) >= timeout)
            reject(new Error('Waiting for API timed out.'))
        else
            setTimeout(waitForApi.bind(this, resolve, reject), 30)
    }
}

window.addEventListener('load', async () => {
    /** @type {string} */
    const server = apiConfig.server;
    try {
        const target = new API(server);
        await target.ping();
        api_logger.log(`Server is available at ${server}!`);

        const token = getCookie('token');
        target.setToken(token)

        api = target;
    } catch (err) {
        api_logger.error('Remote server is not correctly configured: server', server, 'not available.', err);
        alert('INTERNAL EXCEPTION!');
    }
});
