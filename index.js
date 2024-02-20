const express = require('express');
const cors = require('cors');

const searchMovies = require('./scraper');

const app = express();
app.use(cors())

 app.get('/', (req, res) => {
     res.json({
         message: 'Scraping is Fun!'
     });
 });

app.get('/search/:searchTerm', (req, res) => {
    const searchTerm = req.params.searchTerm;
    searchMovies.searchMovies(searchTerm).then((movies) => {
        res.json(movies);
    });
});

app.get('/movie/:imdbID', (req, res) => {
    const imdbID = req.params.imdbID;
    searchMovies.getMovie(imdbID).then((movie) => {
        res.json(movie);
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
