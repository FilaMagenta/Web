/**
 * Creates a new node from its HTML content.
 * @param {string} html The html code of the node.
 * @return {Element}
 */
function createElement(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.children[0];
}

/**
 * Creates a new option node and appends it to the passed select.
 * @param {string} value
 * @param {string} text
 * @param {HTMLSelectElement} target
 * @return {HTMLOptionElement}
 */
function createAndAppendOption(value, text, target) {
    const option = document.createElement('option');
    option.value = value;
    option.innerText = text;
    target.appendChild(option);
    return option;
}

/**
 * @callback ElementValidator
 * @template ElementType
 * @param {ElementType} element
 * @return {boolean}
 */

/**
 * Finds for a parent of the element that confirms validator.
 * @param {HTMLElement} element
 * @param {ElementValidator<HTMLElement>} validator
 * @return {?HTMLElement}
 */
function findParent(element, validator) {
    const parent = element.parentElement;
    if (parent == null) return null;
    if (validator(parent))
        return parent;
    else
        return findParent(parent, validator);
}

/**
 * Selects an element in the DOM with the given id.
 * @param {string} id
 * @return {HTMLElement}
 */
function $id(id) { return document.getElementById(id); }
