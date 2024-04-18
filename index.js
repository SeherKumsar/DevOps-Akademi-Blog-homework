const express = require("express");
const dbConnection = require("./helper/mysql");
const redis = require("redis");

const app = express();

const redisClient = redis.createClient({
    host: "localhost",
    port: 6379,
});
redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();
redisClient.set('blog_title', 'Baslik');

// Middleware to parse JSON requests
app.use(express.json());

// Endpoint to retrieve blog posts by ID
app.get('/blog/:id', (req, res) => {
    const postId = req.params.id;

    // First, check if the data is cached in Redis
    redisClient.get(postId, (err, cachedData) => {
        if (err) {
            console.error('Error retrieving cached data from Redis:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (cachedData !== null) {
            // Data found in cache, return it
            const post = JSON.parse(cachedData);
            return res.status(200).json(post);
        }

        // Data not in cache, query the database
        const sql = 'SELECT * FROM blog_posts WHERE id = ?';
        dbConnection.query(sql, [postId], (dbErr, results) => {
            if (dbErr) {
                console.error('Error retrieving blog post from database:', dbErr);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Blog post not found' });
            }

            const post = results[0];

            // Cache the data in Redis with an expiration time (e.g., 2 minutes)
            redisClient.setex(postId, 120, JSON.stringify(post), (cacheErr) => {

                if (cacheErr) {
                    console.error('Error caching data in Redis:', cacheErr);
                }
            });

            return res.status(200).json(post);
        });
    });
});

redisClient.get('blog_title', (err, value) => {
  if (err) {
      console.error('Error retrieving value from Redis:', err);
      // Hata durumunda yapılacaklar...
  } else {
      console.log('Retrieved value from Redis:', value);
      // Değeri başarıyla aldıktan sonra yapılacaklar...
  }
});

// Start the server
app.listen(2000, () => {
    console.log("Server is running on port 2000");
});
