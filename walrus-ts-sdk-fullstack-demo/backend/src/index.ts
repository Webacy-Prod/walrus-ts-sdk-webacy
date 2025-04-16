import express, { Request, Response, Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Agent, setGlobalDispatcher } from "undici";
import { getClients } from "./client";

// Node connect timeout is 10 seconds, and walrus nodes can be slow to respond
setGlobalDispatcher(
  new Agent({
    connectTimeout: 60_000,
    connect: { timeout: 60_000 },
  })
);
dotenv.config();

const app: Express = express();
app.use(express.json());
app.use(cors());

app.get("/", (_req: Request, res: Response) => {
  res.send("Walrus backend is live");
});

app.post("/api/store", async (req: Request, res: Response) => {
  try {
    const { WalrusClient } = await import("@mysten/walrus");

    const content = req.body.content;
    if (!content) {
      return res.status(400).json({ error: "Missing content" });
    }

    const { keypair, walrusClient } = await getClients();

    const encoded = new TextEncoder().encode(content);

    const { blobId } = await walrusClient.writeBlob({
      blob: encoded,
      deletable: false,
      epochs: 1,
      signer: keypair,
    });

    return res.json({ blobId });
  } catch (err: any) {
    console.error("Error storing blob:", err);
    return res.status(500).json({ error: err.message || "Unexpected error" });
  }
});

app.get("/api/blob/:blobId", async (req: Request, res: Response) => {
  try {
    const { WalrusClient } = await import("@mysten/walrus");
    const blobId = req.params.blobId;

    if (!blobId) {
      return res.status(400).json({ error: "Missing blobId" });
    }

    const { walrusClient } = await getClients();

    const blob = await walrusClient.readBlob({ blobId });

    // Try to decode as text
    const decoded = new TextDecoder().decode(blob);

    return res.json({ content: decoded });
  } catch (err: any) {
    console.error("Error reading blob:", err);
    return res.status(500).json({ error: err.message || "Unexpected error" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
