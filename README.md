
# Table of Contents

1.  [easier-requests](#org79c7c31)
    1.  [Install](#orgaaea06b)
    2.  [Usage](#orgef6d0c0)


<a id="org79c7c31"></a>

# easier-requests

`easier-requests` is a package to allow HTTP requests to be made in a more
synchronous manner inside an async function.


<a id="orgaaea06b"></a>

## Install

```sh
npm i easier-requests
```


<a id="orgef6d0c0"></a>

## Usage

```js
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
```
