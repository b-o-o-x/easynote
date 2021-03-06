//--------------------------------------------------
// easynote
//--------------------------------------------------
// Andy Yang.
// 22.05.03-18:20 - Init version
// 22.05.18 - easynote.app 폴더구조로 concept 크게 변경. (easynote collection은 필수. easynote.member는 옵션. easynote 자체는 기본은 관리자전용. 설정하면 로그인사용자사용가능.)
// 22.05.19 - easynote_schema 하나 사용으로 crud 모두 구현됨 (admin 로그인하여 crud 테스트 완료)
// 22.05.31 - level 연동 등 어느정도 기본적인 구성은 된 듯.. v1.0.0으로 하여 실서버 사용 예정..
// 22.06.01 - 갑작스런 theme 기능 추가.. ㅋㅋ
//--------------------------------------------------
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.pluralize(null); // collection name을 복수화(-s)하려는 것 강제로 비활성화

// local system root-folder
const EASYNOTE_ROOT_FOLDER = _env.ROOT + '/easynote.app/easynote/v1.0.0';
const EASYNOTE_WEB_ROOT = `${_env.HOST_URI}:${_env.PORT}`;
console_debug('//## EASYNOTE_ROOT_FOLDER = ' + EASYNOTE_ROOT_FOLDER)
console_debug('//## EASYNOTE_WEB_ROOT = ' + EASYNOTE_WEB_ROOT)


//############################
// easynote model
//############################
// easynote.member는 회원 테이블이 없는 시스템에서 사용 가능한 간단 회원 테이블..
// 이미 회원정보가 있다면 Easynote_Oath에 설정하여 연동사용하자.
// 현재는 세션 기반이고, db 등으로 연동하고 싶다면 변경 사용하면 될터..
// => easynote 스키마로 통합.. 추가적인 데이터가 있다면 note에 JSON으로 활용 OK.
/*var easynote_member_schema = new Schema({
  user_id: { type: String },
  user_pw: { type: String },
  level: { type: Number, default: 999999999 },
  date: { type: Date, default: Date.now },
})*/
var easynote_schema = new Schema({
  num_link: { type: Number }, // 확장용. 댓글 등 추가된 easynote와의 연동을 위한 것..
  num: { type: Number, unique: true }, // auto increment 어케하냐..
  name: { type: String },
  note: { type: String },
  user_id: { type: String },
  user_pw: { type: String },
  date: { type: Date, default: Date.now },
  count: { type: Number, }
  // file ???
})
//easynote_schema.index({name:'text', note:'text'}) // search_word를 위한 index


//############################
// easynote functions
//############################
//## system
function console_debug(str) {
  if (_env.DEBUG == 'true') console.log(str);
}
function console_debug_table(data) {
  if (_env.DEBUG == 'true') console.table(data);
}
function encryption(data) {
  //## 기본은 base64 encode이며, 프로젝트에 맞게 원하는 encryption으로 대체 사용.
  // - base64 encode : 한글가능 => 역변환: decodeURIComponent(atob(data));
  return btoa(encodeURIComponent(data));
}
function decrption(data) {
  return decodeURIComponent(atob(data));
}
function is_json_string(str) {
  try {
    var json = JSON.parse(str)
    return (typeof json == 'object')
  }
  catch (e) {
    return false
  }
}
function replaceAll(str, searchStr, replaceStr) {
  return str.split(searchStr).join(replaceStr);
}
function replace_easynote_html(html, num = null) {
  html = html.replaceAll('{{num}}', num)
  html = html.replaceAll('{{theme}}', get_theme());
  html = html.replaceAll('{{root}}', `${EASYNOTE_WEB_ROOT}/easynote`)
  html = html.replaceAll('{{system_date}}', Date.now()); // OK. - 1970.01.01이후 경과된 ms. front에서는 var sysdate = new Date({{system_date}}); 로 사용.
  //data = data.replace_all('{{system_date}}', new Date()); // OK. - front에서는 var sysdate = new Date('{{system_date}}'); 로 사용
  return html;
}
function get_theme() {
  // easynote.config에서 가져오기.. 없으면 default..
  return 'default';
}
function readThemeHtml(htmlfile) {
  var theme_root = EASYNOTE_ROOT_FOLDER + '/public/theme/' + get_theme();
  var full_htmlfile = theme_root + '/html' + htmlfile;
  console_debug(`readThemeHtml() - ${full_htmlfile}`);
  return fs.readFileSync(full_htmlfile, 'utf8');
}

