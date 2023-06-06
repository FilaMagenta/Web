window.addEventListener('load', function () {
    // Check if user is logged in
    if (getCookie('token') == null) {
        document.getElementById('login_panel').classList.remove('d-none');
        document.getElementById('login_panel').classList.add('show');
        return
    }

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

    for (const element of document.querySelectorAll('[data-source]')) {
        const source = element.getAttribute('data-source');
        const property = element.getAttribute('data-property');
        const format = element.getAttribute('data-format') ?? 'text';
        const listener = element.getAttribute('data-listener');
        /** If true, all elements at the same depth as the source will be listened */
        const listenAll = element.getAttribute('data-listen-all') ?? false;

        if (!source.startsWith('#') || property == null) continue;
        const sourceElement = document.getElementById(source.substring(1));
        if (sourceElement == null) continue;

        function updateValue() {
            const value = sourceElement[property];
            console.log('Updating value of', element, 'to', value, 'format:', format);
            if (format === 'text')
                element.innerText = value;
            else if (format === 'display')
                if (element.classList.contains('fade'))
                    if (value === true)
                        element.classList.add('show');
                    else
                        element.classList.remove('show');
                else
                    if (value === true)
                        element.classList.remove('d-none');
                    else
                        element.classList.add('d-none');
        }
        updateValue();

        if (listener != null) {
            sourceElement.addEventListener(listener, () => updateValue());
            if (listenAll)
                for (let child of sourceElement.parentElement.children)
                    child.addEventListener(listener, () => updateValue());
        }
    }
});
