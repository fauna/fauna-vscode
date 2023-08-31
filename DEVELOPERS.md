### To Compile

First, compile the [fqlx-lsp](https://github.com/fauna/fqlx-lsp) repo, and have
that repository cloned next to this one. Once that is finished, run the
following commands:
```
yarn install
yarn compile
```

This will install dependencies, and compile the typescript code.

Open vscode in this directory, and hit F5 to run a new version of
vscode, which will have this plugin running.

Now in this new instance of vscode, press cmd+l/ctrl+l to open the FQL Playground.
This should have syntax highlighting, and a language server should give live
error messages.
This should also work in any files opened with a `.fql` extension
