import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "h2loop.addToChat",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const selection = editor.selection;
      const selectedText = editor.document.getText(selection);

      if (selectedText) {
        // For now, let's just show a notification
        vscode.window.showInformationMessage(`Added to chat: ${selectedText}`);

        // TODO: send `selectedText` to your chat API or process it further
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
