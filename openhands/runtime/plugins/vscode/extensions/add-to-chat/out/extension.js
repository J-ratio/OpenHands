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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
let bridgePanel;
function activate(context) {
    // Command: add selected text to chat
    const addToChat = vscode.commands.registerCommand("h2loop.addToChat", () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        const selectedText = editor.document.getText(editor.selection);
        if (!selectedText)
            return;
        // Get or create the hidden bridge panel
        const panel = getOrCreateBridgePanel(context);
        // Send the selected text to the bridge
        panel.webview.postMessage({ type: "ADD_TO_CHAT", text: selectedText });
    });
    context.subscriptions.push(addToChat);
}
// Create or return the hidden bridge panel
function getOrCreateBridgePanel(context) {
    if (bridgePanel) {
        return bridgePanel;
    }
    // Create a webview panel but never reveal it
    bridgePanel = vscode.window.createWebviewPanel("h2loopBridge", "H2Loop Bridge", { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true }, // do not reveal
    {
        enableScripts: true,
        retainContextWhenHidden: true, // keep alive
        localResourceRoots: [],
    });
    // Do NOT call bridgePanel.reveal(), so it stays hidden
    bridgePanel.onDidDispose(() => (bridgePanel = undefined));
    // Minimal HTML for the hidden bridge
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
          { type: "h2loop:addToChat", text: msg.text },
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
function deactivate() { }
