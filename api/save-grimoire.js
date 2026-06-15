import { put } from '@vercel/blob';

const BLOB_PATH = 'grimorio/grimorio.json';

function checkSecret(req, res) {
  const expected = process.env.ADMIN_SECRET;
  const received = req.headers['x-admin-secret'];

  if (!expected) {
    res.status(500).json({ error: 'ADMIN_SECRET não configurado no Vercel.' });
    return false;
  }

  if (received !== expected) {
    res.status(401).json({ error: 'Senha inválida.' });
    return false;
  }

  return true;
}

function sanitizePayload(body) {
  const customItems = body && typeof body.customItems === 'object' ? body.customItems : {};
  const activeItems = body && typeof body.activeItems === 'object' ? body.activeItems : {};

  return {
    version: 2,
    updatedAt: new Date().toISOString(),
    customItems,
    activeItems
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método não permitido.' });
    return;
  }

  if (!checkSecret(req, res)) return;

  try {
    const payload = sanitizePayload(req.body);

    const blob = await put(
      BLOB_PATH,
      JSON.stringify(payload, null, 2),
      {
        access: 'private',
        contentType: 'application/json',
        allowOverwrite: true,
        cacheControlMaxAge: 0
      }
    );

    res.status(200).json({
      ok: true,
      pathname: blob.pathname,
      url: blob.url,
      updatedAt: payload.updatedAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao salvar grimório.' });
  }
}
