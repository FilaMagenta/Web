importScripts('js/logger.js')

const logger = new Logger('conn check', '#6807e1');

self.addEventListener('install', () => {
    logger.info('Service installed!');
});

self.addEventListener('activate', () => {
    logger.info('Service activated!');
});
