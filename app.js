var koa = require('koa');
var app = new koa();

var logger = require('koa-logger')
var serve = require('koa-static');

var router = require('./routes/index');

var views = require('co-views');
var render = views(__dirname + '/app/views', {
    map: { html: 'swig' }
  })

// MongoDB
var mongoose = require('mongoose')
mongoose.connect((process.env.MONGODB_URI || 'localhost') + '/charly')

// sessions
var convert = require('koa-convert')
var session = require('koa-generic-session')
var MongoStore = require('koa-generic-session-mongo')

app.keys = ['your-session-secret']

app.use(session(app))

// body parser
var bodyParser = require('koa-bodyparser')
app.use(bodyParser())

// authentication
require('./auth')
var passport = require('koa-passport')
app.use(passport.initialize())
app.use(passport.session())

// logger 
app.use(logger())
app.use(serve('./public'));


app.use(router.routes())



app.use(function *(next) {
  if (this.render !== false) {
    try{
      var params = {
        cache: false,
        data: this.data
      };

      if (this.req.user)
        params['user'] = this.req.user

      this.body = yield render(this.view, params)
    }catch(err){
      this.throw(404, 'view file not found')
    }
  }else{
    this.body = this.data
  }
  yield* next
})
 
app.listen(3000);
