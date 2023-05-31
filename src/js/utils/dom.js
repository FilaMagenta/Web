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
