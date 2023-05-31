const events_logger = new Logger('events', '#bde314')

/** @typedef {object} WooEvent
 * @property {number} id
 * @property {string} name
 * @property {string} slug
 * @property {string} permalink
 * @property {string} date_created
 * @property {string} date_created_gmt
 * @property {string} date_modified
 * @property {string} date_modified_gmt
 * @property {string} type
 * @property {string} status
 * @property {string} description
 * @property {string} short_description
 * @property {string} sku
 * @property {string} price
 * @property {string} regular_price
 * @property {boolean} purchasable
 * @property {number} total_sales
 * @property {boolean} virtual
 * @property {boolean} downloadable
 * @property {[]} downloads
 * @property {number} download_limit
 * @property {number} download_expiry
 * @property {boolean} manage_stock
 * @property {null} stock_quantity
 * @property {string} stock_status
 * @property {[]} attributes
 * @property {[]} default_attributes
 * @property {[]} variations
 * @property {[]} grouped_products
 * @property {[]} meta_data
 * @property {object} _links
 * @property {object[]} _links.self
 * @property {string} _links.self.href
 * @property {object[]} _links.collection
 * @property {string} _links.collection.href
 */

const _eventsTemplateItem =
    '<div class="col-12 col-md-6 px-2 my-2">' +
    '    <div class="card">' +
    '        <div class="card-body">' +
    '            <h5 class="card-title">{{title}}</h5>' +
    '            <p class="card-text">{{description}}</p>' +
    '            <button type="button" class="btn btn-primary" data-translate="action-register"></button>' +
    '        </div>' +
    '        <div class="card-footer text-muted {{until-display}}">Reservations until {{until}}</div>' +
    '    </div>' +
    '</div>';
const _eventsTemplateRegistered =
    '<div class="col-12 col-md-6 px-2 my-2">' +
    '    <div class="card">' +
    '        <div class="card-body">' +
    '            <h5 class="card-title">{{title}}</h5>' +
    '            <p class="card-text">{{description}}</p>' +
    '            <button type="button" class="btn btn-primary">' +
    '                <i class="fa-solid fa-qrcode me-2"></i>' +
    '                <span data-translate="action-view-qr"></span>' +
    '            </button>' +
    '        </div>' +
    '    </div>' +
    '</div>';

/**
 * Converts the date gotten from an event (formatted yyyyMMddHHmm) to a JS Date.
 * @private
 * @param {?string} date
 * @return {?Date}
 */
function _parseEventDate(date) {
    if (date == null) return null;
    return new Date(`${date.substring(0, 4)}/${date.substring(4, 6)}/${date.substring(6, 8)} ${date.substring(8, 10)}:${date.substring(10, 12)}`);
}

window.addEventListener('load', async () => {
    const token = getCookie('token');
    if (token == null) return;

    const eventsContainer = document.getElementById('events_list');

    // TODO: Show errors
    // TODO: Show loading indicator
    const api = await getApi();
    events_logger.log('Getting events...');
    api?.get('events').then((result) => {
        const {data} = result;
        if (data == null) return;
        events_logger.log(`Got ${data.length} events.`);

        eventsContainer.innerHTML = '';

        for (/** @type {WooEvent} */ const event of data) {
            const until = event.meta_data
                .find((item) => item.key === 'until')
                ?.value;

            // TODO: Check if user has signed up to event
            const html = _eventsTemplateItem
                .replaceAll('{{title}}', event.name)
                .replaceAll('{{description}}', event.description)
                .replaceAll('{{until-display}}', until == null ? 'd-none' : '')
                .replaceAll('{{until}}', _parseEventDate(until)?.toLocaleString() ?? '');
            const element = createElement(html);
            element.id = event.sku;
            eventsContainer.appendChild(element);
        }

        refreshScreen();
    })
});