//## session
function session_set_user_id(req, user_id) {
  console_debug(`session_set_user_id(${user_id})`)
  if (req.session.user_id) {
    console_debug('- easynote.member user already logged in')
  }
  else {
    console_debug('- easynote.member user set session')
    req.session.user_id = user_id;
  }
}
function session_get_user_id(req) {
  console_debug(`session_get_user_id() - req.session.user_id = ${req.session.user_id}`)
  return req.session.user_id;
}
function session_set_user_level(req, user_level) {
  console_debug(`set_session_user_level(${user_level})`)
  req.session.user_level = user_level;
}
function session_get_user_level(req) {
  console_debug(`set_session_user_level() - req.session.user_level = ${req.session.user_level})`)
  return Number(req.session.user_level);
}
function session_set_admin_id(req, admin_id) {
  console_debug(`session_set_admin_id(${admin_id})`)
  if (req.session.admin_id) {
    console_debug('- easynote.member admin already logged in')
  }
  else {
    console_debug('- easynote.member admin set session')
    req.session.admin_id = admin_id;
  }
}
function session_is_user_login(req) {
  console_debug(`session_is_user_login() - req.session.user_id = ${req.session.user_id}`)
  return req.session.user_id;
}
function session_is_admin_login(req) {
  console_debug(`session_is_admin_login() - req.session.admin_id = ${req.session.admin_id}`)
  return req.session.admin_id;
}
async function session_is_manager_login(req) {
  console_debug(`session_is_manager_login()`)

  var ret_manager = false;

  // admin은 무조건 true
  var admin_login = session_is_admin_login(req);
  if (admin_login)
    return true;

  // easynote config
  let easynoteLevelReadStart = 0;
  let easynoteLevelReadEnd = 0;
  let easynoteLevelWriteStart = 0;
  let easynoteLevelWriteEnd = 0;
  let data = await easynoteConfigFindOne({'num':0})

  if (data == null) { // error: no config
    console_debug('- no easynote config.')
  }
  else {
    console_debug('- easynote config exists.')

    if (is_json_string(data['note'])) {
      console_debug('- easynote config is correct json string.')
      var note = JSON.parse(data['note'])

      var level_manager = note['level_manager'];
      var user_level = session_get_user_level(req);
      console_debug(`- easynote config. note[level_manager]=${level_manager}, user_level=${user_level}`)

      // level check
      if (level_manager == user_level) { ret_manager = true; }
    }
  }
  console_debug('- easynote ret_manager = ' + ret_manager)

  return ret_manager;
}
async function session_is_user_readable(req) {
  console_debug(`session_is_user_readable()`)

  var ret_readable = false;

  // user 로그인되어있지 않으면 무조건 false
  var user_login = session_is_user_login(req);
  if (!user_login) {
    console_debug('- user is not logged in.')
    return false;
  }

  // admin은 무조건 true
  var admin_login = session_is_admin_login(req);
  if (admin_login) {
    console_debug('- you are the admin.')
    return true;
  }

  // manager도 무조건 true
  var manager_login = await session_is_manager_login(req);
  if (manager_login) {
    console_debug('- you are the manager.')
    return true;
  }

  // easynote config
  let easynoteLevelReadStart = 0;
  let easynoteLevelReadEnd = 0;
  let easynoteLevelWriteStart = 0;
  let easynoteLevelWriteEnd = 0;
  let data = await easynoteConfigFindOne({'num':0})

  if (data == null) { // error: no config
    console_debug('- no easynote config.')
  }
  else {
    console_debug('- easynote config exists.')

    console_debug(data['note'])
    if (is_json_string(data['note'])) {
      console_debug('- easynote config is correct json string.')
      var note = JSON.parse(data['note'])

      // level
      if (note['level_read_start']) { easynoteLevelReadStart = Number(note['level_read_start']); }
      if (note['level_read_end']) { easynoteLevelReadEnd = Number(note['level_read_end']); }
      if (note['level_write_start']) { easynoteLevelWriteStart = Number(note['level_write_start']); }
      if (note['level_write_end']) { easynoteLevelWriteEnd = Number(note['level_write_end']); }
    }
  }
  console_debug('- easynote level read = ' + easynoteLevelReadStart + ' ~ ' + easynoteLevelReadEnd)
  console_debug('- easynote level write = ' + easynoteLevelWriteStart + ' ~ ' + easynoteLevelWriteEnd)

  // level check
  var user_level = session_get_user_level(req);
  if (easynoteLevelReadStart <= user_level && user_level <= easynoteLevelReadEnd)
  {
    ret_readable = true;
  }

  console_debug('- user level = ' + user_level)
  console_debug('- ret_readable = ' + ret_readable)
  
  return ret_readable;
}
async function session_is_user_writable(req, num = -1) {
  console_debug(`session_is_user_writable()`)

  var ret_writable = false;

  // user 로그인되어있지 않으면 무조건 false
  var user_login = session_is_user_login(req);
  if (!user_login) {
    console_debug('- user is not logged in.')
    return false;
  }

  // admin은 무조건 true
  var admin_login = session_is_admin_login(req);
  if (admin_login) {
    console_debug('- you are the admin.')
    return true;
  }

  // manager도 무조건 true
  var manager_login = await session_is_manager_login(req);
  if (manager_login) {
    console_debug('- you are the manager.')
    return true;
  }

  if (num < 0) { // num이 없으면 쓰기권한 체크
    console_debug('- session_is_user_writable() - 쓰기권한 체크')
    // easynote config
    let easynoteLevelReadStart = 0;
    let easynoteLevelReadEnd = 0;
    let easynoteLevelWriteStart = 0;
    let easynoteLevelWriteEnd = 0;
    let data = await easynoteConfigFindOne({'num':0})

    if (data == null) { // error: no config
      console_debug('- no easynote config.')
    }
    else {
      console_debug('- easynote config exists.')

      console_debug(data['note'])
      if (is_json_string(data['note'])) {
        console_debug('- easynote config is correct json string.')
        var note = JSON.parse(data['note'])

        // level
        if (note['level_read_start']) { easynoteLevelReadStart = Number(note['level_read_start']); }
        if (note['level_read_end']) { easynoteLevelReadEnd = Number(note['level_read_end']); }
        if (note['level_write_start']) { easynoteLevelWriteStart = Number(note['level_write_start']); }
        if (note['level_write_end']) { easynoteLevelWriteEnd = Number(note['level_write_end']); }
      }
    }
    console_debug('- easynote level read = ' + easynoteLevelReadStart + ' ~ ' + easynoteLevelReadEnd)
    console_debug('- easynote level write = ' + easynoteLevelWriteStart + ' ~ ' + easynoteLevelWriteEnd)

    // level check
    var user_level = session_get_user_level(req);
    if (easynoteLevelWriteStart <= user_level && user_level <= easynoteLevelWriteEnd)
    {
      ret_writable = true;
    }
  }
  else { // num이 있으면 수정권한 체크
    console_debug('- session_is_user_writable() - 수정권한 체크')
    // easynote config
    let easynoteLevelReadStart = 0;
    let easynoteLevelReadEnd = 0;
    let easynoteLevelWriteStart = 0;
    let easynoteLevelWriteEnd = 0;
    let data = await easynoteConfigFindOne({'num':0})
    
    if (data == null) { // error: no config
      console_debug('- no easynote config.')
    }
    else {
      console_debug('- easynote config exists.')
      //console_debug_table(data['note'])

      if (is_json_string(data['note'])) {
        console_debug('- easynote config is correct json string.')
        var note = JSON.parse(data['note'])

        // level
        if (note['level_read_start']) { easynoteLevelReadStart = Number(note['level_read_start']); }
        if (note['level_read_end']) { easynoteLevelReadEnd = Number(note['level_read_end']); }
        if (note['level_write_start']) { easynoteLevelWriteStart = Number(note['level_write_start']); }
        if (note['level_write_end']) { easynoteLevelWriteEnd = Number(note['level_write_end']); }
      }
    }
    console_debug('- easynote level read = ' + easynoteLevelReadStart + ' ~ ' + easynoteLevelReadEnd)
    console_debug('- easynote level write = ' + easynoteLevelWriteStart + ' ~ ' + easynoteLevelWriteEnd)

    // level check
    var user_level = session_get_user_level(req);
    if (easynoteLevelWriteStart <= user_level && user_level <= easynoteLevelWriteEnd)
    {
      //ret_writable = true; // 이것포함.. 게시물에 대한 권한도 있어야 하기에..

      Easynote = mongoose.model('easynote', easynote_schema);

      // 해당 노트가 작성자 것인지 확인
      let mydata = await easynoteFindOne({'num':num, 'user_id':session_get_user_id(req)});
      if (mydata == null) { // error: no data
        console_debug('- no user data found. num=' + num + ', user_id=' + session_get_user_id(req))
      }
      else {
        ret_writable = true;
      }
    }
  }

  console_debug('- user level = ' + user_level)
  console_debug('- ret_writable = ' + ret_writable)
  
  return ret_writable;
}
function session_user_logout(req) {
  console_debug(`session_user_logout()`)
  req.session.user_id = null;
  req.session.user_level = null;
  req.session.admin_id = null;
}
function session_destroy(req) { // session_user_logout() 상동. 단지 한번에 모두 파괴.
  console_debug(`session_destroy()`)
  req.session.destroy(() => {
      //res.redirect('/');
  })
}

