/**
 * Provides validation and listeners for login forms.
 * @file login.js
 */

const login_logger = new Logger('login', '#17d937')

const LOGIN_ERROR_WRONG_PASSWORD = 56;

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
            login_logger.log(`Logging in as ${dni}...`);
            const result = await login(dni, password);
            if (result.success !== true || !result.hasOwnProperty('data')) {
                const errorCode = result.error_code;
                switch (errorCode) {
                    case LOGIN_ERROR_WRONG_PASSWORD:
                        showSnackbar(getTranslation('login-error-password'));
                        break;
                    default:
                        login_logger.error(`Could not log in. Error (${result.error_code}): ${result.error_message}`);
                        break;
                }
                return;
            }

            const {token, expires} = result.data;
            setCookie('token', token, expires * 1000);
            window.location.reload();
        } catch (err) {
            login_logger.error('Login error:', err);
        } finally {
            dniField.disabled = false;
            passwordField.disabled = false;
            loginButton.disabled = false;
            loginButtonSpinner.classList.add('d-none');
        }
    });
})
