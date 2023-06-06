/**
 * Updates the parent form of the field, and its submit button, according to the contents of the form.
 * @param {HTMLElement} field
 * @private
 */
function _updateForm(field) {
    const parentForm = findParent(field, el => el.nodeName.toUpperCase() === 'FORM' && el.hasAttribute('data-submit'));
    const submitSelector = parentForm?.getAttribute('data-submit');
    /** @type {?HTMLElement} */
    const submit = submitSelector != null ? document.querySelector(submitSelector) : null;
    const formContainsInvalid = parentForm?.querySelector('.is-invalid') != null;
    if (formContainsInvalid === true)
        submit?.setAttribute('disabled', 'true');
    else
        submit?.removeAttribute('disabled');
}

/**
 * @callback FieldValidator
 * @param {HTMLInputElement} field
 * @param {?string} value
 * @return {boolean}
 */

/**
 *
 * @param key
 * @param {FieldValidator} validator
 * @private
 */
function _validate(key, validator) {
    /** @type {NodeListOf<HTMLInputElement>} */
    const fields = document.querySelectorAll(`input[data-validate="${key}"]`);
    for (const field of fields)
        field.addEventListener('input', () => {
            field.classList.remove('is-invalid', 'is-valid')
            if (!validator(field, field.value))
                field.classList.add('is-invalid');
            else
                field.classList.add('is-valid');

            _updateForm(field);
        });
}

const _EmailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)])/g;

window.addEventListener('load', () => {
    _validate('dni', (_, value) => validateDni(value));
    _validate('value', (field, fieldValue) => {
        const sourceSelector = field.getAttribute('data-source');
        /** @type {HTMLInputElement} */
        const source = document.querySelector(sourceSelector);
        const sourceValue = source.value;
        return fieldValue === sourceValue;
    });
    _validate('empty', (_, value) => value.trim() !== '');
    _validate('email', (_, value) => _EmailRegex.test(value));
})