//## mongoose
var easynoteFindOne = function(query) {
  console_debug(`easynoteFindOne()`)
  Easynote = mongoose.model('easynote', easynote_schema);
  return Easynote.findOne(query);
}

var easynoteConfigFindOne = function(query) {
  console_debug(`easynoteConfigFindOne()`)
  var data ='';
  EasynoteConfig = mongoose.model('easynote', easynote_schema);
  data = EasynoteConfig.findOne(query);
  return data;
}



//############################
// easynote pages
//############################
// welcome page
router.get('/', (req, res, next) => {
  console_debug(`### ${req.url} | easynote page`)

  mongoose.connection.db.listCollections({name: 'easynote'}).next(async function(err, collinfo) {
    if (collinfo) {
      console_debug('- easynote collection exists.')

      var user_readable = await session_is_user_readable(req);

      //
      let html = null;
      if (user_readable) { html = readThemeHtml('/list.html'); }
      else { html = readThemeHtml('/login.html'); }

      if (html) { res.send(replace_easynote_html(html)); }
    }
    else { // no easynote collection
      html = readThemeHtml('/admin/welcome.html');

      if (html) { res.send(replace_easynote_html(html)); }
    }
  })
});
// page: welcome
router.get('/welcome', (req, res, next) => {
  console_debug(`### ${req.url} | easynote welcome page`)

  var admin_login = session_is_admin_login(req);

  let html = null;
  if (admin_login) {
    html = readThemeHtml('/admin/welcome.html');
  }
  else {
    html = readThemeHtml('/login.html');
  }

  if (html) {
    res.send(replace_easynote_html(html));
  }
})
// page: login
router.get('/login', (req, res, next) => {
  console_debug(`### ${req.url} | easynote page`)

  html = readThemeHtml('/login.html');

  if (html) {
    res.send(replace_easynote_html(html));
  }
})
// page: write
router.get('/write/:num?', (req, res, next) => {
  var num = req.params.num;
  console_debug(`### ${req.url} | easynote page`)

  let html = readThemeHtml('/write.html');
  if (html) {
    res.send(replace_easynote_html(html, num));
  }
})
// page: read
router.get('/read/:num', (req, res, next) => {
  var num = req.params.num;
  console_debug(`### ${req.url} | easynote page`)

  let html = readThemeHtml('/read.html');
  if (html) {
    res.send(replace_easynote_html(html, num));
  }
})
// page: admin
router.get('/admin', (req, res, next) => {
  console_debug(`### ${req.url} | easynote admin page`)

  var admin_login = session_is_admin_login(req);

  let html = null;
  if (admin_login) {
    html = readThemeHtml('/admin/member/member_list.html');
  }
  else {
    html = readThemeHtml('/login.html');
  }

  if (html) {
    res.send(replace_easynote_html(html));
  }
})
// page: admin member list
router.get('/admin/member', (req, res, next) => {
  console_debug(`### ${req.url} | easynote admin page`)

  var admin_login = session_is_admin_login(req);

  let html = null;
  if (admin_login) {
    html = readThemeHtml('/admin/member/member_list.html');
  }
  else {
    html = readThemeHtml('/login.html');
  }

  if (html) {
    res.send(replace_easynote_html(html));
  }
})
// page: admin member create
router.get('/admin/member/write/:num?', (req, res, next) => {
  var num = req.params.num;
  console_debug(`### ${req.url} | easynote admin page`)

  let html = readThemeHtml('/admin/member/member_write.html');
  if (html) {
    res.send(replace_easynote_html(html, num));
  }
})
// page: admin member read
router.get('/admin/member/read/:num', (req, res, next) => {
  var num = req.params.num;
  console_debug(`### ${req.url} | easynote admin page`)

  let html = readThemeHtml('/admin/member/member_read.html');
  if (html) {
    res.send(replace_easynote_html(html, num));
  }
})


