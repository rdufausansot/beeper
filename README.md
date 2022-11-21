# beeper

Mines Nancy Web dev seminar.

## How Input/Output (IO) is done in Javascript

Example with reading a file (could also work with "performing an HTTP request", "performing a SQL query", ...):

```js
// index.mjs
import { readFileSync, readFile } from "node:fs";
import { readFile as readFile2 } from "node:fs/promises";

// Bad: blocking
// But also, easy to read (sequential)
try {
  let data = readFileSync("test1.txt", "utf-8");
  console.log(data);
  data = readFileSync("test2.txt", "utf-8");
  console.log(data);
  console.log("SOMETHING ELSE SYNC\n");
} catch (e) {
  // recover from error
}

// Old school
// Can lead to a lot of nested callbacks (functions) ("callback hell")
readFile("test1.txt", "utf-8", (err, data) => {
  if (err) {
    // recover
    return;
  }
  console.log(data);
  readFile("test2.txt", "utf-8", (err, data) => {
    if (err) {
      return;
    }
    console.log(data);
  });
});
console.log("SOMETHING ELSE WITH CALLBACKS\n");

// Promises
// Better (no nesting), but still not as neat as sequential code
readFile2("test1.txt", "utf-8")
  .then(() => {
    console.log(data);
    return readFile2("test2.txt", "utf-8");
  })
  .then((data) => {
    console.log(data);
  })
  .catch((err) => {
    // recover
  });

// async/await
// Non blocking AND sequential
async function withAsyncAwait() {
  // an async function is a function that always returns a promise
  try {
    let data = await readFile2("test1.txt", "utf-8"); // in async functions, promises can be awaited
    console.log(data);
    data = await readFile2("test2.txt", "utf-8");
    console.log(data);
  } catch (e) {
    // recover
  }
}

withAsyncAwait();
console.log("SOMETHING ELSE WITH ASYNC/AWAIT\n");
```

## Setup your local env

