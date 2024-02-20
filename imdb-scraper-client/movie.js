const main = document.querySelector('main');
const imdbID = window.location.search.match(/imdbID=(.*)/)[1];

const BASE_URL = 'http://localhost:3000/movie';

function getMovie(imdbID) {
    return fetch(`${BASE_URL}/${imdbID}`).then((res) => res.json());
}

getMovie(imdbID).then(showMovie);

function showMovie(movie) {
    const section = document.createElement('section');
    main.appendChild(section);

    //format releaseDate to be more human readable
    const releaseDate = new Date(movie.releaseDate);
    movie.releaseDate = releaseDate.toDateString();

    const properties = ['rating', 'duration', 'releaseDate', 'summary', 'actors'];
    const descriptionHtml = properties.reduce((html, property) => {
        html += `<dt class="col-3">${property}</dt>
                <dd class="col-9">${movie[property]}</dd>`;
        return html;
    }, '');

    section.outerHTML = `
        <section class="row">
            <h1 class="text-center">${movie.title}</h1>
            <div class="col-sm-12">
                <img src="${movie.poster}" class="img-fluid"
            </div>
            <div class="col-12">
                <dl class="row">
                    ${descriptionHtml}
                </dl>
            </div>
        </section>
    `;
}
