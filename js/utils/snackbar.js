/**
 * Shows a snackbar at the bottom of the screen. Dismisses the previous one.
 * @param {string} text The text to display.
 * @param {number} duration The amount of ms to display the snackbar.
 */
function showSnackbar(text) {
    // Get the snackbar DIV
    const x = document.getElementById("snackbar");

    // If already showing, animate hide
    if (x.classList.contains('show')) x.classList.remove('show');

    // Update the text of the snackbar
    x.innerText = text

    // Add the "show" class to DIV
    x.className = "show";

    // After 3 seconds, remove the show class from DIV
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}
