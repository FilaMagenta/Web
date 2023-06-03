window.addEventListener('load', function () {
    // Check if user is logged in
    if (getCookie('token') == null)
        return document.getElementById('login_panel').classList.remove('d-none');

    document.getElementById('main_panel').classList.remove('d-none');

    // Select tab
    const tabIndexStr = sessionStorage.getItem('tab_index') ?? '0';
    const tabIndex = parseInt(tabIndexStr);
    const tabs = ['tab_events', 'tab_news', 'tab_profile'];
    const panels = ['panel_events', 'panel_news', 'panel_profile'];
    document.getElementById(tabs[tabIndex]).classList.add('active');
    document.getElementById(panels[tabIndex]).classList.add('show', 'active');
    // Add tab session storage listeners
    tabs.map(id => document.getElementById(id))
        .forEach((tab, index) => {
            tab.addEventListener('click', () => sessionStorage.setItem('tab_index', index.toString()))
        })

    // BUILD INFO
    const isRelease = buildInfo.isRelease;
    // d-dev only shows on development builds
    for (let element of document.getElementsByClassName('d-dev'))
        if (isRelease) element.classList.add('d-none')
    // Fill build information
    for (let element of document.querySelectorAll('[data-source="build"]')) {
        const property = element.getAttribute('data-property');
        element.classList.remove('d-none');
        if (property == null || !buildInfo.hasOwnProperty(property)) {
            element.classList.add('d-none');
            continue;
        }
        element.innerText = buildInfo[property];
    }
});
