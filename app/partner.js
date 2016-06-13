var db = require('monk')('localhost/charly');
var wrap = require('co-monk');
var partners = wrap(db.get('partner'));
var parse = require('co-body');
var sendgrid  = require('sendgrid')('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');


exports.list = function *list(next) {
  var res = yield partners.find({status: 3});
  if (!res) this.throw(404, 'No partners');

  this.view = 'partner/list'
  this.data = res
  yield *next
};


exports.load = function *load() {
  var id = this.params.id;

  if(!id.match(/^[0-9a-fA-F]{24}$/))
    this.throw(400, 'Invalid partner Id');

  var partner = yield partners.findOne({_id: id});
  if (!partner) this.throw(404, 'Partner not found');
  this.body = partner;
};


module.exports.update = function *update() {
  var id = this.params.id;

  if(!id.match(/^[0-9a-fA-F]{24}$/))
    this.throw(400, 'Invalid partner Id');

  var partner = yield parse(this);
  
  partner.status = parseInt(partner.status);
  
  if(partner.status == 4 && !partner.level)
    this.throw(400, 'Missing partner level');
  
  if(partner.status == 4)  
    partner.level = parseInt(partner.level);
  
  var res = yield partners.updateById(id, {$set: partner});

  if(partner.status ==4 && res) {
    if(partner.device_type == 'ios')
      yield sendApprovalEmail(id);
    else
      yield sendAndroidEmail(id);
  }

  this.body = res;
};


function *sendApprovalEmail(id){

  var payload   = {
    to      : '',
    from    : 'info@getcharly.com',
    subject : 'Saying Hi',
    text    : ''
  }

  var partner = yield partners.findOne({_id: id});

  payload.to = partner.email;

  payload.text = 'Dear ' + partner.name + ',\n Your Charly verification code is ' + partner.verification_code;

  sendgrid.send(payload, function(err, json) {
    if (err)
      console.log(err);
    else
      console.log(json);
  });
}


function *sendAndroidEmail(id){

  var payload   = {
    to      : '',
    from    : 'info@getcharly.com',
    subject : 'Android App is coming',
    text    : ''
  }

  var partner = yield partners.findOne({_id: id});

  payload.to = partner.email;

  payload.text = 'Dear ' + partner.name + ',\n Our Android App will be released soon. We will let you know by then.';

  sendgrid.send(payload, function(err, json) {
    if (err)
      console.log(err);
    else
      console.log(json);
  });
}


module.exports = exports;