const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = 3001;
const cors = require('cors');
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://jaiswalshashank123:jaiswal12345@rb-db.xoktvzv.mongodb.net/book_matching'

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Handle MongoDB connection errors
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(express.json());
app.use(cors());

app.post('/match_books', async (req, res) => {
  console.log(req.body);
  const userAnswers = [req.body.mood, req.body.personality];

  try {
    // Fetch books from the database
    await client.connect();
    console.log('Connected to MongoDB');

    const database = client.db('book_matching');
    const collection = database.collection('books');

    const query = {};

    // Fetch all documents from the collection
    const books = await collection.find(query).toArray();

    // Calculate the difference of vectors and find the best match
    let bestMatch = null;
    let minDifference = Infinity;

    books.forEach((book) => {
      const bookVector = [book.mood, book.personality];
      const difference = calculateDifference(userAnswers, bookVector);

      if (difference < minDifference) {
        minDifference = difference;
        bestMatch = book;
      }
    });

    res.json({ bestMatch });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message }); // Send the actual error message
  }
  finally {
    await client.close();
    // console.log('Connection to MongoDB closed');
  }
});

// Calculate the difference of vectors
function calculateDifference(vector1, vector2) {
  return Math.sqrt(Math.pow(vector1[0] - vector2[0], 2) + Math.pow(vector1[1] - vector2[1], 2));
}



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
