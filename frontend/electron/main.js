/**
 * electron/main.js
 * Electron ana process — Mac ve Windows masaüstü uygulaması.
 * 
 * Mimari: Electron ana process → FastAPI backend'i başlatır → React frontend yükler
 * 
 * Güvenlik: contextIsolation=true, nodeIntegration=false (Electron güvenlik best practices)
 */
const { app, BrowserWindow, ipcMain, shell, Notification, Menu, Tray } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");

// ── Sabitler ─────────────────────────────────────────────────────────────────
const IS_DEV = !app.isPackaged;
const IS_MAC = process.platform === "darwin";
const BACKEND_PORT = 8000;
const FRONTEND_PORT = 5173;

// ── State ─────────────────────────────────────────────────────────────────────
let mainWindow = null;
let backendProcess = null;
let tray = null;

// ── Backend Başlatma ──────────────────────────────────────────────────────────

function getPythonPath() {
  if (IS_DEV) return "python";  // dev'de PATH'teki python
  
  // Paketlenmiş uygulamada dahil edilen Python
  const base = process.resourcesPath;
  return IS_MAC
    ? path.join(base, "python", "bin", "python3")
    : path.join(base, "python", "python.exe");
}

function getBackendPath() {
  return IS_DEV
    ? path.join(__dirname, "..", "..", "backend")
    : path.join(process.resourcesPath, "backend");
}

async function startBackend() {
  return new Promise((resolve, reject) => {
    const python = getPythonPath();
    const backendDir = getBackendPath();
    
    backendProcess = spawn(python, ["-m", "uvicorn", "app.main:app", "--port", String(BACKEND_PORT), "--no-access-log"], {
      cwd: backendDir,
      env: { ...process.env, PYTHONPATH: backendDir },
    });

    backendProcess.stdout.on("data", (data) => {
      const msg = data.toString();
      console.log("[Backend]", msg);
      if (msg.includes("Application startup complete")) {
        resolve();
      }
    });

    backendProcess.stderr.on("data", (data) => {
      console.error("[Backend Error]", data.toString());
    });

    backendProcess.on("error", reject);

    // Timeout: 30 saniyede başlamazsa hata
    setTimeout(() => reject(new Error("Backend 30 saniyede başlamadı")), 30_000);
  });
}

async function waitForBackend(maxAttempts = 20) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await new Promise((resolve, reject) => {
        http.get(`http://localhost:${BACKEND_PORT}/health`, (res) => {
          if (res.statusCode === 200) resolve();
          else reject(new Error(`Status: ${res.statusCode}`));
        }).on("error", reject);
      });
      return; // Başarılı
    } catch {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  throw new Error("Backend erişilemiyor");
}

// ── Ana Pencere ───────────────────────────────────────────────────────────────

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: IS_MAC ? "hiddenInset" : "default",  // Mac'te native stil
    backgroundColor: "#080c14",
    webPreferences: {
      // Güvenlik: Node.js renderer'da devre dışı
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      // Sadece preload script'e izin ver
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "assets", "icon.png"),
    show: false, // Hazır olunca göster (beyaz flash önlemi)
  });

  const url = IS_DEV
    ? `http://localhost:${FRONTEND_PORT}`
    : `http://localhost:${BACKEND_PORT}/static/index.html`;

  mainWindow.loadURL(url);

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    //if (IS_DEV) mainWindow.webContents.openDevTools();
  });

  // Dış linkleri tarayıcıda aç — Electron içinde açma
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => { mainWindow = null; });
}

// ── System Tray ───────────────────────────────────────────────────────────────

function createTray() {
  const iconPath = path.join(__dirname, "assets", IS_MAC ? "trayTemplate.png" : "icon.png");
  
  if (!fs.existsSync(iconPath)) return; // İkon yoksa tray oluşturma

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

// ── IPC Handlers ──────────────────────────────────────────────────────────────
// Renderer → Main process iletişimi (güvenli kanal)

ipcMain.handle("app:version", () => app.getVersion());

ipcMain.handle("app:open-external", async (_, url) => {
  // Sadece http/https URL'lerine izin ver — güvenlik
  if (/^https?:\/\//.test(url)) {
    await shell.openExternal(url);
    return true;
  }
  return false;
});

ipcMain.handle("notification:show", (_, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({ title: `StudyFlow: ${title}`, body }).show();
  }
});

ipcMain.handle("calendar:get-url", (_, token) => {
  return `http://localhost:${BACKEND_PORT}/api/calendar/${token}/studyflow.ics`;
});

// ── App Lifecycle ─────────────────────────────────────────────────────────────

app.whenReady().then(async () => {
  try {
    console.log("📚 StudyFlow başlatılıyor...");
    
    if (!IS_DEV) {
      await startBackend();
    }
    
    await waitForBackend();
    console.log("✅ Backend hazır");

    createWindow();
    createTray();

    // Mac: Dock'a tıklayınca pencereyi aç
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
      else mainWindow?.show();
    });

  } catch (err) {
    console.error("Başlatma hatası:", err);
    // Hata durumunda kullanıcıya göster
    const { dialog } = require("electron");
    dialog.showErrorBox("StudyFlow Başlatılamadı", String(err));
    app.quit();
  }
});

app.on("window-all-closed", () => {
  // Mac'te uygulama Dock'ta kalır
  if (!IS_MAC) app.quit();
});

app.on("before-quit", () => {
  if (backendProcess) {
    backendProcess.kill("SIGTERM");
    backendProcess = null;
  }
});
