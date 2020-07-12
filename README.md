
# Table of Contents

1.  [easier-requests](#org60fe1ca)
    1.  [Install](#org5bf0777)
    2.  [Usage](#orgdb5ca87)


<a id="org60fe1ca"></a>

# easier-requests

`easier-requests` is a page to allow HTTP requests to be made in a more
synchronous manner inside an async function.


<a id="org5bf0777"></a>

## Install

\#+BEGIN<sub>EXAMPLE</sub> shell
npm i easier-requests
\#-END<sub>EXAMPLE</sub>


<a id="orgdb5ca87"></a>

## Usage

\#-BEGIN<sub>EXAMPLE</sub> js
import {requester} from "easier-requests";

async function makeCards() {
  const cardsContainer = document.querySelector('.cards-container');

const id = requester.createUniqueID(); */ get a unique id
/* perform request
await requester.get('https://lambda-times-backend.herokuapp.com/articles',
                    id);

// retrieve response, checking for an error
const response = requester.response(id);
if (response `=` undefined) {
  const errorMessage = 'ERROR RETRIEVING ARTICLES: ' +
        \`${requester.error(id)}\`;
  const errorDisplay = document.createElement('h1');
  errorDisplay.textContent = errorMessage;
  cardsContainer.appendChild(errorDisplay);
  return;
}

  // process data
  const topics = response.data.articles;
  for (let topic in topics)
    for (let article of topics[topic]) {
      const card = makeCard(article);
      cardsContainer.appendChild(card);
    };
}
\#-END<sub>EXAMPLE</sub>

