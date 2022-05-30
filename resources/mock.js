const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares)
server.use(jsonServer.bodyParser)
// Add custom routes before JSON Server router
server.post('/picture', (req, res) => {
  console.log(JSON.stringify(req.body))
  res.jsonp("201 OK")
})

// Use default router
server.use(router)
server.listen(3000, () => {
  console.log('JSON Server is running')
})
