const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares)
server.use(jsonServer.bodyParser)
// Add custom routes before JSON Server router
server.post('/cards', (req, res) => {
  console.log(JSON.stringify(req.body))
  res.jsonp({
    "code": 201,
    "message": "OK"
  })
})

server.delete('/cards', (req, res) => {
  console.log(JSON.stringify(req.body))
  res.jsonp({
    "code": 200,
    "message": "OK"
  })
})

server.post('/files', (req, res) => {
  console.log(JSON.stringify(req.body))
  res.jsonp({
    "code": 201,
    "message": "OK",
    "fileId": (Math.random() * 10) | 0
  })
})

server.delete('/files', (req, res) => {
  console.log(JSON.stringify(req.body))
  res.jsonp({
    "code": 200,
    "message": "OK"
  })
})

// Use default router
server.use(router)
server.listen(3000, () => {
  console.log('JSON Server is running on port localhost:3000/')
})
