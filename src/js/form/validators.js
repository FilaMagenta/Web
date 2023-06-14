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

const _EmailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g;

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