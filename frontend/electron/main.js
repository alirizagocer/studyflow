const { app, BrowserWindow, ipcMain, shell, Notification, Menu, Tray } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");

const IS_DEV = !app.isPackaged;
const BACKEND_PORT = 8000;
const FRONTEND_PORT = 5173;

let mainWindow = null;
let backendProcess = null;
let viteProcess = null;
let tray = null;

function getPythonPath() {
  if (IS_DEV) {
    const venvPython = path.join(__dirname, "..", "..", "backend", "venv", "bin", "python3");
    return fs.existsSync(venvPython) ? venvPython : "python3";
  }
  return path.join(process.resourcesPath, "backend", "venv", "bin", "python3");
}

function getBackendPath() {
  return IS_DEV
    ? path.join(__dirname, "..", "..", "backend")
    : path.join(process.resourcesPath, "backend");
}

async function startBackend() {
  const python = getPythonPath();
  const backendDir = getBackendPath();

  backendProcess = spawn(
    python,
    ["-m", "uvicorn", "app.main:app", "--port", String(BACKEND_PORT), "--no-access-log"],
    {
      cwd: backendDir,
      env: { ...process.env, PYTHONPATH: backendDir },
      stdio: "pipe",
    }
  );

  backendProcess.stderr.on("data", (data) => {
    console.log("[Backend]", data.toString().trim());
  });

  backendProcess.on("error", (err) => {
    console.error("[Backend] Spawn hatası:", err);
  });
}

async function startViteDev() {
  return new Promise((resolve) => {
    const frontendDir = path.join(__dirname, "..");
    const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";

    viteProcess = spawn(npmCmd, ["run", "dev"], {
      cwd: frontendDir,
      stdio: "pipe",
      shell: false,
    });

    viteProcess.stdout.on("data", (data) => {
      const msg = data.toString();
      if (msg.includes("localhost") || msg.includes("Local:")) resolve();
    });

    viteProcess.stderr.on("data", () => {});
    viteProcess.on("error", resolve);
    setTimeout(() => resolve(), 15_000);
  });
}

async function waitForPort(port, maxAttempts = 40) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await new Promise((resolve, reject) => {
        http.get(`http://localhost:${port}`, (res) => { res.resume(); resolve(); }).on("error", reject);
      });
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw new Error(`Port ${port} erişilemiyor`);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: "#000000",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "assets", "icon.png"),
    show: false,
  });

  const url = IS_DEV
    ? `http://localhost:${FRONTEND_PORT}`
    : `http://localhost:${BACKEND_PORT}/static/index.html`;

  mainWindow.loadURL(url);
  mainWindow.once("ready-to-show", () => mainWindow.show());

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => { mainWindow = null; });
}

function createTray() {
  const iconPath = path.join(__dirname, "assets", "icon.png");
  if (!fs.existsSync(iconPath)) return;

  tray = new Tray(iconPath);
  const menu = Menu.buildFromTemplate([
    { label: "StudyFlow'u Aç", click: () => mainWindow?.show() },
    { type: "separator" },
    { label: "Çıkış", click: () => app.quit() },
  ]);
  tray.setToolTip("StudyFlow");
  tray.setContextMenu(menu);
  tray.on("click", () => mainWindow?.show());
}

ipcMain.handle("app:version", () => app.getVersion());
ipcMain.handle("app:open-external", async (_, url) => {
  if (/^https?:\/\//.test(url)) { await shell.openExternal(url); return true; }
  return false;
});
ipcMain.handle("notification:show", (_, { title, body }) => {
  if (Notification.isSupported()) new Notification({ title: `StudyFlow: ${title}`, body }).show();
});
ipcMain.handle("calendar:get-url", (_, token) => {
  return `http://localhost:${BACKEND_PORT}/api/calendar/${token}/studyflow.ics`;
});

app.whenReady().then(async () => {
  try {
    await startBackend();
    await waitForPort(BACKEND_PORT);

    if (IS_DEV) {
      await startViteDev();
      await waitForPort(FRONTEND_PORT);
    }

    createWindow();
    createTray();
  } catch (err) {
    const { dialog } = require("electron");
    dialog.showErrorBox("StudyFlow Başlatılamadı", String(err));
    app.quit();
  }
});

app.on("window-all-closed", () => app.quit());

app.on("before-quit", () => {
  if (backendProcess) { backendProcess.kill("SIGTERM"); backendProcess = null; }
  if (viteProcess) { viteProcess.kill("SIGTERM"); viteProcess = null; }
});