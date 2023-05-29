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

    /** @type {HTMLFormElement} */
    const form = document.getElementById('login_form');
    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const dni = dniField.value;
        if (!validateDni(dni)) {
            showSnackbar(getTranslation('login-error-dni'));
            return;
        }
    });
})
