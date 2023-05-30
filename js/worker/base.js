const worker_logger = new Logger('worker', '#6807e1');

async function registerWorker(name, file) {
    const serviceWorker = navigator.serviceWorker;

    const worker = await serviceWorker.getRegistration(file);
    // Make sure the worker is only registered once
    if (worker != null) return;

    worker_logger.log(`Installing ${name}...`);
    await navigator.serviceWorker.register(file, {type: 'module'})
}

window.addEventListener('load', () => {
    if ('serviceWorker' in navigator) {
        registerWorker('Connectivity check', '/connectivity_check.mjs')
            .then(() => worker_logger.log('Connectivity check registered!'))
            .catch(err => worker_logger.error('Could not register connectivity checker. Error:', err));
    } else {
        worker_logger.warn('Your browser does not support service workers. Some functions may not work as expected.');
    }
});
