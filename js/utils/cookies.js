/**
 * Sets the cookie's value for the desired key.
 * @param {string} name
 * @param {string} value
 * @param {number} expires The amount of milliseconds since `1 January 1970 UTC` until the cookie expires.
 */
function setCookie(name, value, expires = Date.now()) {
    const date = new Date(expires);
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/;SameSite=Strict`;
}

/**
 * Gets the cookie stored at the given key.
 * @param {string} name The name of the cookie to get.
 * @return {null|string} May return null if nothing stored at the name.
 */
function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let c = 0; c < cookies.length; c++) {
        let cookie = cookies[c];
        while (cookie.charAt(0) === ' ') { cookie = cookie.substring(1); }
        if (cookie.indexOf(name) === 0)
            return cookie.substring(name.length + 1, cookie.length);
    }
    return null;
}
