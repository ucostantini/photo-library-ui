const {faker} = require('@faker-js/faker');
const jsonServer = require('json-server');
const cors = require('cors');

function file() {
    return {
        fileURL: faker.image.imageUrl(400, 200, 'dog', true),
        thumbnailURL: faker.image.imageUrl(640, 480, 'dog', true)
    };
}

const NO_FILES = 5;

function card() {
    return {
        id: faker.datatype.number(),
        title: faker.commerce.productMaterial() + ' ' + faker.company.catchPhrase(),
        tags: faker.helpers.uniqueArray(faker.random.word, 8),
        files: Array.from({length: NO_FILES}, file),
        author: faker.internet.userName(),
        website: faker.internet.domainWord(),
        created: faker.date.past(),
        modified: faker.date.past()
    };
}

const NO_CARDS = 50;
const NO_TAGS = 100;

function tags() {
    return {
        tags: faker.helpers.uniqueArray(faker.random.word, NO_TAGS)
    };
}

function post() {
    return {
        message: "Card successfully created"
    };
}

function put() {
    return {
        message: "Card successfully updated"
    };
}

function del() {
    return {
        message: "Card successfully deleted"
    };
}

const RESULT_CARDS = Array.from({length: NO_CARDS}, card);

function get() {
    return {
        message: "Search successfully performed",
        results: RESULT_CARDS
    };
}

const server = jsonServer.create();
//const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const SERVER_PORT = 3034;

server.use(cors({exposedHeaders: ['X-Total-Count']}));
// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Add custom routes before JSON Server router
server.get('/cards', (req, res) => {
    res.setHeader("X-Total-Count", NO_CARDS);
    res.json(get());
});

server.get('/tags', (req, res) => {
    res.json(tags());
});

// To handle POST, PUT and PATCH you need to use a body-parser
// You can use the one used by JSON Server
server.use(jsonServer.bodyParser);
/*
server.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:' + SERVER_PORT);
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
    next();
});
*/
server.use((req, res, next) => {
    if (req.method === 'POST') {
        res.json(post());
    }
    if (req.method === 'PUT') {
        res.json(put());
    }
    if (req.method === 'DELETE') {
        res.json(del());
    }
    // Continue to JSON Server router
    next();
});

// Use default router
//server.use(router);

server.listen(SERVER_PORT, () => {
    console.log('JSON Server is running at ' + SERVER_PORT);
});

