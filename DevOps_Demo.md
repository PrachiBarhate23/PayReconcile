# PayReconcile DevOps & CI/CD Live Demonstration

This guide provides a step-by-step script for presenting your full DevOps pipeline (Terraform, Ansible, and GitHub Actions) to your teacher.

## 🎤 Part 1: Explaining the Infrastructure (The "Ops" Part)

Start by explaining how the server was created and configured. 

### 1. Show Terraform (Provisioning)
**Goal:** Show how the server was born.
- Open `terraform/main.tf` and `terraform/ec2.tf`.
- Explain: *"Instead of manually clicking around the AWS Console to create our EC2 server, we wrote it as Infrastructure-as-Code using Terraform. Running `terraform apply` automatically spun up our `t3.micro` instance, attached our Elastic IP (`100.50.64.244`), and configured the Security Groups to allow HTTP, SSH, and 5000."*

### 2. Show Ansible (Configuration)
**Goal:** Show how the server was configured without manually typing commands.
- Open `ansible/setup_server.yml`.
- Explain: *"Once the server was created, it was completely empty. We used Ansible to automatically log into the server and install Java 17, Node.js, Nginx, and systemd services. Ansible also automatically configured Nginx as a reverse proxy to route traffic between the React frontend and Spring Boot backend."*

---

## 🚀 Part 2: The Live CI/CD Demonstration

Now, you will prove that the pipeline is fully automated by making a live change to the codebase and watching it deploy automatically.

### Step 1: Make a slight UI change
Open the `DashboardPage.tsx` file on your local machine:
**File:** `ecommerce-frontend/src/components/pages/DashboardPage.tsx`

Find the `SummaryCard` for **Total Orders** (around line 106).
Change the `color` property from `"blue"` to `"purple"` (or any other color you like):

```diff
        <SummaryCard
          title="Total Orders"
          value={totalOrders.toString()}
          icon={ShoppingCart}
-         color="blue"
+         color="purple"
          trend={{ value: 'Live data', isPositive: true }}
        />
```

### Step 2: Commit and Push to GitHub
Open your terminal and run the following Git commands to push your change to the `main` branch:

```bash
git add ecommerce-frontend/src/components/pages/DashboardPage.tsx
git commit -m "feat: change total orders card color to purple to test CI/CD"
git push origin main
```

### Step 3: Watch the Magic on GitHub Actions
- Open your web browser and go to your GitHub Repository.
- Click on the **Actions** tab at the top.
- Explain to your teacher: *"Because I pushed code to the `ecommerce-frontend` folder, GitHub Actions automatically detected the change and triggered the `Frontend CI/CD` workflow."*
- Click on the running workflow to show the steps occurring in real-time.
- Point out the steps inside `.github/workflows/frontend-deploy.yml`:
  1. It checks out the code.
  2. It installs Node.js and dependencies (`npm install`).
  3. It builds the production version of the frontend (`npm run build`).
  4. It uses SSH to securely copy the compiled static files directly to `/var/www/payreconcile/` on the EC2 instance using our GitHub Secrets.

### Step 4: Verify the Redeployment
- Wait for the GitHub Action to show a green checkmark (✅).
- Open a new browser tab and navigate to your live website: `http://100.50.64.244/dashboard`
- Refresh the page (you may need to do a hard refresh `Ctrl+Shift+R` to clear the browser cache).
- **The Reveal:** Show your teacher that the "Total Orders" card is now Purple! You deployed a production update without ever manually touching the server.

---

## 💡 Key Talking Points to Impress Your Teacher
- **Zero Downtime:** Because we deployed a compiled React app, the site never went offline. Users simply got the new version on their next refresh.
- **Security:** Notice that no AWS passwords or SSH keys are in the codebase. We use **GitHub Secrets** (`${{ secrets.EC2_SSH_KEY }}`, `${{ secrets.STRIPE_SECRET_KEY }}`) so the pipeline is completely secure.
- **Separation of Concerns:** If we edit the Java backend, GitHub Actions is smart enough to *only* run the `Backend CI/CD` workflow. It compiles the `.jar` and restarts the `systemd` service, leaving the frontend alone.
