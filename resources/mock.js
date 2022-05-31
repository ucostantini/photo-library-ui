const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);
server.use(jsonServer.bodyParser);
// Add custom routes before JSON Server router
server.get('/cardsCount&search', (req, res) => {
  console.log(JSON.stringify(req.body));
  res.jsonp({
    "pageIndex": 0,
    "pageSize": 1,
    "length": 3
  });
});

server.get('/cards?search', (req, res) => {
  console.log(JSON.stringify(req.body));
  res.jsonp([{
    "cardId": 4,
    "title": "Title 5",
    "files": [
      5
    ],
    "tags": [
      "tag5",
      "tag1",
      "tag2"
    ],
    "source": {
      "website": "Twitter",
      "userName": "John Smith"
    }
  },
    {
      "cardId": 5,
      "title": "Title 6",
      "files": [
        6
      ],
      "tags": [
        "tag3",
        "tag2",
        "tag3"
      ],
      "source": {
        "website": "Twitter",
        "userName": "John Smith"
      }
    }
  ]);
});

server.post('/cards', (req, res) => {
  console.log(JSON.stringify(req.body));
  res.jsonp({
    "code": 201,
    "message": "OK"
  });
});

server.delete('/cards', (req, res) => {
  console.log(JSON.stringify(req.body));
  res.jsonp({
    "code": 200,
    "message": "OK"
  });
});

server.post('/files', (req, res) => {
  console.log(JSON.stringify(req.body));
  res.jsonp({
    "code": 201,
    "message": "OK",
    "fileId": (Math.random() * 10) | 0
  });
});

server.delete('/files', (req, res) => {
  console.log(JSON.stringify(req.body));
  res.jsonp({
    "code": 200,
    "message": "OK"
  });
});

// Use default router
server.use(router);
server.listen(3000, () => {
  console.log('JSON Server is running on port localhost:3000/')
});
