import { list } from '@vercel/blob';

const BLOB_PATH = 'grimorio/grimorio.json';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Método não permitido.' });
    return;
  }

  try {
    const result = await list({
      prefix: BLOB_PATH,
      limit: 1
    });

    const blob = result.blobs.find((item) => item.pathname === BLOB_PATH);

    if (!blob) {
      res.status(404).json({ customItems: {}, activeItems: {} });
      return;
    }

    const blobResponse = await fetch(blob.url, { cache: 'no-store' });

    if (!blobResponse.ok) {
      res.status(502).json({ error: 'Falha ao ler Blob.' });
      return;
    }

    const data = await blobResponse.json();

    res.setHeader('cache-control', 'no-store');
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao carregar grimório.' });
  }
}
