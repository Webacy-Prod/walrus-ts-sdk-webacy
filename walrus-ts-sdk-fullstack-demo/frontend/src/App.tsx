import { useState } from "react";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [blobId, setBlobId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [readBlobId, setReadBlobId] = useState("");
  const [readResult, setReadResult] = useState<string | null>(null);
  const [readError, setReadError] = useState<string | null>(null);

  const handleStore = async () => {
    setLoading(true);
    setError(null);
    setBlobId(null);

    try {
      const res = await fetch("http://localhost:3001/api/store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      const data = await res.json();

      if (res.ok) {
        setBlobId(data.blobId);
      } else {
        setError(data.error || "Unknown error");
      }
    } catch (err: any) {
      console.error("Request failed:", err);
      setError("Failed to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleReadBlob = async () => {
    setReadError(null);
    setReadResult(null);

    try {
      const res = await fetch(`http://localhost:3001/api/blob/${readBlobId}`);
      const data = await res.json();

      if (res.ok) {
        setReadResult(data.content);
      } else {
        setReadError(data.error || "Unknown error while reading blob");
      }
    } catch (err: any) {
      console.error("Read request failed:", err);
      setReadError("Failed to connect to backend.");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Walrus Blob Uploader</h1>

      <textarea
        rows={5}
        placeholder="Type something to store..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={{ width: "100%", marginBottom: "1rem", padding: "1rem" }}
      />

      <button
        onClick={handleStore}
        disabled={!text || loading}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#333",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        {loading ? "Storing..." : "Store to Walrus"}
      </button>

      {blobId && (
        <p style={{ marginTop: "1rem", color: "green" }}>
          ✅ Blob stored! ID: <code>{blobId}</code>{" "}
          <a
            href={`https://walruscan.com/testnet/blob/${blobId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on Walruscan
          </a>
        </p>
      )}

      {error && (
        <p style={{ marginTop: "1rem", color: "red" }}>❌ Error: {error}</p>
      )}

      <hr style={{ margin: "2rem 0" }} />

      <h2>Read Blob by ID</h2>

      <input
        type="text"
        placeholder="Enter blob ID..."
        value={readBlobId}
        onChange={(e) => setReadBlobId(e.target.value)}
        style={{
          width: "100%",
          padding: "0.75rem",
          marginBottom: "1rem",
          border: "1px solid #ccc",
        }}
      />

      <button
        onClick={handleReadBlob}
        disabled={!readBlobId}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#0066cc",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        Read Blob
      </button>

      {readResult && (
        <div
          style={{ marginTop: "1rem", padding: "1rem", background: "#f3f3f3" }}
        >
          <strong>Blob Content:</strong>
          <pre>{readResult}</pre>
        </div>
      )}

      {readError && (
        <p style={{ marginTop: "1rem", color: "red" }}>❌ Error: {readError}</p>
      )}
    </div>
  );
}

export default App;
