FROM node:20-alpine

WORKDIR /app

RUN npm install --global @monokle/cli

# Add a script to run the Monokle CLI with arguments passed to `docker run`
COPY run-monokle.sh /app/
RUN chmod +x /app/run-monokle.sh

# This Docker image will run the script by default
ENTRYPOINT ["/app/run-monokle.sh"]
