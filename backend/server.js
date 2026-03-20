const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

const DataSchema = new mongoose.Schema({
  schoolId:  { type: String, required: true, unique: true },
  payload:   { type: mongoose.Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now }
});
const Data = mongoose.model('Data', DataSchema);

app.get('/api/data/:schoolId', async (req, res) => {
  try {
    const doc = await Data.findOne({ schoolId: req.params.schoolId });
    if (!doc) return res.json({ ok: false, data: null });
    res.json({ ok: true, data: doc.payload });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/api/data/:schoolId', async (req, res) => {
  try {
    const { payload } = req.body;
    if (!payload) return res.status(400).json({ ok: false, error: 'No payload' });
    await Data.findOneAndUpdate(
      { schoolId: req.params.schoolId },
      { payload, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
