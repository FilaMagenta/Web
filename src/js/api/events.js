const events_logger = new Logger('events', '#bde314')

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
 * @typedef {Object} EventTable
 * @property {number} id The id of the table in the database.
 * @property {number} responsible_id The id of the responsible user for the table.
 * @property {number[]} members A list of the user ids of all the members in the table.
 */

/**
 * @typedef {Object} Event
 * @property {number} id
 * @property {string} name
 * @property {string} description
 * @property {string} date
 * @property {?string} until
 * @property {?string} reservations
 * @property {boolean} assists
 * @property {EventTable[]} tables
 */

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
 * @type {Event[]}
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

    for (/** @type {Event} */ const event of _events) {
        const until = event.until;

        // TODO: Check if user has signed up to event
        const html = _eventsTemplateItem
            .replaceAll('{{title}}', event.name)
            .replaceAll('{{description}}', event.description)
            .replaceAll('{{until-display}}', until == null ? 'd-none' : '')
            .replaceAll('{{until}}', _parseEventDate(until)?.toLocaleString() ?? '');
        const element = createElement(html);
        element.id = 'event-' + event.id.toString(16);
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
                    let value = event[key];
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

class EventData {
    /** @type {string} */
    name;

    /** @type {string} */
    description;

    /** @type {Date} */
    date;

    /** @type {?Date} */
    until;

    /** @type {?Date} */
    reservations;

    /**
     * Initializes a new EventData instance.
     * @param {string} name
     * @param {string} description
     * @param {Date} date
     * @param {?Date} until
     * @param {?Date} reservations
     */
    constructor(name, description, date, until, reservations) {
        this.name = name;
        this.description = description;
        this.date = date;
        this.until = until;
        this.reservations = reservations;
    }

    /**
     * Requests the backend to create the event.
     * @returns {Promise<Result>}
     */
    async create() {
        events_logger.log('Event creation requested. Getting API...');
        const api = await getApi();
        events_logger.log('API ready, building request and sending...');
        const data = {
            name: this.name,
            description: this.description,
            date: this.date.toISOString(),
            until: this.until?.toISOString(),
            reservations: this.reservations?.toISOString()
        };
        return await api.post('events', data);
    }
}

let newEventModal;

/**
 * Loads all events from the backend, and displays them.
 * @returns {Promise<void>}
 */
async function loadAndDisplayEvents() {
    const api = await getApi();
    events_logger.log('Getting events...');
    api?.get('events').then((result) => {
        const {/** @type {?Object} */ data} = result;
        if (data == null) return;
        const {/** @type {?Object[]} */ events} = data;
        events_logger.log(`Got ${events.length} events`);

        _events = events;
        localStorage.setItem('events', JSON.stringify(events));

        refreshEventsDisplay();
    })
}

window.addEventListener('load', async () => {
    const token = getCookie('token');
    if (token == null) return;

    const eventsStr = localStorage.getItem('events');
    if (eventsStr != null) {
        _events = JSON.parse(eventsStr);
        refreshEventsDisplay();
    }

    // Initialize the new event modal, and its launch button
    newEventModal = new mdb.Modal($id('newEventModal'));
    $id('create_event').addEventListener('click', () => {
        newEventModal.show();
    });

    // Add the listener for creating new events
    const newEventForm = $id('new_event_form');
    newEventForm.addEventListener('submit', async (ev) => {
        events_logger.log('Creating new event...');
        ev.preventDefault();
        ev.stopPropagation();

        /** @type {HTMLInputElement} */ const nameField = $id('new_event_name');
        /** @type {HTMLInputElement} */ const dateField = $id('new_event_date');
        /** @type {HTMLTextAreaElement} */ const descriptionField = $id('new_event_description');
        /** @type {HTMLInputElement} */ const untilField = $id('new_event_until');
        /** @type {HTMLInputElement} */ const reservationsField = $id('new_event_reservations');

        const name = nameField.value;
        const dateRaw = dateField.value;
        const description = descriptionField.value;
        const untilRaw = untilField.value;
        const reservationsRaw = reservationsField.value;

        if (name.length <= 0) nameField.classList.add('is-invalid');
        if (dateRaw.length <= 0) dateField.classList.add('is-invalid');
        if (newEventForm.getElementsByClassName('is-invalid').length > 0) return;

        const event = new EventData(
            name,
            description,
            new Date(dateRaw),
            untilRaw.length > 0 ? new Date(untilRaw) : null,
            reservationsRaw.length > 0 ? new Date(reservationsRaw) : null,
        );
        const result = await event.create();
        if (result.success) {
            events_logger.log('Event created!');
            showSnackbar(getTranslation('new-event-modal-success'));
            newEventModal.hide();
            await loadAndDisplayEvents();
        } else {
            events_logger.error(`Could not create event: ${JSON.stringify(result)}`);
            showSnackbar(getTranslation('new-event-modal-error-unknown'));
        }
    });

    // TODO: Show errors
    // TODO: Show loading indicator
    await loadAndDisplayEvents();
});
