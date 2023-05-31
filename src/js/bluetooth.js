/**
 * Provides access for logging messages.
 * @private
 */
const bt_logger = new Logger('bluetooth', '#1f4dc0');

window.addEventListener('load', function () {
    // Check if browser is compatible
    const bluetooth = navigator.bluetooth
    if (bluetooth == null) {
        return bt_logger.error('Bluetooth is not available in this browser.');
    }

    bluetooth
        .getAvailability()
        .then(isBluetoothAvailable => {
            bt_logger.info(`Bluetooth is ${isBluetoothAvailable ? 'available' : 'unavailable'}`);
        });

    if ('onavailabilitychanged' in navigator.bluetooth) {
        navigator.bluetooth.addEventListener('availabilitychanged', function(event) {
            bt_logger.info(`Bluetooth is ${event.value ? 'available' : 'unavailable'}`);
        });
    }
})
