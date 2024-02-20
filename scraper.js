const fetch = require('node-fetch');
const cheerio = require('cheerio');

const searchUrl = 'https://www.imdb.com/find?s=tt&ttype=ft&ref_=fn_ft&q=';
const movieUrl = 'https://www.imdb.com/title/';

// caching to avoid multi request for the server
const searchCache = {};
const movieCache = {};


function searchMovies(searchTerm) {
    if(searchCache[searchTerm]) {
         console.log('Serving from the cache: ', searchTerm)
        return Promise.resolve(searchCache[searchTerm])
    }

    return fetch(`${searchUrl}${searchTerm}`, {
        headers: {
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        }
    })
        .then((res) => res.text())
        .then((body) => {
            const movies = [];
            const $ = cheerio.load(body);
            $('.find-result-item').each(function (i, element) {
                const $element = $(element);
                const $image = $element.find('div div img');
                const $title = $element.find(
                    'div.ipc-metadata-list-summary-item__c div.ipc-metadata-list-summary-item__tc a'
                );
                const imdbID = $title.attr('href').match(/\/title\/(.*)\//)[1];
                const movie = {
                    image: $image.attr('src'),
                    title: $title.text(),
                    imdbID
                };
                movies.push(movie);
            });
            searchCache[searchTerm] = movies;
            return movies;
        });
}

function getMovie(imdbID) {
    if(movieCache[imdbID]) {
        console.log('Serving from the cache: ', imdbID)
        return Promise.resolve(movieCache[imdbID])
    }
    return fetch(`${movieUrl}${imdbID}`, {
        headers: {
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        }
    })
        .then((res) => res.text())
        .then((body) => {
            const $ = cheerio.load(body);
            const scriptElement = $('script[type="application/ld+json"]');
            const jsonString = scriptElement.html();
            const bodyObject = JSON.parse(jsonString);
            console.log('bodyObject', bodyObject);
            title = bodyObject.name;
            rating = bodyObject.contentRating;
            duration = bodyObject.duration;
            duration = duration.replace('PT', '');
            genre = bodyObject.genre;
            releaseDate = bodyObject.datePublished;
            imdbRating = bodyObject.aggregateRating.ratingValue;
            poster = bodyObject.image;
            summary = bodyObject.description;
            directors = [];
            bodyObject.director.forEach((element) => {
                directors.push(element.name);
            });
            writers = [];
            bodyObject.creator.forEach((element) => {
                if (element['@type'] === 'Person') {
                    writers.push(element.name);
                }
            });
            actors = [];
            bodyObject.actor.forEach((element) => {
                actors.push(element.name);
            });

            companies = [];
            bodyObject.creator.forEach((element) => {
                if (element['@type'] === 'Organization') {
                    companies.push(element.url);
                }
            });

            trailer = bodyObject.trailer.embedUrl

            const movie = {
                imdbID,
                title,
                rating,
                duration,
                genre,
                releaseDate,
                imdbRating,
                poster,
                summary,
                directors,
                writers,
                actors,
                companies,
                trailer
            };
            movieCache[imdbID] = movie
            return movie;
        });
}

module.exports = { searchMovies, getMovie };
