# PayReconcile Deployment & Infrastructure Guide
*Generated April 2026*

## 1. Architecture Overview
PayReconcile has been migrated to a modern, automated "Same-Origin" architecture running on AWS EC2.

*   **Cloud Provider:** AWS EC2 (`t3.micro`) running Ubuntu 22.04 LTS.
*   **Networking:** An **Elastic IP** is permanently attached to the instance. This means your IP address (`100.50.64.244`) will never change, even if you stop and restart the server.
*   **Web Server / Proxy:** Nginx acts as the front-door traffic director.
    *   Requests to `/` retrieve your React frontend static files.
    *   Requests to `/api/` are forwarded directly to your Spring Boot backend.
*   **Backend Service Manager:** Spring Boot runs as a native Linux `systemd` service (`payreconcile.service`). This ensures the app auto-restarts if it crashes and automatically boots up when the server turns on.
*   **Database:** Hosted externally on **MongoDB Atlas**, meaning it is always available and independent of your EC2 server state.

## 2. Infrastructure as Code (IaC)
Your infrastructure is defined in code rather than clicking through the AWS console.
*   **Terraform (`/terraform`):** Manages the physical AWS resources (Security Groups, EC2 instance, Elastic IP).
*   **Ansible (`/ansible`):** Manages the software inside the server. It installs Java 17, configuring the firewalls, sets up Nginx, and registers the `systemd` background service.

## 3. The CI/CD Pipelines (GitHub Actions)
Deployments are fully automated via GitHub workflows. 

1.  **Initial Server Setup (`initial-setup.yml`)**
    *   *When to use:* Manually, only when you change Nginx configurations or want to completely reprovision the server packages.
    *   *What it does:* Runs the Ansible script to set up Nginx and the `payreconcile.service`. Injects Stripe keys safely into Ansible.
2.  **Backend CI/CD (`backend-deploy.yml`)**
    *   *When to use:* Automatically on `main` branch merges, or manually for hotfixes.
    *   *What it does:* Uses Maven to compile `app.jar`. Securely pulls your full `application.properties` from a GitHub Secret and bundles them together in a "staging" folder before securely copying them to `/opt/payreconcile/backend`. Reboots the backend service.
3.  **Frontend CI/CD (`frontend-deploy.yml`)**
    *   *When to use:* Automatically on `main` integrations affecting the React code.
    *   *What it does:* Injects `VITE_API_BASE_URL` and `VITE_STRIPE_PUBLISHABLE_KEY` securely from Github Secrets directly into the Vite build command. Deploys the flat static output (`dist/`) directly to Nginx's web folder (`/var/www/payreconcile`).

## 4. Secrets Management
All sensitive configuration files (`.env`, `application.properties`) are strictly ignored from GitHub (`.gitignore`).
During deployment, the GitHub Action Runner downloads the encrypted variables from GitHub **Settings > Secrets and variables > Actions** and injects them safely.

## 5. Operations & Maintenance (Stopping the Server for Cost)
If you need to cut costs and temporarily stop the EC2 instance from the AWS Dashboard, follow these rules:

#### To Stop the Server:
1. Simply log into the AWS EC2 Console.
2. Right-click your instance and select **Stop Instance**.
*Note: Because you have an Elastic IP (EIP), AWS may charge a tiny fraction of a cent per hour while the IP is reserved but the instance is stopped, but you won't incur the main EC2 compute cost.*

#### To Start the Server:
1. Right-click the instance in the AWS Console and select **Start Instance**.
2. **Do Absolutely Nothing Else.** 
   *Your server will automatically turn on Nginx.*
   *Your server will automatically launch the Spring Boot app in the background via systemd.*
   *Your Elastic IP remains identical.* 

Within 30-60 seconds of pressing "Start", your entire web application will be fully live and accessible at your IP address, completely automatically.
