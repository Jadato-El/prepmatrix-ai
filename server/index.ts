import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import app from './app.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

// Sert les fichiers du frontend buildé (dossier dist/ à la racine du projet)
app.use(express.static(path.join(__dirname, '../dist')));

// Toute route qui n'est pas /api/... renvoie index.html (routing côté client React)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`[PrepMatrix API Server] Running on http://localhost:${PORT}`);
});