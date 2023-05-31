window.addEventListener('load', function () {
    // Check if user is logged in
    if (getCookie('token') == null)
        return document.getElementById('login_panel').classList.remove('d-none');

    document.getElementById('main_panel').classList.remove('d-none');
});