//--------------------------------------------------
// easynote
//--------------------------------------------------
// Andy Yang.
// 22.05.03-18:20 - Init version
// 22.05.18 - easynote.app 폴더구조로 concept 크게 변경. (easynote collection은 필수. easynote.member는 옵션. easynote 자체는 기본은 관리자전용. 설정하면 로그인사용자사용가능.)
//--------------------------------------------------
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.pluralize(null); // collection name을 복수화(-s)하려는 것 강제로 비활성화


//############################
// easynote model
//############################
// easynote.member는 회원 테이블이 없는 시스템에서 사용 가능한 간단 회원 테이블..
// 이미 회원정보가 있다면 Easynote_Oath에 설정하여 연동사용하자.
// 현재는 세션 기반이고, db 등으로 연동하고 싶다면 변경 사용하면 될터..
var easynote_member_schema = new Schema({
  user_id: { type: String },
  user_pw: { type: String },
  level: { type: Number, default: 9999 },
  date: { type: Date, default: Date.now },
})
var easynote_schema = new Schema({
  num_link: { type: Number }, // 확장용. 댓글 등 추가된 easynote와의 연동을 위한 것..
  num: { type: Number, unique: true }, // auto increment 어케하냐..
  name: { type: String },
  note: { type: String },
  user_id: { type: String },
  date: { type: Date, default: Date.now },
  // file ???
})


//############################
// easynote functions
//############################
// functions
function replaceAll(str, searchStr, replaceStr) {
  return str.split(searchStr).join(replaceStr);
}
function set_session_user_id(req, user_id) {
  console.log(`set_session_user_id(${user_id})`)
  if (req.session.user_id) {
      console.log('easynote.member user already logged in')
  }
  else {
      console.log('easynote.member user set session')
      req.session.user_id = user_id;
  }
}
function set_session_admin_id(req, admin_id) {
  console.log(`set_session_admin_id(${admin_id})`)
  if (req.session.admin_id) {
      console.log('easynote.member admin already logged in')
  }
  else {
      console.log('easynote.member admin set session')
      req.session.admin_id = admin_id;
  }
}
function set_user_readable(req, readable) {
  console.log(`set_user_readable(${readable})`)
  req.session.user_readable = readable;
}
function set_user_writable(req, writable) {
  console.log(`set_user_writable(${writable})`)
  req.session.user_writable = writable;
}
function is_user_login(req) {
  return req.session.user_id
}
function is_admin_login(req) {
  return req.session.admin_id;
}
function is_user_readable(req) {
  return req.session.user_readable;
}
function is_user_writable(req) {
  return req.session.user_writable;
}
function user_logout(req) {
  req.session.user_id = null;
  req.session.admin_id = null;
  console.log(`user_logout() success`)
}
function session_destroy(req) {
  req.session.destroy(() => {
      //res.redirect('/');
  })
  console.log(`sesstion_destroy() success`)
}


