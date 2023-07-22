
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as vscode from "vscode";
import * as assert from 'assert';
import * as vscode from "vscode";
import * as testHelper from "./helper";

// import * as myExtension from '../../extension';

suite("Extension Test Suite", async () => {
  test("should test completion items", async () => {
    const documentText = "C";
    
    const ext = vscode.extensions.getExtension('Fauna.fql'); // fix this
    try {
      await ext?.activate();
      // allow time for extension to activate
      await testHelper.sleep(2000);
    } catch (e) {
      console.log("FAILED TO START EXT");
      console.log(e);
      console.log((e as any).cause);
    }
    const doc = await vscode.workspace.openTextDocument({ language: "fql", content: documentText });
    const position = new vscode.Position(0, 1); // Replace with the position you want

    const collectionCompletionItem = {
      label: {
        label: "Collection",
        description: "CollectionCollection"
      },
      detail: "CollectionCollection",
    };
    const mk = vscode.CompletionItemKind.Module;
    const completionList = (await vscode.commands.executeCommand(
      'vscode.executeCompletionItemProvider',
      doc.uri,
      position,
    )) as vscode.CompletionList;

    assert.ok(completionList.items.length > 0);
    assert.ok(completionList.items.some(item => {
      return item.kind === vscode.CompletionItemKind.Module && 
      (item.label as vscode.CompletionItemLabel).label === "Collection" && 
      item.detail === "CollectionCollection";
    }));
  });
});
