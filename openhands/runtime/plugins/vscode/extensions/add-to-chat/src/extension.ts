import * as vscode from "vscode";

let bridgePanel: vscode.WebviewPanel | undefined;

export function activate(context: vscode.ExtensionContext) {
  const addToChat = vscode.commands.registerCommand("h2loop.addToChat", () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const selectedText = editor.document.getText(editor.selection);
    if (!selectedText) return;

    const panel = getOrCreateBridgePanel(context);

    panel.webview.postMessage({ type: "ADD_TO_CHAT", text: selectedText });
  });

  context.subscriptions.push(addToChat);
}

function getOrCreateBridgePanel(
  context: vscode.ExtensionContext
): vscode.WebviewPanel {
  if (bridgePanel) {
    return bridgePanel;
  }

  bridgePanel = vscode.window.createWebviewPanel(
    "h2loopBridge",
    "H2Loop Bridge",
    { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
    {
      enableScripts: true,
      retainContextWhenHidden: true, // keep alive
      localResourceRoots: [],
    }
  );

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

export function deactivate() {}