//############################
// easynote apis
//############################

// create api
router.post('/create', (req, res, next) => {
  var collection = req.query.collection;
  console_debug(`$$$ ${req.url} | easynote api`)

  if (collection == 'easynote') {
    console_debug('- easynote collection create start')

    mongoose.connection.db.listCollections({name: 'easynote'}).next(function(err, collinfo) {

      if (collinfo) {
        console_debug('- easynote collection already exist');

        res.json({
          result: {
            success: false,
            message: 'easynote collection already created.'
          }
        });
      }
      else {
        console_debug('- easynote collection not exist')

        mongoose.connection.db.createCollection('easynote').then(() => {
          mongoose.connection.db.listCollections({name: 'easynote'}).next(function(err, collinfo) {
            if (collinfo) {
              console_debug('- easynote collection exist');
              console_debug('- easynote config created successfully.')

              res.json({
                result: {
                  success: true,
                  message: 'easynote collection created successfully.'
                }
              });
            }
            else {
              console_debug('- easynote collection create failed.');
              
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
    console_debug('- easynote.member collection create start')

    var admin_id = req.body.admin_id;
    var admin_pw = req.body.admin_pw;

    admin_pw = encryption(admin_pw);

    mongoose.connection.db.createCollection('easynote.member').then(() => {
      mongoose.connection.db.listCollections({name: 'easynote.member'}).next(function(err, collinfo) {

        if (collinfo) {
          console_debug('- easynote.member collection exist')

          EasynoteMember = mongoose.model('easynote.member', easynote_schema);
          var easynote_member = new EasynoteMember();
          easynote_member.num_link = 0;
          easynote_member.num = 0;
          easynote_member.name = 'admin';
          easynote_member.user_id = admin_id;
          easynote_member.user_pw = admin_pw;
          var note = {
            "level": "0",
          };
          easynote_member.note = JSON.stringify(note);
          easynote_member.save(function(err) {
            if (err) {
              console_debug('- easynote.member save error')
              res.json({
                result: {
                  success: false,
                  message: 'easynote.member collection created, but save error'
                }
              });
              return;
            }
            else {
              console_debug('- easynote.member admin created successfully.')

              Easynote = mongoose.model('easynote', easynote_schema);
              var easynote = new Easynote();
              easynote.num_link = 0;
              easynote.num = 0;
              easynote.name = 'config';
              easynote.user_id = admin_id;
              var note = {
                "level_manager": "1",
                "level_read_start": "1",
                "level_read_end": "10",
                "level_write_start": "1",
                "level_write_end": "10",
              };
              easynote.note = JSON.stringify(note);
              easynote.save(function(err) {
                if (err) {
                  console_debug('- easynote save() error')
                  res.json({
                    result: {
                      success: false,
                      message: 'easynote.member collection created, but save() error'
                    }
                  });
                  return;
                }
                else {
                  console_debug('- easynote config created successfully.')
                  res.json({
                    result: {
                      success: true,
                      message: 'easynote.member collection created, and admin / config info saved successfully.'
                    }
                  });
                }
              })
            }
          })
        }
        else {
          console_debug('- easynote.member collection create failed.')
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
      console_debug('- easynote.member collection already exist.')
      res.json({
        result: {
          success: false,
          message: 'easynote.member collection already created.'
        }
      });
    });
  }
});
// drop api
router.post('/drop', (req, res, next) => {
  console_debug(`$$$ ${req.url} | easynote api`)

  var admin_login = session_is_admin_login(req);

  // session for admin_id
  if (admin_login) {
    console_debug('- easynote.member admin logged in')

    mongoose.connection.db.dropCollection('easynote.member').then(() => {
      mongoose.connection.db.listCollections({name: 'easynote.member'}).next(function(err, collinfo) {

        if (collinfo) {
          console_debug('- easynote.member collection exist')

          res.json({
            result: {
              success: false,
              message: 'easynote.member collection drop failed'
            }
          });
        }
        else {
          console_debug('- easynote.member collection drop success.')

          mongoose.connection.db.dropCollection('easynote').then(() => {
            mongoose.connection.db.listCollections({name: 'easynote'}).next(function(err, collinfo) {

              if (collinfo) {
                console_debug('- easynote collection exist')

                res.json({
                  result: {
                    success: false,
                    message: 'easynote.member collection drop success, but easynote collection drop failed'
                  }
                });
              }
              else {
                console_debug('- easynote collection drop success.')
              }

            });
          }).catch(err => {
            console_debug('- easynote collection drop error')
          }).finally(() => {
            session_user_logout(req);

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
    console_debug('- easynote.member no admin logged in')

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
  console_debug(`$$$ ${req.url} | easynote api`)

  var user_id = req.body.user_id;
  var user_pw = req.body.user_pw;

  user_pw = encryption(user_pw);

  EasynoteMember = mongoose.model('easynote.member', easynote_schema);
  var easynotemember = new EasynoteMember();

  EasynoteMember.findOne({'user_id':user_id, 'user_pw':user_pw}, function(err, data) {
    if (err) {
      console_debug('- easynote.member findOne() error.')
      res.json({
        result: {
          success: false,
          message: 'easynote.member findOne() error.'
        }
      });
    }
    else {
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

        console_debug('- easynote.member user login ok.')

        // session for user_id
        session_set_user_id(req, user_id);

        if (is_json_string(data['note'])) {
          console_debug('- easynote.member note data is correct json string.')
          var note = JSON.parse(data['note'])

          // session for level
          session_set_user_level(req, note['level']);
          if (note['level'] == 0) {
            session_set_admin_id(req, user_id);
          }
        }
        else {
          console_debug('- easynote.member note data is not correct json string.')
          session_set_user_level(req, "999999999"); // default level
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
  console_debug(`$$$ ${req.url} | easynote api`)

  var user_login = session_is_user_login(req);

  // session for user_id
  if (user_login) {
    console_debug('- easynote.member user logged in')

    res.json({
      result: {
        success: true,
        message: 'user logged in'
      }
    });
  }
  else {
    console_debug('- easynote.member no uer logged in')

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
  console_debug(`$$$ ${req.url} | easynote api`)

  var admin_login = session_is_admin_login(req);

  // session for admin_id
  if (admin_login) {
    console_debug('- easynote.member admin logged in')

    res.json({
      result: {
        success: true,
        message: 'admin logged in'
      }
    });
  }
  else {
    console_debug('- easynote.member no admin logged in')

    res.json({
      result: {
        success: false,
        message: 'no admin logged in'
      }
    });
  }
});
// api:ismanager
router.post('/ismanager', async (req, res, next) => {
  console_debug(`$$$ ${req.url} | easynote api`)

  var manager_login = await session_is_manager_login(req);

  // session for manager
  if (manager_login) {
    console_debug('- easynote.member manager logged in')

    res.json({
      result: {
        success: true,
        message: 'manager logged in'
      }
    });
  }
  else {
    console_debug('- easynote.member no manager logged in')

    res.json({
      result: {
        success: false,
        message: 'no manager logged in'
      }
    });
  }
});
// api:isreadable
router.post('/isreadable', async (req, res, next) => {
  console_debug(`$$$ ${req.url} | easynote api`)

  var user_login = session_is_user_login(req);

  // session for user_id
  if (user_login) {
    console_debug('- easynote.member user logged in')

    var user_readable = await session_is_user_readable(req);

    if (user_readable) {
      res.json({
        result: {
          success: true,
          message: 'user logged in, and have a permission to read'
        }
      });
    }
    else {
      res.json({
        result: {
          success: true,
          message: 'user logged in, but do not have a permission to read'
        }
      });
    }
  }
  else {
    console_debug('- easynote.member no uer logged in')

    res.json({
      result: {
        success: false,
        message: 'no user logged in'
      }
    });
  }
});
// api:iswritable
router.post('/iswritable', async (req, res, next) => {
  console_debug(`$$$ ${req.url} | easynote api`)

  var num_post = req.body.num;
  console_debug('- num = ' + num_post)

  var user_login = session_is_user_login(req);

  // session for user_id
  if (user_login) {
    console_debug('- easynote.member user logged in')

    var user_writable = await session_is_user_writable(req, num_post);

    if (user_writable) {
      res.json({
        result: {
          success: true,
          message: 'user logged in, and have a permission to write'
        }
      });
    }
    else {
      res.json({
        result: {
          success: false,
          message: 'user logged in, but do not have a permission to write'
        }
      });
    }
  }
  else {
    console_debug('- easynote.member no uer logged in')

    res.json({
      result: {
        success: false,
        message: 'no user logged in'
      }
    });
  }
});
// api:logout
router.post('/logout', (req, res, next) => {
  console_debug(`$$$ ${req.url} | easynote api`)

  session_destroy(req);

  res.json({
    result: {
      success: true,
      message: 'log out ok'
    }
  });
});

// api:write post (save)
router.post('/write', async function (req, res) {
  console_debug(`$$$ ${req.url} | easynote api : post`)

  var name = req.body.name;
  var note = req.body.note;

  var admin_login = session_is_admin_login(req);
  var user_login = session_is_user_login(req);
  var user_writable = await session_is_user_writable(req);

  if (admin_login || (user_login && user_writable)) {

    Easynote = mongoose.model('easynote', easynote_schema);

    var query = Easynote.find({});
    query.count(function (err, count) {
      if (err) {
        console_debug('- easynote write find() err=' + err);
        res.json({
          result: {
            success: false,
            message: 'easynote write find() error'
          }
        });
        return;
      }
      else {

        if (count == 0) {
          console_debug('- easynote data found.');

          var easynote = new Easynote();
          easynote.num_link = 0;
          easynote.num = 1;
          easynote.name = name;
          easynote.note = note;
          //easynote.date = getCurrentDate(); // ISODate()가 시스템시간과 꼬인다..
          easynote.user_id = session_get_user_id(req);
          easynote.save(function(err) {
            if (err) {
              console_debug('- easynote save error')
              res.json({
                result: {
                  success: false,
                  message: 'easynote save error'
                }
              }) // json
              return;
            }
            else {
              console_debug('- easynote save successfully.')
              res.json({
                result: {
                  success: true,
                  message: 'easynote save successfully.',
                  row: [
                    {
                      'num': 1,
                    },
                  ]
                }
              }) // json
            }
          }) // save
        }
        else {
          Easynote.findOne({}).sort({ num: -1 }).limit(1).exec(function(err, data) { // num저장을 위한 num_max 찾기
            if (err) {
              console_debug('- easynote num exec() error');
                res.json({
                  result: {
                    success: false,
                    message: 'easynote num_max error'
                  }
                });
                return;
            }
            else {
              console_debug('- easynote data found.');

              var num_max = data['num'] + 1;
              console_debug('- num_max = ' + num_max);
              
              var easynote = new Easynote();
              easynote.num_link = 0;
              easynote.num = num_max;
              easynote.name = name;
              easynote.note = note;
              //easynote.date = getCurrentDate(); // ISODate()가 시스템시간과 꼬인다..
              easynote.user_id = session_get_user_id(req);
              easynote.save(function(err) {
  
                if (err) {
                  console_debug('- easynote save error')
                  res.json({
                    result: {
                      success: false,
                      message: 'easynote save error'
                    }
                  });
                  return;
                }
                else {
                  console_debug('- easynote save successfully.')
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

      }
    }) // query.count()
  }
  else {
    console_debug('- easynote save permission error')
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
router.put('/write', async function (req, res) {
  console_debug(`$$$ ${req.url} | easynote api : put`)

  var num_post = req.body.num;
  var name = req.body.name;
  var note = req.body.note;

  var admin_login = session_is_admin_login(req);
  var user_login = session_is_user_login(req);
  var user_writable = await session_is_user_writable(req, num_post);

  // check json
  if (num_post == 0 && !is_json_string(note)) {
    console_debug('- easynote config edit note is not correct json string error')
    res.json({
      result: {
        success: false,
        message: 'easynote config edit note is not correct json string error'
      }
    }) // json
    return;
  }

  if (admin_login || (user_login && user_writable) && num_post) { // edit

    Easynote = mongoose.model('easynote', easynote_schema);

    Easynote.findOne({'num':num_post}, async function(err, data) {
      if (err) {
        res.json({
          result: {
            success: false,
            message: 'easynote edit error. err=' + err
          }
        });
      }
      else {
        if (data == null) { // error: no data
          res.json({
            result: {
              success: false,
              message: 'no easynote edit data'
            }
          });
          return;
        }
        else if (!admin_login && !(session_get_user_id(req) != data['id'] && user_writable)) { // data exist and check permission
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
            'name': name,
            'note': note,
          }, function(err) {
            if (err) {
              console_debug('- easynote edit error')
              res.json({
                result: {
                  success: false,
                  message: 'easynote edit error'
                }
              });
              return;
            }
            else {
              console_debug('- easynote edit successfully.')
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
        message: 'easynote edit error - ' + (!num_post ? 'wrong num' : 'permission error')
      }
    });
    return;
  }
})

// api:write delete (delete)
router.delete('/write', async function (req, res) {
  console_debug(`$$$ ${req.url} | easynote api : delete`)

  var num_post = req.body.num;
  console_debug('- num = ' + num_post);
  
  if (num_post == 0) {
    res.json({
      result: {
        success: false,
        message: 'easynote config note can not be deleted'
      }
    });
    return;
  }

  var admin_login = session_is_admin_login(req);
  var user_login = session_is_user_login(req);
  var user_writable = await session_is_user_writable(req, num_post);

  if (admin_login || (user_login && user_writable) && num_post) { //

    Easynote = mongoose.model('easynote', easynote_schema);

    Easynote.findOne({'num':num_post}, async function(err, data) {
      if (err) {
        res.json({
          result: {
            success: false,
            message: 'easynote findOne() error. err=' + err
          }
        });
      }
      else {
        if (data == null) { // error: no data
          res.json({
            result: {
              success: true,
              message: 'no easynote data'
            }
          });
          return;
        }
        else if (!admin_login && !(session_get_user_id(req) != data['id'] && await user_writable)) { // data exist and check permission
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
              console_debug('- easynote deleteOne() error')
              res.json({
                result: {
                  success: false,
                  message: 'easynote delete error. err=' + err
                }
              });
              return;
            }
            else {
              console_debug('- easynote delete successfully.')
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
        message: 'easynote delete error - ' + (!num_post ? 'wrong num' : 'permission error')
      }
    });
    return;
  }
})


// api: read
router.post('/read', async function(req, res, next) {
  console_debug(`$$$ ${req.url} | easynote api`)

  var num_post = req.body.num;
  console_debug('- num = ' + num_post);

  var admin_login = session_is_admin_login(req);
  var user_login = session_is_user_login(req);
  var user_readable = await session_is_user_readable(req);

  Easynote = mongoose.model('easynote', easynote_schema);
  Easynote.findOne({'num':num_post}, async function(err, data) {
    if (err) { res.send(err); }
    else {
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
                'name': ((admin_login || (user_login && user_readable)) ? data['name'] : '*** private ***'),
                'note': ((admin_login || (user_login && user_readable)) ? data['note'] : '*** private ***'),
                'user_id': ((admin_login || (user_login && user_readable)) ? data['user_id'] : '*** private ***'),
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
router.post('/list', async function(req, res, next) {
  console_debug(`$$$ ${req.url} | easynote api`)

  var per_page = 3;
  var page = Math.max(0, req.body.page - 1);
  var search_word = req.body.search_word;

  console_debug(`- page=${page}, search_word=${search_word}`);

  var admin_login = session_is_admin_login(req);
  var user_login = session_is_user_login(req);
  var user_readable = await session_is_user_readable(req);

  Easynote = mongoose.model('easynote', easynote_schema);
  //Easynote.find({'num':{ $gte : 1 }, $text:{ $search : search_word }}).limit(per_page).skip(per_page * page).sort({ date:-1 }).exec(function(err, data) { // search_word : schema의 index 필요 document에서 $text를 찾기위해 필요함.
  //Easynote.find({ 'num':{$gte:1}, 'name':{$regex:search_word,$options:'i'} }).limit(per_page).skip(per_page * page).sort({ date:-1 }).exec(function(err, data) { // name only OK
  Easynote.find({ 'num':{$gte:1}, $or:[{'name':{$regex:search_word,$options:'i'}}, {'note':{$regex:search_word,$options:'i'}}] }).limit(per_page).skip(per_page * page).sort({ date:-1 }).exec(async function(err, data) { // $or OK
    if (err) {
      console_debug('- easynote find() error. err=' + err)
      res.json({
        result: {
          success: false,
          message: 'easynote find() error. err=' + err
        }
      });
      return;
    }
    else {
      if (data == null || data.length == 0) { // limit.skip()으로 paging 기능을 추가하니 null아 안 나온다.
        console_debug('- no easynote list data')
        res.json({
          result: {
            success: false,
            message: 'no easynote list data'
          }
        });
        return;
      }
      else {
        console_debug('- easynote list data found')
        let datalist = [];
        for (let i = 0; i < data.length; i++) {
          let dict = {
            'num_link': data[i]['num_link'],
            'num': data[i]['num'],
            'name': ((admin_login || (user_login && user_readable)) ? data[i]['name'] : '*** private ***'),
            'note': ((admin_login || (user_login && user_readable)) ? data[i]['note'] : '*** private ***'),
            'user_id': ((admin_login || (user_login && user_readable)) ? data[i]['user_id'] : '*** private ***'),
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


// api: admin member list
router.post('/admin/member/list', function(req, res, next) {
  console_debug(`$$$ ${req.url} | easynote api`)

  var per_page = 3;
  var page = Math.max(0, req.body.page - 1);
  var search_word = req.body.search_word;

  console_debug(`- page=${page}, search_word=${search_word}`);

  var admin_login = session_is_admin_login(req);

  Easynote = mongoose.model('easynote.member', easynote_schema);
  Easynote.find({ 'num':{$gte:0}, $or:[{'user_id':{$regex:search_word,$options:'i'}}, {'name':{$regex:search_word,$options:'i'}}, {'note':{$regex:search_word,$options:'i'}}] }).limit(per_page).skip(per_page * page).sort({ date:-1 }).exec(function(err, data) { // $or OK
    if (err) {
      console_debug('- easynote.member find() error. err=' + err)
      res.json({
        result: {
          success: false,
          message: 'easynote.member find() error. err=' + err
        }
      });
      return;
    }
    else {
      if (data == null || data.length == 0) { // limit.skip()으로 paging 기능을 추가하니 null아 안 나온다.
        console_debug('- no easynote.member list data')
        res.json({
          result: {
            success: false,
            message: 'no easynote.member list data'
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
            'name': (admin_login ? data[i]['name'] : '*** private ***'),
            'note': (admin_login ? data[i]['note'] : '*** private ***'),
            'user_id': (admin_login ? data[i]['user_id'] : '*** private ***'),
            'date': data[i]['date']
          }
          datalist[i] = dict;
        }

        res.json({
          result: {
            success: true,
            message: 'easynote.member list ok',
            row: datalist,
          }
        });
      }
    }
  })
})

// api: admin member write (save)
router.post('/admin/member/write', function (req, res) {
  console_debug(`$$$ ${req.url} | easynote admin api`)

  var name = req.body.name;
  var note = req.body.note;
  var user_id = req.body.user_id;
  var user_pw = req.body.user_pw;

  user_pw = encryption(user_pw);

  var admin_login = session_is_admin_login(req);

  // check json
  if (!is_json_string(note)) {
    console_debug('- easynote.member save note is not correct json string error')
    res.json({
      result: {
        success: false,
        message: 'easynote.member save note is not correct json string error'
      }
    }) // json
    return;
  }

  if (admin_login) {

    Easynote = mongoose.model('easynote.member', easynote_schema);

    var query = Easynote.find({});
    query.count(function (err, count) {
      if (err) {
        console_debug('- easynote.member write find() err=' + err);
        res.json({
            result: {
                success: false,
                message: 'easynote.member write find() error'
            }
        });
        return;
      }
      else {

        if (count == 0) {
          console_debug('- easynote.member data found.');

          var easynote = new Easynote();
          easynote.num_link = 0;
          easynote.num = 1;
          easynote.name = name;
          easynote.note = note;
          easynote.user_id = user_id;
          easynote.user_pw = user_pw;
          easynote.save(function(err) {
            if (err) {
              console_debug('- easynote.member save error')
              res.json({
                result: {
                  success: false,
                  message: 'easynote.member save error'
                }
              }) // json
              return;
            }
            else {
              console_debug('- easynote.member save successfully.')
              res.json({
                result: {
                  success: true,
                  message: 'easynote.member save successfully.',
                  row: [
                    {
                      'num': 1,
                    },
                  ]
                }
              }) // json
            }
          }) // save
        }
        else {
          Easynote.findOne({}).sort({ num: -1 }).limit(1).exec(function(err, data) { // num저장을 위한 num_max 찾기
            if (err) {
              console_debug('- easynote.member num exec() error');
                res.json({
                    result: {
                        success: false,
                        message: 'easynote.member num_max error'
                    }
                });
                return;
            }
            else {
              console_debug('- easynote.member data found.');
  
              var num_max = data['num'] + 1;
              console_debug('- num_max = ' + num_max);
              
              var easynote = new Easynote();
              easynote.num_link = 0;
              easynote.num = num_max;
              easynote.name = name;
              easynote.note = note;
              easynote.user_id = user_id;
              easynote.user_pw = user_pw;
              easynote.save(function(err) {
  
                if (err) {
                  console_debug('- easynote.member save error')
                  res.json({
                    result: {
                      success: false,
                      message: 'easynote.member save error'
                    }
                  });
                  return;
                }
                else {
                  console_debug('- easynote.member save successfully.')
                  res.json({
                    result: {
                      success: true,
                      message: 'easynote.member save successfully.',
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

      }
    }) // query.count()
  }
  else {
    console_debug('- easynote.member save permission error')
    res.json({
      result: {
        success: false,
        message: 'easynote.member save permission error'
      }
    });
    return;
  }
})

// api:admin member write (edit)
router.put('/admin/member/write', function (req, res) {
  console_debug(`$$$ ${req.url} | easynote admin api`)

  var num_post = req.body.num;
  var name = req.body.name;
  var note = req.body.note;
  var user_id = req.body.user_id;
  var user_pw = req.body.user_pw;

  user_pw = encryption(user_pw);

  var admin_login = session_is_admin_login(req);

  // check json
  if (!is_json_string(note)) {
    console_debug('- easynote.member edit note is not correct json string error')
    res.json({
      result: {
        success: false,
        message: 'easynote.member edit note is not correct json string error'
      }
    }) // json
    return;
  }

  if (admin_login && num_post) { // edit

    Easynote = mongoose.model('easynote.member', easynote_schema);

    Easynote.findOne({'num':num_post}, async function(err, data) {
      if (err) {
        res.json({
          result: {
            success: false,
            message: 'easynote.member edit error. err=' + err
          }
        });
      }
      else {
        if (data == null) { // error: no data
          res.json({
            result: {
              success: false,
              message: 'no easynote.member edit data'
            }
          });
          return;
        }
        else if (!admin_login) { // data exist and check permission
          res.json({
            result: {
              success: false,
              message: 'permission error'
            }
          });
          return;
        }
        else {

          var result = false;
          if (user_pw) { // 있으면 수정
            console_debug('- easynote.member edit with pw')
            Easynote.updateOne({'num':num_post}, {
              'name': name,
              'note': note,
              'user_id': user_id,
              'user_pw': user_pw,
            }, function(err) {
              if (err) {
                console_debug('- easynote.member edit error')
                res.json({
                  result: {
                    success: false,
                    message: 'easynote.member edit error'
                  }
                });
                return;
              }
              else {
                console_debug('- easynote.member edit successfully.')
                res.json({
                  result: {
                    success: true,
                    message: 'easynote.member edit successfully.',
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
          else { // 없으면 수정하지 않음
            Easynote.updateOne({'num':num_post}, {
              'name': name,
              'note': note,
              'user_id': user_id,
            }, function(err) {
              if (err) {
                console_debug('- easynote.member edit error')
                res.json({
                  result: {
                    success: false,
                    message: 'easynote.member edit error'
                  }
                });
                return;
              }
              else {
                console_debug('- easynote.member edit successfully.')
                res.json({
                  result: {
                    success: true,
                    message: 'easynote.member edit successfully.',
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
      }
    })

  }
  else {
    res.json({
      result: {
        success: false,
        message: 'easynote.member edit error - ' + (!num_post ? 'wrong num' : 'permission error')
      }
    });
    return;
  }
})

// api: admin member (delete)
router.delete('/admin/member/write', function (req, res) {
  console_debug(`$$$ ${req.url} | easynote admin api : delete`)

  var num_post = req.body.num;
  var admin_login = session_is_admin_login(req);

  if (num_post == 0) {
    res.json({
      result: {
        success: false,
        message: 'easynote.member admin can not be deleted'
      }
    });
    return;
  }

  if (admin_login && num_post) { //

    Easynote = mongoose.model('easynote.member', easynote_schema);

    Easynote.findOne({'num':num_post}, function(err, data) {
      if (err) {
        res.json({
          result: {
            success: false,
            message: 'easynote.member findOne() error. err=' + err
          }
        });
      }
      else {
        if (data == null) { // error: no data
          res.json({
            result: {
              success: true,
              message: 'no easynote.member data'
            }
          });
          return;
        }
        else if (!admin_login) { // data exist and check permission
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
              console_debug('- easynote.member deleteOne() error')
              res.json({
                result: {
                  success: false,
                  message: 'easynote.member delete error. err=' + err
                }
              });
              return;
            }
            else {
              console_debug('- easynote.member delete successfully.')
              res.json({
                result: {
                  success: true,
                  message: 'easynote.member delete successfully.'
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
        message: 'easynote.member delete error - ' + (!num_post ? 'wrong num' : 'permission error')
      }
    });
    return;
  }
})
// api: admin member read
router.post('/admin/member/read', function(req, res, next) {
  console_debug(`$$$ ${req.url} | easynote admin api`)

  var num_post = req.body.num;
  console_debug('- num = ' + num_post);

  var admin_login = session_is_admin_login(req);

  Easynote = mongoose.model('easynote.member', easynote_schema);
  Easynote.findOne({'num':num_post}, function(err, data) {
    if (err) { res.send(err); }
    else {
      if (data == null) {
        res.json({
          result: {
            success: false,
            message: 'no easynote.member read data'
          }
        });
        return;
      }
      else {
        res.json({
          result: {
            success: true,
            message: 'easynote.member read ok',
            row: [
              {
                'num_link': data['num_link'],
                'num': data['num'],
                'name': (admin_login ? data['name'] : '*** private ***'),
                'note': (admin_login ? data['note'] : '*** private ***'),
                'user_id': (admin_login ? data['user_id'] : '*** private ***'),
                'date': data['date']
              },
            ]
          }
        });
      }
    }
  })
})



module.exports = router;