//############################
// easynote pages
//############################
// welcome page
router.get('/', (req, res, next) => {
  console.log(`${req.url} | easynote page`)

  mongoose.connection.db.listCollections({name: 'easynote'}).next(function(err, collinfo) {
    if (collinfo) {
      console.log(`easynote collection exists.`)
      
      let html = null;
      if (is_admin_login(req) || (is_user_login(req) && is_user_readable(req))) {
        html = fs.readFileSync(_env.ROOT + '/easynote/list.html', 'utf8');
      }
      else {
        html = fs.readFileSync(_env.ROOT + '/easynote/login.html', 'utf8');
      }

      if (html) {
        //data = data.replaceAll('[groupid]', groupid)
        html = html.replaceAll('[root]', `${_env.HOST_URI}:${_env.PORT}/easynote`)
        html = html.replaceAll('[systemdate]', Date.now()); // OK. - 1970.01.01이후 경과된 ms. front에서는 var sysdate = new Date([systemdate]); 로 사용.
        //data = data.replaceAll('[systemdate]', new Date()); // OK. - front에서는 var sysdate = new Date('[systemdate]'); 로 사용
        res.send(html);
      }
    }
    else {
      html = fs.readFileSync(_env.ROOT + '/easynote/welcome.html', 'utf8');

      if (html) {
        //data = data.replaceAll('[groupid]', groupid)
        html = html.replaceAll('[root]', `${_env.HOST_URI}:${_env.PORT}/easynote`)
        html = html.replaceAll('[systemdate]', Date.now()); // OK. - 1970.01.01이후 경과된 ms. front에서는 var sysdate = new Date([systemdate]); 로 사용.
        //data = data.replaceAll('[systemdate]', new Date()); // OK. - front에서는 var sysdate = new Date('[systemdate]'); 로 사용
        res.send(html);
      }
    }
  })
});
// page: login
router.get('/login', (req, res, next) => {
  console.log(`${req.url} | easynote page`)

  data = fs.readFileSync(_env.ROOT + '/easynote/login.html', 'utf8');

  if (data) {
    //data = data.replaceAll('[groupid]', groupid)
    data = data.replaceAll('[root]', `${_env.HOST_URI}:${_env.PORT}/easynote`)
    data = data.replaceAll('[systemdate]', Date.now()); // OK. - 1970.01.01이후 경과된 ms. front에서는 var sysdate = new Date([systemdate]); 로 사용.
    //data = data.replaceAll('[systemdate]', new Date()); // OK. - front에서는 var sysdate = new Date('[systemdate]'); 로 사용
    res.send(data);
  }
})
// page: write
router.get('/write/:num?', (req, res, next) => {
  var num = req.params.num;
  console.log(`${req.url} | easynote page`)

  let data = fs.readFileSync(_env.ROOT + '/easynote/write.html', 'utf8');
  if (data) {
    data = data.replaceAll('[num]', num)
    data = data.replaceAll('[root]', `${_env.HOST_URI}:${_env.PORT}/easynote`);
    res.send(data);
  }
})
// page: read
router.get('/read/:num', (req, res, next) => {
  var num = req.params.num;
  console.log(`${req.url} | easynote page`)

  let data = fs.readFileSync(_env.ROOT + '/easynote/read.html', 'utf8');
  if (data) {
    data = data.replaceAll('[num]', num)
    data = data.replaceAll('[root]', `${_env.HOST_URI}:${_env.PORT}/easynote`);
    data = data.replaceAll('[systemdate]', Date.now());
    res.send(data);
  }
})
// page: favicon.ico <= browser에서 자동호출되어 2번 실행되어 막기.
// 해결1) favicon.ico 등록
// 해결2) html코드에 추가 : <link rel="icon" href="data:,"> => 이것도 안되고..
// 해결3) 아래코드로 204 처리.. => 이것도 안되고..
// 해결4) /easynote가 아니라 / 에 넣어야 하나해서 넣어봐도 안되네..
// page: /favicon.ico
router.get('/favicon.ico', function(req, res, next) {
  console.log(`${req.url} | ${_env.APP_NAME} page`)
  return res.status(204);
});


//############################
// easynote apis
//############################

