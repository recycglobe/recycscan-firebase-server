const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 8080;

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

app.use(cors());
app.use(bodyParser.json());

app.post('/upload', async (req, res) => {
  try {
    const products = req.body;

    const batch = db.batch();
    for (const item of products) {
      const docRef = db.collection('products').doc(String(item.BARCODE));
      batch.set(docRef, item);
    }

    await batch.commit();
    res.status(200).send({ status: 'success', count: products.length });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`RecycScan Firestore API running on port ${port}`);
});
