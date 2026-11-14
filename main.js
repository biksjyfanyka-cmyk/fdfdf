const { app, BrowserWindow } = require("electron");
const http = require("http");
const path = require("path");
const next = require("next");

process.env.NODE_ENV = "production";
process.env.DATABASE_URL = process.env.DATABASE_URL || "postgresql://user:pass@localhost:5432/mydb";

let server;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.setMenuBarVisibility(false);

  const appDir = app.getAppPath();
  const nextApp = next({ dev: false, dir: appDir });
  const handle = nextApp.getRequestHandler();

  nextApp
    .prepare()
    .then(() => {
      server = http.createServer((req, res) => {
        handle(req, res);
      });

      server.listen(3456, "127.0.0.1", () => {
        win.loadURL("http://127.0.0.1:3456");
      });
    })
    .catch((err) => {
      win.loadURL("data:text/html;charset=utf-8," + encodeURIComponent("<h2>Ошибка запуска:</h2><pre>" + err.stack + "</pre>"));
    });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (server) server.close();
  if (process.platform !== "darwin") app.quit();
});