// create api
router.post('/create', (req, res, next) => {
  var collection = req.query.collection;
  console.log(`${req.url} | easynote api`)

  if (collection == 'easynote') {
    console.log(`easynote collection create start`)

    mongoose.connection.db.listCollections({name: 'easynote'}).next(function(err, collinfo) {

      if (collinfo) {
        console.log('easynote collection already exist');

        res.json({
          result: {
            success: true,
            message: 'easynote collection already created.'
          }
        });
      }
      else {
        console.log('easynote collection not exist')

        mongoose.connection.db.createCollection('easynote').then(() => {
          mongoose.connection.db.listCollections({name: 'easynote'}).next(function(err, collinfo) {
            if (collinfo) {
              console.log('easynote collection exist');

              Easynote = mongoose.model('easynote', easynote_schema);
              var easynote = new Easynote();

              res.json({
                result: {
                  success: true,
                  message: 'easynote collection created.'
                }
              });
            }
            else {
              console.log('easynote collection create failed.');
              
              res.json({
                result: {
                  success: false,
                  message: 'easynote collection create failed.'
                }
              });
            }
          });
        });
              
      }

    });
  }
  else if (collection == 'easynote.member') {
    console.log(`easynote.member collection create start`)

    var admin_id = req.body.admin_id;
    var admin_pw = req.body.admin_pw;

    // base64 encode 한글가능 => decodeURIComponent(atob(pw));
    admin_pw = btoa(encodeURIComponent(admin_pw));
    console.log(`${admin_id} ${admin_pw}`)

    mongoose.connection.db.createCollection('easynote.member').then(() => {
      mongoose.connection.db.listCollections({name: 'easynote.member'}).next(function(err, collinfo) {

        if (collinfo) {
          console.log('easynote.member collection exist')

          EasynoteMember = mongoose.model('easynote.member', easynote_member_schema);
          var easynotemember = new EasynoteMember();
          easynotemember.user_id = admin_id;
          easynotemember.user_pw = admin_pw;
          easynotemember.level = 0;
          easynotemember.save(function(err) {
            if (err) {
              console.log('easynote.member save error')
              res.json({
                result: {
                  success: false,
                  message: 'easynote.member collection created, but save error'
                }
              });
              return;
            }
            else {
              console.log('easynote.member admin created successfully.')
              res.json({
                result: {
                  success: true,
                  message: 'easynote.member collection created, and admin info saved successfully.'
                }
              });
            }
          })
        }
        else {
          console.log('easynote.member collection create failed.')
          res.json({
            result: {
              success: false,
              message: 'easynote.member collection create failed.'
            }
          });
        }

      });
    })
    .catch(err => {
      console.log('easynote.member collection already exist.')
      res.json({
        result: {
          success: true,
          message: 'easynote.member collection already created.'
        }
      });
    });
  }
});
// drop api
router.post('/drop', (req, res, next) => {
  console.log(`${req.url} | easynote api`)

  // session for admin_id
  if (is_admin_login(req)) {
    console.log('easynote.member admin logged in')

    mongoose.connection.db.dropCollection('easynote.member').then(() => {
      mongoose.connection.db.listCollections({name: 'easynote.member'}).next(function(err, collinfo) {

          if (collinfo) {
            console.log('easynote.member collection exist')

            res.json({
              result: {
                success: false,
                message: 'easynote.member collection drop failed'
              }
            });
          }
          else {
            console.log('easynote.member collection drop success.')

            mongoose.connection.db.dropCollection('easynote').then(() => {
              mongoose.connection.db.listCollections({name: 'easynote'}).next(function(err, collinfo) {

                if (collinfo) {
                  console.log('easynote collection exist')

                  res.json({
                    result: {
                      success: false,
                      message: 'easynote.member collection drop success, but easynote collection drop failed'
                    }
                  });
                }
                else {
                  console.log('easynote collection drop success.')
                }

              });
            }).catch(err => {
              console.log('easynote collection drop error')
            }).finally(() => {
              user_logout(req);

              res.json({
                result: {
                  success: true,
                  message: 'easynote.member and easynote collection drop success.'
                }
              })
            });

          }

      });
    });
  }
  else {
    console.log('easynote.member no admin logged in')

    res.json({
      result: {
        success: false,
        message: 'no admin logged in. permission error.'
      }
    });
  }
});

// api:login
router.post('/login', (req, res, next) => {
    console.log(`${req.url} | easynote api`)

    var user_id = req.body.user_id;
    var user_pw = req.body.user_pw;

    // base64 encode 한글가능 => decodeURIComponent(atob(pw));
    user_pw = btoa(encodeURIComponent(user_pw));
    console.log(user_id, user_pw);

    EasynoteMember = mongoose.model('easynote.member', easynote_member_schema);
    var easynotemember = new EasynoteMember();

    EasynoteMember.findOne({'user_id':user_id, 'user_pw':user_pw}, function(err, data) {
        if (err) {
            console.log('easynote.member findOne() error.')
            res.json({
                result: {
                    success: false,
                    message: 'easynote.member findOne() error.'
                }
            });
        }
        else {
            console.log(data)
            if (data == null) { // error: no data
                res.json({
                    result: {
                        success: false,
                        message: 'no easynote.member data'
                    }
                });
                return;
            }
            else {

                console.log('easynote.member user login ok.')

                // session for user_id
                set_session_user_id(req, user_id);

                // session for admin_id
                if (data['level'] == 0) {
                    set_session_admin_id(req, user_id);
                }

                res.json({
                    result: {
                        success: true,
                        message: 'easynote.member login ok.',
                        row: [
                            {
                                'user_id' : user_id,
                                'admin_id' : req.session.admin_id,
                            },
                        ]
                    }
                });

            }                
        }
    })
});
// api:islogin
router.post('/islogin', (req, res, next) => {
    console.log(`${req.url} | easynote api`)

    // session for user_id
    if (is_user_login(req)) {
        console.log('easynote.member user logged in')

        res.json({
            result: {
                success: true,
                message: 'user logged in'
            }
        });
    }
    else {
        console.log('easynote.member no uer logged in')

        res.json({
            result: {
                success: false,
                message: 'no user logged in'
            }
        });
    }
});
// api:isadmin
router.post('/isadmin', (req, res, next) => {
    console.log(`${req.url} | easynote api`)

    // session for admin_id
    if (is_admin_login()) {
        console.log('easynote.member admin logged in')

        res.json({
            result: {
                success: true,
                message: 'admin logged in'
            }
        });
    }
    else {
        console.log('easynote.member no admin logged in')

        res.json({
            result: {
                success: false,
                message: 'no admin logged in'
            }
        });
    }
});
// api:logout
router.post('/logout', (req, res, next) => {
    console.log(`${req.url} | easynote api`)

    if (!is_user_login(req) && !is_admin_login(req))
    {
        console.log('easynote no member logged in')

        res.json({
            result: {
                success: true,
                message: 'log out ok'
            }
        });
    }
    
    // session for user
    if (is_user_login(req) || is_admin_login(req)) {
        console.log('easynote member logged in')
        
        session_destroy(req);

        res.json({
            result: {
                success: true,
                message: 'log out successfully'
            }
        });
    }
});

