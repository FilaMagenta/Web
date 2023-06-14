# Filà Magenta - Web
The web application for the Filà Magenta.

# Requirements
## Configuration directory
It's required to provide a configuration directory, where some parameters about the API connection are specified. In the
example [docker-compose.yml](./docker-compose.yml) it's provided as a volume. If you decide to run the project in some
other way, you will have to create a new directory called `config` inside [`src`](./src).

In any case, inside this directory, the files required are:
```javascript
// api.js

const apiConfig = {
    // Where the backend (https://github.com/FilaMagenta/BackendKotlin) is running at
    server: 'http://localhost:8080'
};
```

# Wireless Capabilities
Some functions of the web require bluetooth capabilities. Only some browsers support it.

You can take a look at the [Compatibility table](https://developer.mozilla.org/en-US/docs/Web/API/Bluetooth#browser_compatibility) to see if your browser is compatible.

On Chrome-based browsers you might need to enable the [`#enable-experimental-web-platform-features`](chrome://flags/#enable-experimental-web-platform-features) flag.
