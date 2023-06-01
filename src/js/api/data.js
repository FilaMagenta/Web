/**
 * @typedef {'administrator','editor','author','contributor','subscriber','customer','shop_manager'} UserRole
 */

/**
 * @typedef {Object} MetaData
 * @property {number} id
 * @property {string} key
 * @property {string} value
 */

/** @typedef {object} UserData
 * @property {number} id
 * @property {string} date_created
 * @property {string} date_created_gmt
 * @property {string} date_modified
 * @property {string} date_modified_gmt
 * @property {string} email
 * @property {string} first_name
 * @property {string} last_name
 * @property {UserRole} role
 * @property {string} username
 * @property {object} billing
 * @property {string} billing.first_name
 * @property {string} billing.last_name
 * @property {string} billing.company
 * @property {string} billing.address_1
 * @property {string} billing.address_2
 * @property {string} billing.city
 * @property {string} billing.state
 * @property {string} billing.postcode
 * @property {string} billing.country
 * @property {string} billing.email
 * @property {string} billing.phone
 * @property {object} shipping
 * @property {string} shipping.first_name
 * @property {string} shipping.last_name
 * @property {string} shipping.company
 * @property {string} shipping.address_1
 * @property {string} shipping.address_2
 * @property {string} shipping.city
 * @property {string} shipping.state
 * @property {string} shipping.postcode
 * @property {string} shipping.country
 * @property {boolean} is_paying_customer
 * @property {string} avatar_url
 * @property {MetaData[]} meta_data
 * @property {object} _links
 * @property {object[]} _links.self
 * @property {string} _links.self.href
 * @property {object[]} _links.collection
 * @property {string} _links.collection.href
 */

/**
 * @callback PropertyFiller
 * @template ValueType
 * @param {Element} element
 * @param {ValueType} value
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
 * @type {?UserData}
 */
let user;

/**
 * Fetches the value of the meta with the given key of user. Must be initialized before.
 * @param {string} key The key of the metadata to get.
 * @param {UserData} user The user to get the data from.
 * @return {?string}
 * @see user
 */
function getUserMeta(key, user = user) {
    /** @type {?MetaData} */
    const meta = user?.meta_data?.find((metaData) => metaData.key === key);
    return meta?.value;
}


/**
 * @private
 * @type {PropertyFiller<Object>}
 */
const _updateUserField = (element, value) => {
    const property = element.getAttribute('data-property');
    element.value = value[property] ?? getTranslation('status-not-set');
}

/**
 * @private
 * @type {PropertyFiller<Object>}
 */
const _updateUserMeta = (element, value) => {
    const key = element.getAttribute('data-meta');
    element.value = getUserMeta(key, value) ?? getTranslation('status-not-set');
}

/**
 * Updates all the fields with the value of user.
 */
function refreshUserDisplay() {
    // FILL FIELDS
    fillWithClass('fill-user-name', `${user.first_name} ${user.last_name}`);
    fillWithClass('user-field', user, _updateUserField);
    fillWithClass('user-field-meta', user, _updateUserMeta);

    // SHOW IF ADMIN
    [...document.getElementsByClassName('show-if-admin')].forEach(
        el => {
            if (user.role === 'administrator') el.classList.remove('d-none')
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
    console.log('Getting account data...');
    api?.get('account').then((result) => {
        // If not successful, return
        if (result.success !== true) return;
        user = result.data;

        localStorage.setItem('user', JSON.stringify(user));

        refreshUserDisplay()
    })
});
