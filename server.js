require('dotenv').config(); // for environment variables
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/', express.static('public'));

// MongoDB connection using Mongoose
const mongoDBURL = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/pbdb';
mongoose.connect(mongoDBURL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

const budgetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  color: {
    type: String,
    required: true,
    validate: {
      validator: (value) => /^#[0-9A-Fa-f]{6}$/.test(value),
      message: 'Invalid color format!'
    }
  },
});

// Defining the Budget model and collection name
const Budget = mongoose.model('Budget', budgetSchema, 'budget');

app.get('/hello', (req, res) => {
  res.send('Hello World!');
});

app.get('/budget', async (req, res, next) => {
    try {
      const budget = await Budget.find();
      if (!budget || budget.length === 0) {
        return next(new Error('No budget data found'));
      }
      res.status(200).json({ myBudget: budget });
    } catch (err) {
      next(err);
    }
});

app.post('/add-budget', async (req, res, next) => {
  try {
    const { title, budget, color } = req.body;
    const newBudget = new Budget({ title, budget, color });
    const result = await newBudget.save();
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).send({ error: err.message });
});

// Starting the server
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
