const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const cors = require('cors');
const app = express();

// ✅ Cloud Run απαιτεί να ακούει στο process.env.PORT
const port = process.env.PORT || 8080;

// ✅ Path προς το service account key JSON
const serviceAccount = require('./serviceAccountKey.json');

// ✅ Firebase αρχικοποίηση
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json());

// ✅ Endpoint για ανέβασμα προϊόντων
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

// ✅ Start server
app.listen(port, () => {
  console.log(`🚀 RecycScan Firestore API running on port ${port}`);
});
