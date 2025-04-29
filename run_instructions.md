# Running the OCP Project on Ubuntu

These instructions will guide you through setting up and running the OCP project on your Ubuntu system.

## Prerequisites

*   **Ubuntu System:** You need to have an Ubuntu system (desktop or server) set up and ready.
*   **Basic Terminal Knowledge:** You should be comfortable with using the terminal and navigating directories.
*   **Cloned Repository:** You should have already cloned the OCP project repository to your Ubuntu machine. If you haven't, use `git clone https://github.com/domlana009/OCP.git` in your terminal.
* **Install curl or wget**
```
bash
sudo apt install curl
```
or
```
bash
sudo apt install wget
```
## Step-by-Step Instructions

### 1. Install Node.js and npm

This project requires Node.js and npm to run. We recommend using Node Version Manager (nvm) to manage your Node.js versions.

*   **Open the Terminal:** Launch the terminal application on your Ubuntu system.
*   **Update Package List:**
```
bash
    sudo apt update
    
```
* **Install nvm**
```
bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
```
Or if you installed wget:
```
bash
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
```
*   **Close and Reopen Terminal:** After installing nvm, close your terminal and open a new one to load the changes, or run:
```
bash
    source ~/.bashrc
    
```
* **Install node**
```
bash
    nvm install node
    
```
*   **Verify Installation:** Check if Node.js and npm are installed correctly:
```
bash
    node -v
    npm -v
    
```
This should display the version numbers of Node.js and npm.

### 2. Install Project Dependencies

*   **Navigate to Project Directory:** Use the `cd` command to go to the OCP project directory. Replace `/path/to/your/OCP` with the actual path:
```
bash
    cd /path/to/your/OCP
    
```
*   **Install Dependencies:** Install the project's dependencies using npm:
```
bash
    npm install
    
```
This will download all the necessary packages listed in the `package.json` file and save them to the `node_modules` folder.

### 3. Start the Development Server

*   **Check `package.json`:** Open the `package.json` file in the project directory. Look for the `"scripts"` section. There should be a script named `"dev"` or `"start"`.
*   **Start Server:** Run the appropriate script in the terminal:
    *   If you find `"dev"`:
```
bash
        npm run dev
        
```
*   If you find `"start"`:
```
bash
        npm run start
        
```
*   **Access the Application:** Once the server is running, you can access the project in your web browser, usually at `http://localhost:3000`. The terminal output will provide the exact URL.

### 4. Open in VS Code (Optional)

*   **Launch VS Code:** Open the VS Code application on your Ubuntu system.
*   **Open Folder:** Go to `File > Open Folder...` and select the OCP project directory.
*   **Start Development:** You can now edit, debug, and run the project within VS Code.

## Additional Tips

*   **VS Code Extensions:** Consider installing helpful VS Code extensions like ESLint, Prettier, Debugger for Chrome, etc.
*   **VS Code Terminal:** Use the built-in terminal in VS Code for running commands.
*   **Debugging:** Take advantage of VS Code's debugging tools.

Now, you should have the OCP project up and running on your Ubuntu system!