import * as axios from 'axios';
import * as path from "path";
import * as vscode from "vscode";
import { LanguageClient, LanguageClientOptions, RevealOutputChannelOn, ServerOptions, TransportKind } from "vscode-languageclient/node";
import { ConfigurationChangeSubscription, FQLConfiguration, FQLConfigurationManager } from "./FQLConfigurationManager";

const serverDownloadUrl = "https://static-assets.fauna.com/fql-analyzer/index.js";
export class LanguageService implements ConfigurationChangeSubscription {
  client: LanguageClient;
  outputChannel: vscode.OutputChannel;
  context: vscode.ExtensionContext;
  serverLocation: vscode.Uri;

  constructor(context: vscode.ExtensionContext, outputChannel: vscode.OutputChannel) {
    this.outputChannel = outputChannel;
    this.context = context;
    this.serverLocation = vscode.Uri.joinPath(this.context.globalStorageUri, `fql-analyzer.js`);

    // The server is implemented in node
    const serverModule = context.asAbsolutePath(
      path.join(
        "..",
        "core",
        "ext",
        "fql",
        "analyzer-lsp",
        "build",
        "node",
        "index.js"
      )
    );
    // The debug options for the server
    // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
    const debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };

    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    const serverOptions: ServerOptions = {
      run: {
        module: this.serverLocation.path,
        transport: TransportKind.ipc,
      },
      debug: {
        module: serverModule,
        transport: TransportKind.ipc,
        options: debugOptions,
      },
    };
    // Options to control the language client
    const clientOptions: LanguageClientOptions = {
      // Register the server for plain text documents
      documentSelector: [
        {
          scheme: "file",
          language: "fql",
        },
        {
          scheme: "untitled",
          language: "fql",
        },
      ],
      synchronize: {
        // Notify the server about file changes to '.clientrc files contained in the workspace
        fileEvents: vscode.workspace.createFileSystemWatcher("**/.clientrc"),
      },
      outputChannel: vscode.window.createOutputChannel('FQL Language Server'),
      revealOutputChannelOn: RevealOutputChannelOn.Info
    };

    // Create the language client and start the client.
    this.client = new LanguageClient("fql", "FQL", serverOptions, clientOptions);
  }

  async start() {
    let exists = await vscode.workspace.fs.stat(this.serverLocation).then(
      () => true,
      () => false,
    );

    // todo: going to want to resfresh this at some point
    // https://faunadb.atlassian.net/browse/ENG-5306
    if (!exists) {
      await vscode.workspace.fs.createDirectory(this.context.globalStorageUri);
      const response = await axios.default.get(serverDownloadUrl, { responseType: 'arraybuffer' });
      await vscode.workspace.fs.writeFile(this.serverLocation, response.data);
    }

    await this.client.start();
  }

  async configChanged(updatedConfiguration: FQLConfiguration) {
    const resp = await this.client.sendRequest("setFaunaSecret", { secret: updatedConfiguration.dbSecret }) as any;
    this.outputChannel.clear();
    if (resp.status === "error") {
      FQLConfigurationManager.config_error_dialogue(resp.message);
    }
  }
}