// api:write post (save)
router.post('/write', function (req, res) {
  console.log(`${req.url} | easynote api : post`)

  var name = req.body.name;
  var note = req.body.note;

  console.log(name);

  if (is_admin_login(req) || (is_user_login(req) && is_user_writable(req))) {

    Easynote = mongoose.model('easynote', easynote_schema);

    Easynote.findOne({}).sort({ num: -1 }).limit(1).exec(function(err, data) { // num저장을 위한 num_max 찾기

      if (err) {
          console.log('easynote num exec() error');
          res.json({
              result: {
                  success: false,
                  message: 'easynote num_max error'
              }
          });
          return;
      }
      else {
        console.log('easynote data found.');

        var num_max = data['num'] + 1;
        console.log('num_max = ' + num_max);
        
        var easynote = new Easynote();
        easynote.num_link = 0;
        easynote.num = num_max;
        easynote.name = name;
        easynote.note = note;
        //easynote.date = getCurrentDate(); // ISODate()가 시스템시간과 꼬인다..
        easynote.user_id = is_user_login(req);
        easynote.save(function(err) {

          if (err) {
            console.log('easynote save error')
            res.json({
              result: {
                success: false,
                message: 'easynote save error'
              }
            });
            return;
          }
          else {
            console.log('easynote save successfully.')
            res.json({
              result: {
                success: true,
                message: 'easynote save successfully.',
                row: [
                  {
                    'num': num_max,
                  },
                ]
              }
            });
          }

        });
      }

    })
  }
  else {
    console.log('easynote save permission error')
    res.json({
      result: {
        success: false,
        message: 'easynote save permission error'
      }
    });
    return;
  }
})

// api:write put (edit)
router.put('/write', function (req, res) {
    console.log(`${req.url} | easynote api : put`)

    var num_post = req.body.num;
    var name = req.body.name;
    var note = req.body.note;

    pw = btoa(encodeURIComponent(pw));
    
    console.log(num_post, title, id, pw, access);

    if (num_post) { // edit

        Easynote.findOne({'num':num_post}, function(err, data) {
            if (err) {
                res.json({
                    result: {
                        success: false,
                        message: 'easynote edit error. err=' + err
                    }
                });
            }
            else {
                console.log(data)
                if (data == null) { // error: no data
                    res.json({
                        result: {
                            success: false,
                            message: 'no easynote edit data'
                        }
                    });
                    return;
                }
                else if (id != data['id'] || pw != data['pw']) { // error
                    res.json({
                        result: {
                            success: false,
                            message: 'permission error'
                        }
                    });
                    return;
                }
                else {

                    Easynote.updateOne({'num':num_post}, {
                        'title': title,
                        'note': note,
                        'access': access,
                    }, function(err) {
                        if (err) {
                            console.log('easynote edit error')
                            res.json({
                                result: {
                                    success: false,
                                    message: 'easynote edit error'
                                }
                            });
                            return;
                        }
                        else {
                            console.log('easynote edit successfully.')
                            res.json({
                                result: {
                                    success: true,
                                    message: 'easynote edit successfully.',
                                    row: [
                                        {
                                            'num': num_post,
                                        },
                                    ]
                                }
                            });
                        }
                    })

                }                
            }
        })

    }
    else {
        res.json({
            result: {
                success: false,
                message: 'easynote edit error - num wrong..'
            }
        });
        return;
    }
})

