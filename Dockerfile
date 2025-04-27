# Use the official Node.js 18 image as the base image
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Production image, using nginx, is lighter
FROM nginx:alpine

## Copy our default site config
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

## Clear cache
RUN rm -rf /tmp/*

# Expose port 3000
EXPOSE 3000

# Set environment variables
ENV NODE_ENV production

## Start nginx
CMD ["nginx", "-g", "daemon off;"]
