"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
let bridgePanel;
function activate(context) {
    const addToChat = vscode.commands.registerCommand("h2loop.addToChat", () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        const selectedText = editor.document.getText(editor.selection);
        if (!selectedText)
            return;
        const fileName = path.basename(editor.document.fileName);
        const startLine = editor.selection.start.line + 1;
        const endLine = editor.selection.end.line + 1;
        const panel = getOrCreateBridgePanel(context);
        panel.webview.postMessage({
            type: "ADD_TO_CHAT",
            text: selectedText,
            fileName,
            startLine,
            endLine,
        });
    });
    context.subscriptions.push(addToChat);
}
exports.activate = activate;
function getOrCreateBridgePanel(context) {
    if (bridgePanel) {
        return bridgePanel;
    }
    bridgePanel = vscode.window.createWebviewPanel("h2loopBridge", "", { viewColumn: vscode.ViewColumn.Two, preserveFocus: true }, {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [],
    });
    setTimeout(() => {
        try {
            vscode.commands.executeCommand("workbench.action.minimizeOtherEditors");
        }
        catch (e) { }
    }, 10);
    bridgePanel.onDidDispose(() => (bridgePanel = undefined));
    bridgePanel.webview.html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /></head>
<body>
<script>
  // Forward messages from extension to parent React page
  window.addEventListener("message", (event) => {
    const msg = event.data;
    if (msg && msg.type === "ADD_TO_CHAT") {
      try {
        window.top.postMessage(
          { type: "h2loop:addToChat", text: msg.text, fileName: msg.fileName, startLine: msg.startLine, endLine: msg.endLine },
          "*"
        );
      } catch (e) {}
    }
  });
</script>
</body>
</html>`;
    return bridgePanel;
}
function deactivate() {
    bridgePanel?.dispose();
}
exports.deactivate = deactivate;
