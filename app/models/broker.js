var mongoose = require('mongoose')
var Schema = mongoose.Schema
var bcrypt = require('bcrypt')
var shortid = require('shortid')

const SALT_WORK_FACTOR = 8


var BrokerSchema = new Schema({
  username: {
    type: String,
    lowercase: true,
    required: true,
    index: {
      unique: true
    }
  },
  password: String,
  email: {
    type: String,
    lowercase: true,
    required: true,
    index: true
  },
  name: String,
  code: {
    type: String,
    index: {
      unique: true
    }
  }
})


BrokerSchema.pre('save', function(next) {
  if (this.isNew) {
    var self = this;
    this.code = shortid.generate();
    bcrypt.hash(this.password, SALT_WORK_FACTOR, function(err, hash) {
      self.password = hash;
      next(err)
    });
  }else{
    next()
  }
});


BrokerSchema.methods = {


  comparePassword(password, next) {
    bcrypt.compare(password, this.password, next)
  }
}


module.exports = mongoose.model('Broker', BrokerSchema)
