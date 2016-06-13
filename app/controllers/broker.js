// var mongoose = require('mongoose')
//   , Broker = mongoose.model('Broker')
var passport = require('koa-passport')


exports.login = function *login(next) {
  if(this.request.method === 'POST'){

    var ctx = this
    yield* passport.authenticate('local', function*(err, user, info) {
      if (err) {
        ctx.status = 500
        ctx.body = err.toString()
        return
      }
      if (user === false) {
        ctx.status = 401
        ctx.redirect('/login')
      } else {
        yield ctx.login(user)
        ctx.redirect('/')
      }
    }).call(this, next)
  }
  else{
    this.view = 'broker/login'
    yield *next
  }
};