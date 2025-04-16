# 🐘 Walrus Blob Uploader — Walrus TS SDK Fullstack Demo

This project is a fullstack TypeScript-based demo that shows how to upload content (as blobs) to [Walrus](https://sdk.mystenlabs.com/walrus) using the official Mysten TS SDK. It features:

- ✅ A **React + Vite** frontend
- ✅ A **Node.js + Express** backend (written in TypeScript)
- ✅ Integration with the official `@mysten/walrus` SDK
- ✅ Self-hosted or CDN-loaded WASM for encoding blobs
- ✅ Secure key-based blob uploads using `Ed25519Keypair`
- ✅ Blob read support via `readBlob`

---

## 📁 Project Structure

```
walrus-demo/
├── backend/    # Express API with Walrus SDK
└── frontend/   # React UI (Vite)
```

---

## 🚀 Backend (Express + TypeScript)

### ✅ Setup & Requirements

- Uses `dotenv` to load a private key from `.env`
- Uses `@mysten/walrus` to interact with Walrus
- Uses `@mysten/sui/client` to connect to Sui Testnet
- Uses `setGlobalDispatcher` from `undici` to increase timeouts (📌 see below)

---

### 🔐 Environment Variables (`backend/.env`)

```env
PRIVATE_KEY=<suiprivkey.....>
```

- This private key is passed directly to the Walrus SDK as an `Ed25519Keypair`, used to sign and pay for the blob upload.
- The keypair must have sufficient **SUI** and **WAL** tokens on testnet.

If your SUI balance is low, you can fund it with a faucet. To programmatically ensure the key has enough funds to use the SDK, you can use the following logic:

```ts
const suiClient = new SuiClient({
  url: getFullnodeUrl("testnet"),
});

const keypair = Ed25519Keypair.fromSecretKey(YOUR_KEY);

const balance = await suiClient.getBalance({
  owner: keypair.toSuiAddress(),
});

if (BigInt(balance.totalBalance) < MIST_PER_SUI) {
  await requestSuiFromFaucetV0({
    host: getFaucetHost("testnet"),
    recipient: keypair.toSuiAddress(),
  });
}

const walBalance = await suiClient.getBalance({
  owner: keypair.toSuiAddress(),
  coinType: `0x8270feb7375eee355e64fdb69c50abb6b5f9393a722883c1cf45f8e26048810a::wal::WAL`,
});

if (Number(walBalance.totalBalance) < Number(MIST_PER_SUI) / 2) {
  const tx = new Transaction();

  const exchange = await suiClient.getObject({
    id: TESTNET_WALRUS_PACKAGE_CONFIG.exchangeIds[0],
    options: { showType: true },
  });

  const exchangePackageId = parseStructTag(exchange.data?.type!).address;

  const wal = tx.moveCall({
    package: exchangePackageId,
    module: "wal_exchange",
    function: "exchange_all_for_wal",
    arguments: [
      tx.object(TESTNET_WALRUS_PACKAGE_CONFIG.exchangeIds[0]),
      coinWithBalance({
        balance: MIST_PER_SUI / 2n,
      }),
    ],
  });

  tx.transferObjects([wal], keypair.toSuiAddress());

  const { digest } = await suiClient.signAndExecuteTransaction({
    transaction: tx,
    signer: keypair,
  });

  const { effects } = await suiClient.waitForTransaction({
    digest,
    options: { showEffects: true },
  });

  console.log(effects);
}
```

---

### 📦 Blob Upload Route

**POST `/api/store`**

- Accepts: `{ content: string }`
- Returns: `{ blobId: string }` if successful

#### **GET `/api/blob/:blobId`**

- Accepts: `blobId` as a route param
- Returns: `{ content: string }` (decoded from stored blob)

---

### 🧠 Walrus SDK Usage

#### 🔧 `setGlobalDispatcher` (from `undici`)

```ts
setGlobalDispatcher(
  new Agent({
    connectTimeout: 60_000,
    connect: { timeout: 60_000 },
  })
);
```

📌 Walrus storage nodes can be slow to respond. This increases global fetch timeouts for the SDK’s internal HTTP requests.

---

#### 📜 `wasmUrl`

```ts
wasmUrl: "https://unpkg.com/@mysten/walrus-wasm@latest/web/walrus_wasm_bg.wasm";
```

📌 The Walrus SDK requires WebAssembly for encoding/decoding blobs. In server environments (like Node.js), you must explicitly provide this URL.

---

#### 📡 `storageNodeClientOptions`

```ts
storageNodeClientOptions: {
  fetch: (url, options) => {
    console.log('fetching', url);
    return fetch(url, options);
  },
  timeout: 200_000,
  onError: (error) => console.log(error),
}
```

📌 These options help:

- Log outgoing fetch requests
- Extend timeouts
- Catch and debug storage node failures

---

## 🖼 Frontend (React + Vite)

- Built with React + TypeScript
- Textarea to enter text
- Button to upload as a Walrus blob
- Shows returned `blobId` or an error message

---

### 🔗 API Usage

Frontend sends:

#### POST to:

```
http://localhost:3001/api/store
```

#### GET from:

```
http://localhost:3001/api/blob/:blobId
```

Make sure CORS is enabled on the backend:

```ts
app.use(cors());
```

---

## 🧪 How to Run

### 📦 Backend

```bash
cd backend
npm install
npm run dev
```

Make sure you create a `.env` file with your private key.

---

### 🖼 Frontend

```bash
cd frontend
npm install
npm run dev
```

Then open:  
[http://localhost:5173](http://localhost:5173)

## SDK

Powered by [Mysten Labs](https://mystenlabs.com) and the [Walrus SDK](https://sdk.mystenlabs.com/walrus).
