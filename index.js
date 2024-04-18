const express = require("express");
const dbConnection = require("./helper/mysql");
const app = express();

dbConnection.getConnection((err, connection) => {
  if (err) {
      console.error('Database connection failed: ' + err.stack);
      return;
  }
  console.log('Connected to database.');
  connection.release(); // Bağlantıyı serbest bırak
  app.use(express.json());
  app.get('/blog/:id', (req, res) => {
    const postId = req.params.id;
    const sql = 'SELECT * FROM blog_posts WHERE id = ?';
    dbConnection.query(sql, [postId], (err, results) => {
        if (err) {
            console.error('Error retrieving blog post: ' + err.stack);
            res.status(500).json({ error: 'Error retrieving blog post' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ error: 'Blog post not found' });
            return;
        }
        const post = results[0];
        res.status(200).json(post);
    });
  });
  app.listen(2000, () => {
    console.log("Server is running on port 2000");
  });
});