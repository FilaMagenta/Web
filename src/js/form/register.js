async function changeAuthPage(isLogin) {
    const loginPanel = $id('login_panel');
    const registrationPanel = $id('register_panel');

    if (isLogin) {
        registrationPanel.classList.remove('show');
        await delay(150);
        registrationPanel.classList.add('d-none');
        loginPanel.classList.remove('d-none');
        await delay(10);
        loginPanel.classList.add('show');
    } else {
        loginPanel.classList.remove('show');
        await delay(150);
        loginPanel.classList.add('d-none');
        registrationPanel.classList.remove('d-none');
        await delay(10);
        registrationPanel.classList.add('show');
    }
}

window.addEventListener('load', () => {
    $id('register_change_button').addEventListener('click', async () => {
        await changeAuthPage(false);
    })
    $id('login_change_button').addEventListener('click', async () => {
        await changeAuthPage(true);
    })

    /** @type {HTMLInputElement} */
    const dniField = $id('register_dni');
    /** @type {HTMLInputElement} */
    const nameField = $id('register_name');
    /** @type {HTMLInputElement} */
    const surnameField = $id('register_surname');
    /** @type {HTMLInputElement} */
    const emailField = $id('register_email');
    /** @type {HTMLInputElement} */
    const passwordField = $id('register_password');
    /** @type {HTMLButtonElement} */
    const registerButton = $id('register_button');
    /** @type {HTMLSpanElement} */
    const registerButtonSpinner = $id('register_button_spinner');

    /** @type {HTMLFormElement} */
    const form = $id('register_form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        try {
            registerButton.disabled = true;
            registerButtonSpinner.classList.remove('d-none');

            const result = await register(dniField.value, nameField.value, surnameField.value, emailField.value, passwordField.value);
            if (result.success)
                await changeAuthPage(true);
            else
                showSnackbar(result.error_message);
        } finally {
            registerButton.disabled = false;
            registerButtonSpinner.classList.add('d-none');
        }
    });
});
