import * as vscode from "vscode";
import * as path from "path";

let bridgePanel;

export function activate(context) {
  const addToChat = vscode.commands.registerCommand("h2loop.addToChat", () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const selectedText = editor.document.getText(editor.selection);
    if (!selectedText) return;

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

function getOrCreateBridgePanel(context) {
  if (bridgePanel) {
    return bridgePanel;
  }

  bridgePanel = vscode.window.createWebviewPanel(
    "h2loopBridge",
    "",
    { viewColumn: vscode.ViewColumn.Two, preserveFocus: true },
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [],
    }
  );

  setTimeout(() => {
    try {
      vscode.commands.executeCommand("workbench.action.minimizeOtherEditors");
    } catch (e) {}
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

export function deactivate() {
  bridgePanel?.dispose();
}
