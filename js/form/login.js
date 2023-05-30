/**
 * Provides validation and listeners for login forms.
 * @file login.js
 */

window.addEventListener('load', function () {
    /** @type {HTMLInputElement} */
    const dniField = document.getElementById('login_dni');
    dniField.addEventListener('input', () => {
        const text = dniField.value;
        dniField.classList.remove('is-invalid', 'is-valid')
        if (!validateDni(text))
            dniField.classList.add('is-invalid');
        else
            dniField.classList.add('is-valid');
    });

    /** @type {HTMLInputElement} */
    const passwordField = document.getElementById('login_password');
    /** @type {HTMLButtonElement} */
    const loginButton = document.getElementById('login_button');
    /** @type {HTMLSpanElement} */
    const loginButtonSpinner = document.getElementById('login_button_spinner');

    /** @type {HTMLFormElement} */
    const form = document.getElementById('login_form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        dniField.disabled = true;
        passwordField.disabled = true;
        loginButton.disabled = true;
        loginButtonSpinner.classList.remove('d-none');

        try {
            const dni = dniField.value;
            if (!validateDni(dni)) {
                showSnackbar(getTranslation('login-error-dni'));
                return;
            }
            const password = passwordField.value;

            // Try logging in
            const result = await login(dni, password);
            if (result.success !== true || !result.hasOwnProperty('data')) return;
            const {token, expires} = result.data;
            setCookie('token', token, expires * 1000);
            window.location.reload();
        } finally {
            dniField.disabled = false;
            passwordField.disabled = false;
            loginButton.disabled = false;
            loginButtonSpinner.classList.add('d-none');
        }
    });
})
