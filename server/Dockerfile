# Use Node.js base
FROM node:20

# Install Python + yt-dlp via apt
RUN apt-get update && apt-get install -y python3 python3-pip yt-dlp && \
    ln -s /usr/bin/python3 /usr/bin/python

# Set workdir
WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Expose port
EXPOSE 3000

# Start app
CMD ["npm", "start"]
