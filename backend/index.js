const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const vocabRoutes = require('./routes/vocab');
const resultsRoutes = require('./routes/results');
const evaluateRoutes = require('./routes/evaluate');

app.use('/api', vocabRoutes);
app.use('/api', resultsRoutes);
app.use('/api', evaluateRoutes);

app.get('/', (req, res) => {
    res.send('Phrase Driver backend is running.');
});

const { initDB } = require('./models/results');
initDB();

// TODO: Add routes for vocabulary, evaluation, and saving results

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection:', reason);
    process.exit(1);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
