/**
 * The template for new notification cards.
 * @private
 * @type {string}
 */
const _notification =
    '<div class="card text-white bg-danger">' +
    '    <div class="card-body">' +
    '        <h5 class="card-title">{{title}}</h5>' +
    '        <p class="card-text">{{message}}</p>' +
    '    </div>' +
    '</div>'

/**
 * Stores a reference to the container where all the notification elements shall be added.
 * @private
 * @type {HTMLDivElement}
 */
let _notificationsContainer;

class Notification {
    /**
     * Instantiates a new Notification.
     * @param {string} title
     * @param {string} message
     * @param {boolean} hideWithClick If true, the card will hide when clicked.
     * @param {?number} hideAutomatically If not null, the card will hide automatically after the given milliseconds.
     */
    constructor(title, message, hideWithClick = true, hideAutomatically = null) {
        this.title = title;
        this.message = message;
        this.uuid = UUIDv4(false);
        this.hideWithClick = hideWithClick;
    }

    /** @type {string} */ title;
    /** @type {string} */ message;
    /** @type {string} */ uuid;

    /** @type {boolean} */ hideWithClick;
    /** @type {number} */ hideAutomatically;

    /**
     * Checks whether the card is currently being displayed.
     * @return {boolean}
     */
    isVisible() {
        return document.getElementById(this.uuid) != null;
    }

    /**
     * Shows the notification.
     * @return {Promise<void>}
     */
    async show() {
        if (!this.isVisible()) return;

        const element = createElement(
            _notification
                .replace('{{title}}', this.title)
                .replace('{{message}}', this.message)
        );
        element.id = this.uuid;
        if (this.hideWithClick) {
            element.classList.add('clickable');
            element.addEventListener('click', async () => { await this.hide(); });
        }
        _notificationsContainer?.appendChild(element);

        // If timeout specified, hide automatically.
        if (this.hideAutomatically != null) setTimeout(() => this.hide(), this.hideAutomatically);
    }

    /**
     * Hides the notification. Blocks the execution of the thread until the notification is no longer visible.
     * @async
     * @return {Promise<void>}
     */
    async hide() {
        if (!this.isVisible()) return;

        const uuid = this.uuid;
        return new Promise((resolve) => {
            const element = document.getElementById(uuid);
            element.classList.add('hide');

            // Hide animation lasts 0.5 seconds
            setTimeout(() => {
                _notificationsContainer?.removeChild(element);
                resolve();
            }, 500);
        })
    }
}

window.addEventListener('load', () => {
    _notificationsContainer = document.getElementById('notifications');
})
