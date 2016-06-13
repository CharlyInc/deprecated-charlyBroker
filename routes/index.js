var router = require('koa-router')();
var partner = require('../app/partner');
var broker = require('../app/controllers/broker');
 
router.get('/', function *(next) {
  if (this.isAuthenticated()) {
    yield* next
  } else {
    this.redirect('/login')
  }
}, partner.list);

router.all('/login', broker.login);

module.exports = router;
