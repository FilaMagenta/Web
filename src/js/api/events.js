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
    '            <button type="button" class="btn btn-secondary me-2" data-action="view-event" data-translate="action-view"></button>' +
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
    '            <button type="button" class="btn btn-secondary me-2" data-action="view-event" data-translate="action-view"></button>' +
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

/**
 * Stores the currently loaded events list.
 * @type {WooEvent[]}
 */
let _events;

/**
 * Creates a new row to be inserted in the event modal reservations table.
 * @param {string} name
 * @param {string} relationship
 * @param {?[key:string,name:string][]} relationshipOptions
 * @param {?string} table
 * @param {?string[]} tableOptions
 * @param {boolean} isEditable
 * @return {HTMLTableRowElement}
 * @private
 */
function _createReservationTableRow(
    name,
    relationship,
    relationshipOptions,
    table,
    tableOptions,
    isEditable = false
) {
    const row = document.createElement('tr');
    // Column 1
    const col1 = document.createElement('td');
    const col1Text = document.createElement('p');
    col1Text.classList.add('fw-bold', 'mb-0');
    col1Text.innerText = name;
    if (isEditable) col1Text.setAttribute('contenteditable', 'true');
    col1.appendChild(col1Text);
    row.appendChild(col1);

    // Column 2
    const col2 = document.createElement('td');
    if (relationshipOptions == null) {
        const col2Text = document.createElement('p');
        col2Text.classList.add('mb-0');
        col2Text.innerText = relationship;
        if (isEditable) col2Text.setAttribute('contenteditable', 'true');
        col2.appendChild(col2Text);
    } else {
        const col2Options = document.createElement('select');
        for (const [key, value] in relationshipOptions) {
            createAndAppendOption(key, value, col2Options);
        }
        col2.appendChild(col2Options);
    }
    row.appendChild(col2);

    // Column 4
    const col4 = document.createElement('td');
    const col4Select = document.createElement('select');
    if (tableOptions == null)
        createAndAppendOption(
            'new',
            getTranslation(isEditable ? 'event-modal-res-table-same' : 'event-modal-res-table-new'),
            col4Select
        );
    else tableOptions.forEach(
        table => createAndAppendOption(
            table,
            table === 'new' ? getTranslation('event-modal-res-table-new') :
                table === 'same' ? getTranslation('event-modal-res-table-same') : table,
            col4Select
        )
    )
    col4.appendChild(col4Select);
    row.appendChild(col4);

    // Column 5
    const col5 = document.createElement('td');
    if (isEditable) {
        const col5Button = document.createElement('a');
        col5Button.href = '#';
        col5Button.innerHTML = '<i class="fa-solid fa-minus"></i>';
        col5Button.setAttribute('data-mdb-toggle', 'tooltip');
        col5Button.setAttribute('title', getTranslation('action-remove'));
        const tooltip = new mdb.Tooltip(col5Button);
        col5Button.addEventListener('click', (event) => {
            tooltip.dispose();
            row.remove();
            event.preventDefault();
        });
        col5.appendChild(col5Button);
    }
    row.appendChild(col5);

    return row;
}

function refreshEventsDisplay() {
    const eventsContainer = document.getElementById('events_list');
    eventsContainer.innerHTML = '';

    const eventModalNode = document.getElementById('eventModal');
    const eventModal = new mdb.Modal(eventModalNode);
    /** @type {HTMLDivElement} */
    const eventModalName = document.getElementById('eventModalLabel');

    for (/** @type {WooEvent} */ const event of _events) {
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
        element.querySelectorAll('[data-action="view-event"]').forEach((element) => {
            element.addEventListener('click', () => {
                // Fill all fields
                for (/** @type {HTMLElement} */ const node of [...eventModalNode.querySelectorAll('[data-source="event"]')]) {
                    const key = node.getAttribute('data-key');
                    const metaKey = node.getAttribute('data-meta-key');
                    const property = node.getAttribute('data-property') ?? 'innerText';
                    /** @type {null,'date','display'} */
                    const format = node.getAttribute('data-format');
                    /** @type {null,'none','reminder'} */
                    const action = node.getAttribute('data-action');
                    const defaultValue = node.getAttribute('data-default');
                    const defaultValueTranslate = node.getAttribute('data-default-translate');

                    if (key == null && metaKey == null) continue;

                    /** @type {string} */
                    let value = event[key] ?? event.meta_data.find((item) => item.key === metaKey)?.value;
                    let visible = true;
                    if (format === 'date')
                        value = _parseEventDate(value)?.toLocaleString();
                    else if (format === 'display') {
                        visible = value != null;
                        value = '\u0000';
                    } else if (format === 'positive') {
                        const num = parseInt(value);
                        if (num < 0) value = getTranslation('event-modal-guests-all');
                    }

                    // Set defaults
                    if (value == null && defaultValue != null)
                        value = defaultValue;
                    if (value == null && defaultValueTranslate != null)
                        value = getTranslation(defaultValueTranslate);

                    if (value == null) visible = false;

                    if (visible) node.classList.remove('d-none');
                    else node.classList.add('d-none');

                    if (value != null && value !== '\u0000') {
                        node[property] = value;
                    }

                    if (action === 'reminder') {
                        const bell = document.createElement('a');
                        bell.classList.add('ms-2');
                        bell.href = '#';
                        bell.setAttribute('data-mdb-toggle', 'tooltip');
                        bell.setAttribute('title', getTranslation('action-add-reminder'));
                        bell.innerHTML = '<i class="fa-regular fa-bell"></i>';
                        node.appendChild(bell);
                        const tooltip = new mdb.Tooltip(bell);
                    }
                }
                // Fill attendance table
                /** @type {HTMLTableElement} */
                const table = document.getElementById('eventModalTable');
                const tableBody = table.getElementsByTagName('tbody')[0];
                const eventTables = event.attributes.find(attr => attr.name === 'table')?.options;
                tableBody.appendChild(
                    _createReservationTableRow(
                        `${user.first_name} ${user.last_name}`,
                        getTranslation('event-modal-res-you'),
                        null,
                        null,
                        eventTables
                    )
                );
                document.getElementById('eventModalTableAdd').addEventListener('click', () => {
                    tableBody.appendChild(
                        _createReservationTableRow(
                            `New User`,
                            'Unknown',
                            null,
                            null,
                            // Replace new by same
                            eventTables.map(table => table === 'new' ? 'same' : table),
                            true
                        )
                    )
                })
                eventModal.show();
            })
        })
        eventsContainer.appendChild(element);
    }

    refreshScreen();
}

window.addEventListener('load', async () => {
    const token = getCookie('token');
    if (token == null) return;

    const eventsStr = localStorage.getItem('events');
    if (eventsStr != null) {
        _events = JSON.parse(eventsStr);
        refreshEventsDisplay();
    }

    // TODO: Show errors
    // TODO: Show loading indicator
    const api = await getApi();
    events_logger.log('Getting events...');
    api?.get('events').then((result) => {
        const {/** @type {?WooEvent[]} */ data} = result;
        if (data == null) return;
        events_logger.log(`Got ${data.length} events.`);

        _events = data;
        localStorage.setItem('events', JSON.stringify(data));

        refreshEventsDisplay();
    })
});
