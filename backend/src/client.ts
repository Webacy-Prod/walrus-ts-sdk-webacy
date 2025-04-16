import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { WalrusClient } from "@mysten/walrus";

export async function getClients() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("Missing PRIVATE_KEY");
  }

  const keypair = Ed25519Keypair.fromSecretKey(process.env.PRIVATE_KEY!); // Use the private key from the environment variable

  const suiClient = new SuiClient({
    url: getFullnodeUrl("testnet"),
  });

  const walrusClient = new WalrusClient({
    network: "testnet",
    suiClient,
    wasmUrl:
      "https://unpkg.com/@mysten/walrus-wasm@latest/web/walrus_wasm_bg.wasm",
    storageNodeClientOptions: {
      onError: (error) => console.log(error),
      fetch: (url, options) => {
        console.log("fetching", url);
        return fetch(url, options);
      },
      timeout: 60_000,
    },
  });

  return { keypair, suiClient, walrusClient };
}
