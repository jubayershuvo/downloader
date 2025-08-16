# Use Node.js as base image
FROM node:20

# Install Python3 and pip (yt-dlp needs this)
RUN apt-get update && apt-get install -y python3 python3-pip && \
    ln -s /usr/bin/python3 /usr/bin/python

# Install yt-dlp globally
RUN pip3 install yt-dlp

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy rest of the project
COPY . .

# Expose app port
EXPOSE 3000

# Start app
CMD ["npm", "start"]