// api:write delete (delete)
router.delete('/write', function (req, res) {
    console.log(`${req.url} | easynote api : delete`)

    var num_post = req.body.num;
    var id = req.body.id;
    var pw = req.body.pw;

    pw = btoa(encodeURIComponent(pw));
    
    console.log(num_post, id, pw);

    if (num_post) { //

        Easynote.findOne({'num':num_post}, function(err, data) {
            if (err) {
                res.json({
                    result: {
                        success: false,
                        message: 'easynote delete error. err=' + err
                    }
                });
            }
            else {
                console.log(data)
                if (data == null) { // error: no data
                    res.json({
                        result: {
                            success: false,
                            message: 'no easynote delete data'
                        }
                    });
                    return;
                }
                else if (id != data['id'] || pw != data['pw']) { // error
                    res.json({
                        result: {
                            success: false,
                            message: 'permission error'
                        }
                    });
                    return;
                }
                else {

                    Easynote.deleteOne({'num':num_post}, function(err) {
                        if (err) {
                            console.log('easynote delete error')
                            res.json({
                                result: {
                                    success: false,
                                    message: 'easynote delete error. err=' + err
                                }
                            });
                            return;
                        }
                        else {
                            console.log('easynote delete successfully.')
                            res.json({
                                result: {
                                    success: true,
                                    message: 'easynote delete successfully.'
                                }
                            });
                        }
                    })

                }                
            }
        })

    }
    else {
        res.json({
            result: {
                success: false,
                message: 'easynote delete error - num wrong..'
            }
        });
        return;
    }
})


// api: read
router.post('/read', function(req, res, next) {
    console.log(`${req.url} | easynote api`)

    var num_post = req.body.num;

    Easynote = mongoose.model('easynote', easynote_schema);
    Easynote.findOne({'num':num_post}, function(err, data) {
        if (err) { res.send(err); }
        else {
            console.log(data)
            if (data == null) {
                res.json({
                    result: {
                        success: false,
                        message: 'no easynote read data'
                    }
                });
                return;
            }
            else {
                res.json({
                    result: {
                        success: true,
                        message: 'easynote read ok',
                        row: [
                            {
                                'num_link': data['num_link'],
                                'num': data['num'],
                                'name': ((is_admin_login(req) || (is_user_login(req) && is_user_readable(req))) ? data['name'] : '*** private ***'),
                                'note': ((is_admin_login(req) || (is_user_login(req) && is_user_readable(req))) ? data['note'] : '*** private ***'),
                                'user_id': data['user_id'],
                                'date': data['date']
                            },
                        ]
                    }
                });
            }                
        }
    })
})


// api: list
router.post('/list', function(req, res, next) {
    console.log(`${req.url} | easynote api`)

    Easynote = mongoose.model('easynote', easynote_schema);
    Easynote.find({'num':{ $gte : 1 }}).sort({ date:-1 }).exec(function(err, data) {
        if (err) { res.send(err); }
        else {
            //console.log(data)
            if (data == null) {
                res.json({
                    result: {
                        success: false,
                        message: 'no easynote list data'
                    }
                });
                return;
            }
            else {
                let datalist = [];
                for (let i = 0; i < data.length; i++) {
                    let dict = {
                        'num_link': data[i]['num_link'],
                        'num': data[i]['num'],
                        'name': ((is_admin_login(req) || (is_user_login(req) && is_user_readable(req))) ? data[i]['name'] : '*** private ***'),
                        'note': ((is_admin_login(req) || (is_user_login(req) && is_user_readable(req))) ? data[i]['note'] : '*** private ***'),
                        'user_id': data[i]['user_id'],
                        'date': data[i]['date']
                    }
                    datalist[i] = dict;
                }

                res.json({
                    result: {
                        success: true,
                        message: 'easynote list ok',
                        row: datalist,
                    }
                });
            }                
        }
    })
})




module.exports = router;
