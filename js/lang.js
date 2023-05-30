/**
 * Provides access for logging messages.
 * @private
 */
const logger = new Logger('localization', '#6c38ec');

/**
 * The currently selected language.
 * @type {string}
 */
let lang = 'en';

/**
 * The fallback language to use if the string required is not available in the selected one. All translations should be
 * available in this language.
 * @type {string}
 */
const fallbackLang = 'en';

/**
 * Specifies a list of supported languages. There should be matching `<lang>.xml` files in `/lang`.
 * @type {string[]}
 */
const languages = ['en'];

/**
 * Stores all the translations loaded, sorted by language.
 * @type {Map<string, Map<string, string>>}
 */
let localizationCache = new Map();

/**
 * Loads the contents of the language with the key given.
 * @private
 * @param {string} langCode The language code to load.
 * @return {Promise<Map<string, string>>}
 */
async function loadContents(langCode) {
    const x = new XMLHttpRequest();
    x.open('GET', `/lang/${langCode}.xml`, true)
    return new Promise((resolve, reject) => {
        x.onreadystatechange = () => {
            // Wait until complete
            if (x.readyState !== 4 || x.status !== 200) return;

            const doc = x.responseXML;
            const lang = doc.getElementsByTagName('lang');
            if (lang.length <= 0) reject('Lang resource doesn\'t contain a `lang` root node.');
            const root = lang[0];
            const items = root.getElementsByTagName('item');

            /** @type {Map<string, string>} */ const result = new Map();
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                /** @type {?string} */ const name = item.getAttribute('name');
                /** @type {?string} */ const value = item.childNodes[0]?.nodeValue;
                if (name == null || value == null) continue; // Ignore invalid entries
                result.set(name, value);
            }

            resolve(result)
        };
        x.onerror = () => { reject(new Error(`Error ${x.status}: ${x.statusText}`)); };
        x.send();
    });
}

/**
 * Loads the contents of the languages listed in [languages]
 */
async function loadLanguages() {
    logger.log('Loading', languages.length, 'languages...')
    for (const lang of languages) {
        const localization = await loadContents(lang);
        localizationCache.set(lang, localization);
        logger.log(lang, 'loaded!')
    }
}

/**
 * Gets the translation for the current language in the key given.
 * @param {string} key The translation key to get.
 * @return {?string}
 */
function getTranslation(key) {
    return localizationCache.get(lang)?.get(key) ?? localizationCache.get(fallbackLang)?.get(key);
}

/**
 * Updates all the translation strings available with the cached values.
 */
function refreshScreen() {
    const html = document.getElementsByTagName('html')[0];
    html.setAttribute('lang', lang);

    const nodes = document.querySelectorAll('[data-translate]');
    for (/** @type {HTMLElement} */ const node of nodes) {
        const key = node.getAttribute('data-translate');
        node.innerText = getTranslation(key) ?? 'N/A';
    }

    // Remove the manifest if any set before
    let manifestMeta = document.querySelector('meta[rel="manifest"]');
    manifestMeta?.remove();

    // Add the manifest for the current language.
    manifestMeta = document.createElement('meta');
    manifestMeta.setAttribute('rel', 'manifest');
    manifestMeta.setAttribute('href', `/manifest-${lang}.json`)
    document.head.appendChild(manifestMeta);
}

window.addEventListener('load', async function () {
    logger.log('> Localization.')
    await loadLanguages();
    refreshScreen();
});
