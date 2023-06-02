FROM busybox:1.35

ARG version=development
ARG release=false

# Create a non-root user to own the files and run our server
RUN adduser -D static
USER static
WORKDIR /home/static

# Copy the static website
# Use the .dockerignore file to control what ends up inside the image!
COPY src .

COPY scripts/save-build-info.sh ./save-build-info.sh
RUN ./save-build-info.sh
RUN rm ./save-build-info.sh

# Run BusyBox httpd
CMD ["busybox", "httpd", "-f", "-v", "-p", "80"]
