import { list } from "@vercel/blob";

const FILE_PATH = "grimorio/grimorio.json";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        ok: false,
        error: "Método não permitido."
      });
    }

    const { blobs } = await list({
      prefix: FILE_PATH,
      limit: 10,
      token: process.env.BLOB_READ_WRITE_TOKEN
    });

    const blob = blobs.find(item => item.pathname === FILE_PATH);

    if (!blob) {
      return res.status(200).json({
        ok: true,
        exists: false,
        data: null
      });
    }

    const response = await fetch(blob.downloadUrl, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
      }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Erro ao baixar blob:", response.status, text);

      return res.status(500).json({
        ok: false,
        error: `Erro ao baixar blob: ${response.status}`
      });
    }

    const data = await response.json();

    return res.status(200).json({
      ok: true,
      exists: true,
      data
    });
  } catch (err) {
    console.error("Erro ao carregar grimório:", err);

    return res.status(500).json({
      ok: false,
      error: err.message || "Erro ao carregar grimório."
    });
  }
}
