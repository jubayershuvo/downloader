# Use Node.js base
FROM node:20

# Install Python (yt-dlp requires it)
RUN apt-get update && apt-get install -y python3 python3-pip && \
    ln -s /usr/bin/python3 /usr/bin/python

# Install yt-dlp globally (optional, avoids runtime issues)
RUN pip3 install --no-cache-dir yt-dlp

# Set working directory
WORKDIR /app

# Copy package files and install deps
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Expose app port (Railway auto-detects PORT but 3000 is common)
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
