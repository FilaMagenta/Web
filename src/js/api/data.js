const dataLogger = new Logger('data', '#d91b1b')

/**
 * @callback PropertyFiller
 * @template ValueType
 * @param {Element} element
 * @param {ValueType} value
 */

/**
 * @typedef {Object} User
 * @property {'DEFAULT','ADMIN'} role
 * @property {string} name
 * @property {string} surname
 * @property {string} nif
 * @property {string} email
 */

/**
 * Replaces a property of all the elements in the body that have the given class with the passed text.
 * @template ValueType
 * @param {string} className The classname to find.
 * @param {ValueType} value The value to set on each element.
 * @param {PropertyFiller<ValueType>} setter A function which is what updates the desired property.
 */
function fillWithClass(className, value, setter = (element, value) => { element.innerText = value; }) {
    const elements = document.getElementsByClassName(className);
    for (const element of elements) {
        setter(element, value)
    }
}

/**
 * @type {?User}
 */
let user;


/**
 * @private
 * @type {PropertyFiller<Object>}
 */
const _updateUserField = (element, value) => {
    const property = element.getAttribute('data-property');
    element.value = value[property] ?? getTranslation('status-not-set');
}

/**
 * Updates all the fields with the value of user.
 */
function refreshUserDisplay() {
    // FILL FIELDS
    fillWithClass('fill-user-name', `${user.name} ${user.surname}`);
    fillWithClass('user-field', user, _updateUserField);

    // SHOW IF ADMIN
    [...document.getElementsByClassName('show-if-admin')].forEach(
        el => {
            if (user.role === 'ADMIN') el.classList.remove('d-none')
            else el.classList.add('d-none')
        }
    )

    // ADD ACTIONS
    document.querySelectorAll('[data-action="logout"]').forEach(element => {
        element.addEventListener('click', () => {
            clearCookie('token');
            window.location.reload();
        })
    });

    // Update all fields
    document.querySelectorAll('.form-outline').forEach((formOutline) => {
        new mdb.Input(formOutline).init();
    });
}

window.addEventListener('load', async () => {
    const token = getCookie('token');
    if (token == null) return;

    // First load the cached user data
    const userStr = localStorage.getItem('user');
    if (userStr != null) {
        user = JSON.parse(userStr);
        refreshUserDisplay();
    }

    // TODO: Show errors
    // TODO: Show loading indicator
    const api = await getApi();
    dataLogger.log('Getting account data...');
    api?.get('profile').then((result) => {
        // If not successful, return
        if (result.success !== true) return;
        user = result.data;

        localStorage.setItem('user', JSON.stringify(user));

        refreshUserDisplay()
    })
});
