var passport = require('koa-passport')

var Broker = require('./app/models/broker.js')

Broker.findOne({ username: 'test' }, function (err, testUser) {
  if (!testUser) {
    console.log('test user did not exist; creating test user...')

    testUser = new Broker({
      username: 'test',
      password: '111111',
      email: 'test@getcharly.com'
    })

    testUser.save()
  }
})

passport.serializeUser(function(user, done) {
  done(null, user._id)
})

passport.deserializeUser(function(id, done) {
  Broker.findById(id, done);
})

const LocalStrategy = require('passport-local').Strategy
passport.use(new LocalStrategy(function(username, password, done) {
  Broker.findOne({ username: username}, function(err, broker){
    if(err)
      return done(err);

    if(!broker)
      return done(new Error('User not found'))
    broker.comparePassword(password, function(err, verfied){
      if(err)
        return done(err)
      if(verfied)
        return done(null, broker)
      else
        return done(new Error('Incorrect password'))
    })

  })
}))
