FROM busybox:1.35

ARG version=development
ARG release=false

# Create a non-root user to own the files and run our server
RUN adduser -D static
USER static
WORKDIR /home/static

# Copy the static website
# Use the .dockerignore file to control what ends up inside the image!
COPY --chown=static src .

# Update build info
RUN now=$(date +'%Y%m%d%H%m')
RUN rm -rf build && mkdir -p build
RUN rm -f build/info.js && touch build/info.js
RUN echo 'const buildInfo = {' >> build/info.js
RUN echo "  buildDate: '$now'," >> build/info.js
RUN echo "  version: '$version'," >> build/info.js
RUN echo "  isRelease: $release," >> build/info.js
RUN echo '};' >> build/info.js

# Run BusyBox httpd
CMD ["busybox", "httpd", "-f", "-v", "-p", "80"]
