const express = require('express');
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

app.use(bodyParser.json());

app.use(cors({
  origin: '*', 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
}));



const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'characterDict'
});

db.connect((err) => {
  if (err) {
    console.error('Database connection error: ' + err);
  } else {
    console.log('Database connected');
  }
});


app.post('/api/v1/definition', (req, res) => {
  const { word, definition, "word-language": wordLanguage, "definition-language": definitionLanguage } = req.body;

  const sql = 'INSERT INTO dictionary (word, definition, word_language, definition_language) VALUES (?, ?, ?, ?)';
  const values = [word, definition, wordLanguage, definitionLanguage];

  db.query(sql, values, (err, result) => {
      if (err) {
          console.error(err);
          res.status(500).json({ message: 'Database error', error: err.message });
      } else {
          res.status(201).json({ message: 'Entry created successfully', entries: result.affectedRows });
      }
  });
});



app.patch('/api/v1/definition/:word', (req, res) => {
  const wordToUpdate = req.params.word;
  const newDefinition = req.body.definition;

  const sql = 'UPDATE dictionary SET definition = ? WHERE word = ?';
  const values = [newDefinition, wordToUpdate];

  db.query(sql, values, (err, result) => {
    if (err) {
      res.status(500).json({ message: 'Database error', entries: 0 });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Word not found', entries: 0 });
    } else {
      res.status(200).json({ message: 'Definition updated successfully', entries: result.affectedRows });
    }
  });
});




app.get('/api/v1/definition/:word', (req, res) => {
  const wordToRetrieve = req.params.word;

  
  const sql = 'SELECT definition FROM dictionary WHERE word = ?';
  
  db.query(sql, wordToRetrieve, (err, result) => {
    if (err) {
      res.status(500).json({ message: 'Database error', definition: '' });
    } else if (result.length === 0) {
      res.status(404).json({ message: 'Word not found', definition: '' });
    } else {
      res.status(200).json(result[0].definition);
    }
  });
});


app.delete('/api/v1/definition/:word', (req, res) => {
  const wordToDelete = req.params.word;

  const sql = 'DELETE FROM dictionary WHERE word = ?';
  
  db.query(sql, wordToDelete, (err, result) => {
    if (err) {
      res.status(500).json({ message: 'There is Error in the Database Server', entries: 0 });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Word not found', entries: 0 });
    } else {
      res.status(200).json({ message: 'Entry deleted successfully', entries: result.affectedRows });
    }
  });
});


app.get('/api/v1/languages', (req, res) => {
  const sql = 'SELECT name FROM language';

  db.query(sql, (err, result) => {
    if (err) {
      console.error('Database error:', err);
      res.status(500).json({ message: ' There  is error in the database', languages: [] });
      console.log('Database error:', err);
    } else {
      const languages = result.map(row => row.name);
      res.status(200).json({ message: 'Languages retrieved successfully', languages });
      
    }
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
