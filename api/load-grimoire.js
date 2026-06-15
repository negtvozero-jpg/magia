import { list } from "@vercel/blob";

const FILE_PATH = "grimorio/grimorio.json";

export default async function handler(req, res) {
  try {
    const { blobs } = await list({
      prefix: FILE_PATH,
      limit: 1
    });

    const blob = blobs.find(item => item.pathname === FILE_PATH);

    if (!blob) {
      return res.status(200).json({
        ok: true,
        exists: false,
        data: null
      });
    }

    const response = await fetch(blob.downloadUrl);
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
