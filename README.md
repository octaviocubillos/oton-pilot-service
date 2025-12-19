# Oton Pilot Service

`oton-pilot-service` is the backend component of the Oton Pilot ecosystem. It runs on the target deployment server (or locally) and is responsible for managing application lifecycle, proxying requests to the correct containers, and maintaining the state of deployments.

It effectively acts as an agent and a reverse proxy, receiving commands from the CLI (via SSH or directly) and routing public traffic to the appropriate containerized services.

---

## 🚀 Key Features

*   **Reverse Proxy**: Automatically routes incoming traffic to the correct container based on hostnames or paths.
*   **Deployment Management**: Tracks active deployments and their status.
*   **Zero-Downtime Updates**: supports blue/green or rolling updates logic (depending on configuration).
*   **Database Integration**: uses SQLite to store deployment history, routing rules, and application tokens.
*   **Secure**: Manages application tokens (`AppToken`) for authorized access.

---

## 🛠 Installation & Usage

### Via Oton Pilot CLI

Typically, you don't install `oton-pilot-service` manually. The `oton-pilot` CLI handles the setup when configuring a remote host or setting up a local environment.

### Manual / Development

1.  **Prerequisites**:
    *   Node.js (v18+)
    *   npm

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Run in Development Mode**:
    ```bash
    npm run dev
    ```

4.  **Build and Run**:
    ```bash
    npm run build
    node dist/server.min.js
    ```

---

## ⚙️ Configuration

The service is configured primarily via environment variables.

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Port where the service listens. | `3000` |
| `DB_PATH` | Path to the SQLite database file. | `./database.db` |
| `LOG_LEVEL` | Logging verbosity (debug, info, error). | `info` |

---

## 🏗 Architecture

The service consists of several key modules:

*   **Proxy Module**: Uses `http-proxy-middleware` to dynamically route requests.
*   **Database Module**: SQLite interfaced via `sqlite3` driver.
*   **API**: REST API endpoints for the CLI to communicate with (e.g., registering new routes).

---

Developed with ❤️ by the Oton Pilot team.
