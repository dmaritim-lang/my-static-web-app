# Launching Lipa Fare in VS Code

These steps let you open and run the monorepo in Visual Studio Code (no extra tooling required beyond Node.js and Git). Use the backend on port 3000 and the Next.js dashboard on port 3001.

## 1) Prerequisites
- Install [Visual Studio Code](https://code.visualstudio.com/).
- Install the VS Code extensions:
  - **ESLint** (code quality)
  - **Prettier** (formatting)
  - **NestJS Files** (syntax help) – optional
- Install **Node.js 18+** and **Git** on your machine.

## 2) Open the project
1. Clone the repo locally:
   ```bash
   git clone <your-fork-url> my-static-web-app
   cd my-static-web-app
   ```
2. In VS Code, choose **File → Open Folder…** and select the `my-static-web-app` folder.
3. When prompted to install recommended extensions, accept.

## 3) Set up environment variables
Create a `.env` file in `backend/` with placeholders so the app boots without external keys:
```env
PORT=3000
NODE_ENV=development
# M-Pesa sandbox placeholders
MPESA_CONSUMER_KEY=your-key
MPESA_CONSUMER_SECRET=your-secret
MPESA_SHORTCODE=600000
MPESA_PASSKEY=dummy
MPESA_CALLBACK_URL=http://localhost:3000/payments/c2b/confirm
```

## 4) Install dependencies
In VS Code open a terminal (``Ctrl+` ``) and run:
```bash
cd backend
npm install
cd ../next-dashboard
npm install
```

## 5) Run the services
Open two terminals in VS Code:
- **Terminal 1 (backend)**
  ```bash
  cd backend
  npm run start:dev
  ```
  The API will listen on http://localhost:3000.
- **Terminal 2 (dashboard)**
  ```bash
  cd next-dashboard
  npm run dev
  ```
  The dashboard will be at http://localhost:3001.

## 6) Debugging in VS Code
- Start the backend in watch mode: `npm run start:dev`.
- Go to **Run and Debug** in VS Code and create a new **Node.js** launch config targeting `backend/dist/main.js` once built, or use the **JavaScript Debug Terminal** to debug TypeScript with `ts-node` if installed.

## 7) Helpful scripts
- `npm run lint` (backend) to check code quality.
- `npm run build` (backend) to compile NestJS.
- `npm run dev` (next-dashboard) to run the dashboard locally.

## 8) Common issues
- If `npm install` fails because of network blocks, configure your npm registry or use an offline cache. The app code still opens and lets you explore files in VS Code.
- Ensure ports 3000 and 3001 are free before running.

That’s it—open the folder, install dependencies, and run the backend plus dashboard from VS Code terminals.
