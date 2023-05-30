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
 * Replaces the inner text of all the elements in the body that have the given class with the passed text.
 * @param {string} className The classname to find.
 * @param {string} text The text to set on each element.
 */
function fillWithClass(className, text) {
    const elements = document.getElementsByClassName(className);
    for (const element of elements) {
        element.innerText = text;
    }
}

window.addEventListener('load', async () => {
    const token = getCookie('token');
    if (token == null) return;

    // TODO: Show errors
    // TODO: Show loading indicator
    const api = await getApi();
    console.log('Getting account data...');
    api?.get('account').then((result) => {
        // If not successful, return
        if (result.success !== true) return;
        /** @type {UserData} */ const user = result.data;
        fillWithClass('fill-user-name', `${user.first_name} ${user.last_name}`)
    })
});
