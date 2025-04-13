const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const cors = require('cors');

// Δημιουργία express app
const app = express();
const port = process.env.PORT || 8080;

// Εισαγωγή του Firebase service account
const serviceAccount = require('./serviceAccountKey.json');

// Αρχικοποίηση του Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Αναφορά στη Firestore βάση δεδομένων
const db = admin.firestore();

// Ενεργοποίηση CORS και JSON parsing
app.use(cors());
app.use(bodyParser.json());

// Endpoint για αποστολή barcodes στη Firestore
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

// Health check ή welcome endpoint (προαιρετικό αλλά χρήσιμο)
app.get('/', (req, res) => {
  res.status(200).send('RecycScan Firebase API is live 🚀');
});

// Εκκίνηση server
app.listen(port, () => {
  console.log(`✅ RecycScan Firebase API running on port ${port}`);
});
