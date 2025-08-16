# Use Node.js base
FROM node:20

# Install Python (yt-dlp requires it)
RUN apt-get update && apt-get install -y python3 python3-pip && \
    ln -s /usr/bin/python3 /usr/bin/python

# Install yt-dlp globally (optional, helps avoid runtime issues)
RUN pip3 install yt-dlp

# Set workdir
WORKDIR /app

# Copy deps first
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the rest
COPY . .

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
