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