### Prerequisite

 - [Nodejs](https://nodejs.org/en/), preferably version 18. Check: `node --version` should print your version of Node.
 - [Docker](https://www.docker.com/). Check: `(sudo) docker run hello-world` should print a lovely greeting message.
 - [Docker-compose](https://docs.docker.com/compose/install/)
 - VSCode
 - [Postman](https://www.postman.com/) to easily perform HTTP requests

### Pull the code

 - Fork this repository
 - Pull it to your computer
 - Checkout the `start` branch. It contains the beeper frontend in the `web` folder. You are in charge of building the backend for this application.
 - If you are stuck, you can at any point check the `main` branch that contains the full, working code. We have limited time, and spending it chasing a silly bug is probably not the best use of it!

### Start the local database

In the `beeper` folder, run `docker-compose up -d`. This reads the `docker-compose.yaml` file and magically starts for us:

 - a Postgresql database on port 5432
 - an Adminer server on port 8181 which we will use to inspect the database and run SQL commands
 
Visit `localhost:8181` in your browser. Log in Adminer with the following settings (password `example`):
 
<img width="676" alt="image" src="https://user-images.githubusercontent.com/103181765/204134093-9fa0ae7b-7728-46e7-a5f4-fa108736161e.png">

Run the `model.sql` (root of this repo) to create the database model.

## Create the application

Create an `api` folder, then `cd` into it
 
Install the dependencies: copy the following in a `package.json` file, then run `npm install`:
```json
 {
  "name": "api",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "dependencies": {
    "auth0": "^2.44.0",
    "body-parser": "^1.20.1",
    "camelcase-keys": "^8.0.2",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "express-async-errors": "^3.1.1",
    "express-jwt": "^7.7.7",
    "jwks-rsa": "^3.0.0",
    "pg": "^8.8.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}
```
 
Create an `src` folder, and an `src/index.js` file:
```js
// In index.js
 
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
 res.status(200).send("Hello world");
});

app.listen(8080);
```

Run the app with `node src/index.js`, then test it by navigating to `localhost:8080` in your browser.
Stop the app, then rerun it with `npx nodemeon src/index.js`. This will automatically restart your app on file change.

## Load environment variables and secrets

Some variables in our application depend on the environment in which the application is being run (locally, on a development/production server, ...). In our case, it's:
 - the database credentials
 - the authentication service (Auth0) credentials
 It would not be convenient to hardcode them directly in our application, so we use "environment variables" that will be loaded on startup.
 
 In `api`, create a `.env` file with the following content:
 ```txt
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=example
PGDATABASE=postgres

AUTH0_DOMAIN=dev-vdt8h6o8k0l5v2wj.us.auth0.com
AUTH0_CLIENT_ID=7Ty4LYvSY7nRBDhb6zmjDjlkalCg97CB
AUTH0_CLIENT_SECRET=<this should not be in a public repository, ask Martin>
AUTH0_AUDIENCE=https://beeper-api
```

As it will contains secrets, we should not commit this file to a git repository (it's already to the root `.gitignore`).

Add the following line at the very top of your `index.js`:
```js
import "dotenv/config.js"
```

Check that environment variables are correctly loaded by adding a temporary `console.log(process.env)` after this import line. It should log the env variables from our `.env` file (among others).

## Add an authentication middleware

Create an `src/auth/jwt-middleware.js` file:
```js
import { expressjwt } from "express-jwt";
import jwksRsa from "jwks-rsa";

export const checkJwt = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  }),

  audience: "https://beeper-api",
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ["RS256"],
});
```
This is shamelessly copy-pasted from Auth0's docs. This creates a `checkJwt` express middleware that:
 1. Checks if an `Authorization` header is present in the HTTP request in the form of `Bearer <some authentication json web token>`
 2. Decodes this Json Web Token (JWT), and checks its signature using the private key that can be found at the `jwksUri` we provided
 3. Checks that the JWT was built to call this API in particular ("audience"), to be sure it was not meant to call a different API but was then stolen by an attacker.
 4. If the signature is valid, adds an `auth` field to the express request object with the conteht of the JWT (including the user ID), and hands control to the next middleware in the chain.
 5. If any of the previous steps fails, directly responds an error (code 401 or 403).

Back to `index.js`, import this middleware and use it:
```js
// ...imports
import { checkJwt } from "./auth/jwt-middleware.js";

//... app.use(bodyParser.json());
app.use(checkJwt);
```

When visiting `localhost:8080`, you should now see an error. We need to provide an authentication token, using Postman for instance:

<img width="910" alt="image" src="https://user-images.githubusercontent.com/103181765/204162197-4f22798f-a5df-467e-9813-721c4250e805.png">

Replace your handler with the following code to get your user ID in the response:

```js
app.get("/", (req, res) => {
  res.status(200).send(`Hello ${req.auth.sub}`);
});
```

## POST /beep route

To post a beep, we need a way to speak to our database from our Node app. We do it with the `pg` (short for Postgresql) package. Create an `src/db/connection-pool.js` file:

```js
import pg from "pg";
import camelcaseKeys from "camelcase-keys";

// pools will use environment variables
// for connection information
export const pool = new pg.Pool();

export async function queryNormalized(...args) {
  const res = await pool.query(...args);
  return camelcaseKeys(res.rows);
}
```

We export a database connection pool as well as a small helper that uses a connection from the pool to run a SQL query, then turns the `snake_case` fields in the response into `camelCase`.

Create a `src/db/insert-beep.js` file:
```js
import { queryNormalized } from "./connection-pool.js";

export async function insertBeep(userId, content) {
  const inserted = await queryNormalized(
    `
        INSERT INTO beep (author_id, content) VALUES ($1, $2) RETURNING *
    `,
    [userId, content]
  );

  return inserted[0];
}
```
This function inserts a beep into the database and returns the inserted row (it's useful because the database automatically created an ID and a creation date on insertion).

Create an `src/use-case/post-beep.js` file:
```js
import { insertBeep } from "../db/insert-beep.js";

const BEEP_MAX_LENGTH = 280;

export class BeepTooLongError extends Error {}

export async function postBeep(userId, content) {
  if (content.length > BEEP_MAX_LENGTH) {
    throw new BeepTooLongError();
  }

  const insertedBeep = await insertBeep(userId, content);

  return insertedBeep;
}
```

Finally, in `src/index.js`, add a POST route:

```js
// ...imports
import { postBeep, BeepTooLongError } from "./use-case/post-beep.js";

// ...
app.post("/beep", async (req, res) => {
  try {
    const postedBeep = await postBeep(req.auth.sub, req.body.content);
    res.status(201).json(postedBeep);
  } catch (e) {
    if (e instanceof BeepTooLongError) {
      res.status(400).send("Beep too long");
    } else {
      throw e;
    }
  }
});
```

You can test it:
 - Start the frontend (`npm start` from the `web` folder)
 - Login
 - Enter some text, press Enter
 - For now, it should show a big error on screen as we're still missing some home page logic, but your Network tab should show a successful 201 request, and you should see in Adminer that a row was added to the `beep` table.

## GET /home

In `src/db/get-home-beeps.js`, get followed tweets + own tweets (this could probably have been simpler with separate SQL queries, but why not):
```js
import { queryNormalized } from "./connection-pool.js";

export async function getHomeBeeps(userId) {
  return await queryNormalized(
    `
    SELECT 
      beep.id,
      author_id, 
      created_at, 
      content,
      like_count,
      liked.id IS NOT NULL AS "liked"
    FROM 
      beep 
      JOIN follow ON author_id = followee AND follower = $1
      LEFT JOIN liked ON beep.id = liked.beep_id AND liker_id = $1
    UNION 
    SELECT
      beep.id, 
      author_id, 
      created_at, 
      content,
      like_count,
      liked.id IS NOT NULL AS "liked"
    FROM 
      beep
      LEFT JOIN liked ON beep.id = liked.beep_id AND liker_id = $1
    WHERE 
      author_id = $1
    ORDER BY 
      created_at DESC 
    LIMIT 
      10
    `,
    [userId]
  );
}

```

In `src/use-case/get-user-home.js`:
```js
import { getAuth0UsersByIds } from "../auth/auth0-client.js";
import { getHomeBeeps } from "../db/get-home-beeps.js";
import { mergeBeepsAuthors } from "../utils/merge-beeps-authors.js";

export async function getUserHome(userId) {
  const beeps = await getHomeBeeps(userId);

  const users = await getAssociatedUsers(beeps);

  mergeBeepsAuthors(beeps, users);

  return beeps;
}

async function getAssociatedUsers(beeps) {
  const authorIds = beeps.map((beep) => beep.authorId);
  return await getAuth0UsersByIds(authorIds);
}
```

In `src/utils/merge-beeps-authors.js`:
```js
export function mergeBeepsAuthors(beeps, authors) {
  const authorsByIds = {};
  for (const author of authors) {
    authorsByIds[author.userId] = author;
  }

  for (const beep of beeps) {
    beep.author = authorsByIds[beep.authorId];
  }
}
```

In `src/index.js`:
```js
// add necessary imports and:

app.get("/home", async (req, res) => {
  const home = await getUserHome(req.auth.sub);
  res.status(200).json(home);
});
```

## Remaining routes

 - PUT /like/:beep_id
 - PUT /unlike/:beep_id
 - GET /user/:username
 - PUT /follow/:username
 - PUT /unfollow/:username

They work quite same: write a database query method, a "use case" and add a route in index.js to handle HTTP-related things.

## Appendix: Setup your own Auth0 account

 - [Create an account](https://auth0.com/signup?place=header&type=button&text=sign%20up)
 - Choose `I have used Auth0 before`, then `Get started`
 - In the `Applications > Applications` menu, click `+ Create Application`, name it `Beeper frontend` and choose `Single Page Web Applications`.
 - In your new application settings, add `http://localhost:3000` to `Allowed Callback URLs`, `Allowed Logout URLs` and `Allowed Web Origins`, then save the changes. This will allow our local frontend to access Auth0 authentication.
 - Create another Application, this time of type `Machine to Machine`. Name it `Auth0 API client`, allow it to call the `Auth0 Management API` with permission `read:users`. The created secrets will be used by the backend to retrieve user information.
 - In the `Applications > APIs` menu, click `+ Create API`. Name it `Beeper API` and set `https://beeper-api` as identifier. This describes the API exposed by our backend and that will be consumed by the frontend.
 
