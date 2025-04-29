# Running the Project with Docker

This guide explains how to run the project using Docker, which provides an isolated and consistent environment for your application.

## Prerequisites

-   **Docker Desktop:** Make sure Docker Desktop is installed and running on your Ubuntu machine. You can download it from the official Docker website.
-   **VS Code Extensions:**
    -   **Docker:** Provides Docker integration within VS Code.
    -   **Remote - Containers:** Enables development within Docker containers.

## Steps

### 1. Create `Dockerfile`

-   Create a file named `Dockerfile` in the root directory of your project.
-   Paste the following content into the `Dockerfile`:
```
dockerfile
# Use an official Node.js runtime as the base image
FROM node:18-alpine

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

# Set the environment variable for the Next.js application
ENV NODE_ENV=production

# Expose the port that the Next.js application will run on
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start"]
```
### 2. Create `docker-compose.yml`

-   Create a file named `docker-compose.yml` in the root directory of your project.
-   Paste the following content into the `docker-compose.yml`:
```
yaml
version: "3.9"
services:
  web:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
    environment:
      - NODE_ENV=development
```
### 3. Build and Run the Docker Container

-   **Build:** In your terminal, navigate to the project's root directory and run:
```
bash
docker-compose build
```
-   **Run:** Start the container in detached mode (background):
```
bash
docker-compose up -d
```
-   **Verify:** Check if the container is running:
```
bash
docker-compose ps
```
-   **access your app**: Access your app on `localhost:3000`.

### 4. Open in VS Code Using Remote - Containers

-   **Open the Project:** In VS Code, open the project folder.
-   **Reopen in Container:**
    -   Open the command palette in VS Code (`Ctrl+Shift+P` or `Cmd+Shift+P`).
    -   Type "Reopen in Container" and select the "Remote-Containers: Reopen in Container" option.
    -   VS Code will start building and connecting to your Docker container. This might take a few minutes the first time.
-   **Work Inside the Container:** Once connected, you'll be working inside the container. Any changes you make to your files will be reflected inside the container. The terminal in VS Code will also be connected to the container.
-   **Development mode** Since you are developing the `environment` in the `docker-compose.yml` is set to `development`. The ports and volumes configurations are set up for easy development, changes in the files will be reflected inside the container.

### Additional Tips

-   **VS Code Debugging:** VS Code's debugging tools will work seamlessly inside the container.
-   **Stopping the Container:**