import {
  Client,
  endpoints,
  fql
} from "fauna";
import * as vscode from "vscode";

export async function activateFQLExtension() {
  const ext = vscode.extensions.getExtension('Fauna.fql');
  try {
    await ext?.activate();
    // allow time for extension to activate
    await sleep(2000);
  } catch (e) {
    console.log("FAILED TO START EXT");
    console.log(e);
    throw e;
  }
}

export async function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export function getLocalClient(): Client {
  return new Client({
    endpoint: endpoints.local,
    secret: "secret",
  });
}


/**
 * Returns the fqlx client to use as well as the secret to use to configure the 
 * extension with.
 */
export const clientWithFreshDB = async (name: string): Promise<[Client, string]> => {
  const parentClient = getLocalClient();
  const secretQ = await parentClient.query<string>(fql`
    if (Database.byName(${name}).exists()) {
      Key.where(.database == ${name}).forEach(.delete())
      Database.byName(${name})!.delete()
    }
    Database.create({ name: ${name} })
    Key.create({ role: "admin", database: ${name} }).secret
  `);

  return [new Client({ 
    endpoint: parentClient.clientConfiguration.endpoint,
    secret: secretQ.data 
  }), secretQ.data];
};