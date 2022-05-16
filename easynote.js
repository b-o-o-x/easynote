//--------------------------------------------------
// easynote
//--------------------------------------------------
// Andy Yang.
// 22.05.03-18:20 - Init version
// 22.05.16 - basic crud finished.
// 22.06.17 - easynote concept changed. (easynote_config, easynote_member)
//--------------------------------------------------
const express = require('express');
const session = require('express-session')
const router = express.Router();
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.pluralize(null); // collection name을 복수화(-s)하려는 것 강제로 비활성화

const app = express();
app.use(session({
    secret: `${_env.HOST_URI}:${_env.PORT}`,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}))

//############################
// easynote model
//############################
var easynote_config_schema = new Schema({
    collection_tail: { type: String, unique: true }, // 'easynote_' + collection_tail
    user_id: { type: String },
    access_read: { type: String },
    access_write: { type: String },
    date: { type: Date, default: Date.now },
})
var easynote_member_schema = new Schema({
    user_id: { type: String },
    user_pw: { type: String },
    level: { type: Number, default: 9999 },
    date: { type: Date, default: Date.now },
})
//const Easynote_Member = mongoose.model('easynote_member', easynote_member_schema);

var Easynote = new Schema({
    num_link: { type: Number }, // 확장용. 댓글 등 추가된 easynote와의 연동을 위한 것..
    num: { type: Number, unique: true }, // auto increment 어케하냐..
    title: { type: String },
    note: { type: String },
    date: { type: Date, default: Date.now },
    id: { type: String },
    pw: { type: String },
    access: { type: String }, // 접근권한. 기본은public/private. 확장사용시 1/2/3/4/5 등 소스코드 구분사용.
    // file ???
})


//############################
// easynote functions
//############################
// functions
function replaceAll(str, searchStr, replaceStr) {
    return str.split(searchStr).join(replaceStr);
}
function getCurrentDate() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth();
    var today = date.getDate();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var milliseconds = date.getMilliseconds();
    return new Date(Date.UTC(year, month, today, hours, minutes, seconds, milliseconds));
}
function is_admin_login(req) {
    return req.session.admin_id;
}
function is_user_login(req) {
    return req.session.user_id
}
function user_logout(req) {
    req.session.user_id = null;
    req.session.admin_id = null;
}



//############################
// easynote pages
//############################
// index page
router.get('/', (req, res, next) => {
    console.log(`${req.url} | easynote page`)

    let data = fs.readFileSync(_env.ROOT + '/easynote/index.html', 'utf8');
    if (data) {
        //data = data.replaceAll('[groupid]', groupid)
        data = data.replaceAll('[root]', `${_env.HOST_URI}:${_env.PORT}/easynote`)
        data = data.replaceAll('[systemdate]', Date.now()); // OK. - 1970.01.01이후 경과된 ms. front에서는 var sysdate = new Date([systemdate]); 로 사용.
        //data = data.replaceAll('[systemdate]', new Date()); // OK. - front에서는 var sysdate = new Date('[systemdate]'); 로 사용
        res.send(data);
    }
});
// page: admin
router.get('/admin', (req, res, next) => {
    // 0번 data 조회해서 있으면 해당 id, pw 확인하고, 없으면 진입.. 진입이후 바로 설정하도록..
    console.log(`${req.url} | easynote page`)

    mongoose.connection.db.listCollections({name: 'easynote.member'}).next(function(err, collinfo) {
        let data = null;
        if (collinfo) {
            if (is_admin_login(req)) {
                console.log('/admin - admin.html')
                data = fs.readFileSync(_env.ROOT + '/easynote/admin.html', 'utf8');
            }
            else {
                console.log('/admin - login.html')
                data = fs.readFileSync(_env.ROOT + '/easynote/login.html', 'utf8');
            }
        }
        else {
            console.log('/admin - welcome.html')
            data = fs.readFileSync(_env.ROOT + '/easynote/welcome.html', 'utf8');
        }

        if (data) {
            //data = data.replaceAll('[groupid]', groupid)
            data = data.replaceAll('[root]', `${_env.HOST_URI}:${_env.PORT}/easynote`)
            data = data.replaceAll('[systemdate]', Date.now()); // OK. - 1970.01.01이후 경과된 ms. front에서는 var sysdate = new Date([systemdate]); 로 사용.
            //data = data.replaceAll('[systemdate]', new Date()); // OK. - front에서는 var sysdate = new Date('[systemdate]'); 로 사용
            res.send(data);
        }
    });
})
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

// api: create (easynote_ 생성)
router.post('/create', (req, res, next) => {
    console.log(`${req.url} | easynote api`)
    var adminid = req.body.adminid;
    var adminpw = req.body.adminpw;

    // base64 encode 한글가능 => decodeURIComponent(atob(pw));
    adminpw = btoa(encodeURIComponent(adminpw));

    //mongoose.model('easynote', Easynote, 'easynote');
    const Easynote_Admin = mongoose.model('easynote_admin', easynote_admin_schema);

    //*
    mongoose.connection.db.listCollections({name: 'easynote_admin'})
    .next(function(err, collinfo) {
        if (collinfo) {
            console.log('easynote collection already exist')
            // The collection exists

            var query = Easynote.find({});
            query.count(function (err, count) {
                if (err) {
                    console.log(err);
                    res.json({
                        result: {
                            success: false,
                            message: 'easynote create find error'
                        }
                    });
                    return;
                }
                else {
                    console.log("count:", count);
                    if (1 <= count) {

                        res.json({
                            result: {
                                success: false,
                                message: 'easynote collection already exist'
                            }
                        });

                    }
                    else {
                        console.log('no easynote data.')
                        
                        var easynote = new Easynote();
                        easynote.num_link = 0;
                        easynote.num = 0;
                        easynote.title = 'easynote_config';
                        easynote.note = '';
                        easynote.id = adminid;
                        easynote.pw = adminpw;
                        easynote.access = 'private';
                        easynote.save(function(err) {
                            if (err) {
                                console.log('save info error')
                                res.json({
                                    result: {
                                        success: false,
                                        message: 'easynote collection created, but save info error'
                                    }
                                });
                                return;
                            }
                            else {
                                console.log('admin info saved successfully.')
                                res.json({
                                    result: {
                                        success: true,
                                        message: 'easynote collection created, and admin info saved successfully.'
                                    }
                                });
                            }
                        })
                    }
                }
            });
        }
        else {
            console.log('easynote collection not exist')

                mongoose.connection.db.createCollection('easynote')
                    .then(() => {
                        mongoose.connection.db.listCollections({name: 'easynote'})
                        .next(function(err, collinfo) {
                            if (collinfo) {
                                console.log('easynote collection exist')
                                // The collection exists
    
                                var easynote = new Easynote();
                                easynote.num_link = 0;
                                easynote.num = 0;
                                easynote.title = 'easynote_config';
                                easynote.note = '';
                                easynote.id = adminid;
                                easynote.pw = adminpw;
                                easynote.access = 'private';
                                easynote.save(function(err) {
                                    if (err) {
                                        console.log('save info error')
                                        res.json({
                                            result: {
                                                success: false,
                                                message: 'easynote collection created, but save info error'
                                            }
                                        });
                                        return;
                                    }
                                    else {
                                        console.log('admin info saved successfully.')
                                        res.json({
                                            result: {
                                                success: true,
                                                message: 'easynote collection created, and admin info saved successfully.'
                                            }
                                        });
                                    }
                                })
                            }
                            else {
                                console.log('easynote collection create failed.')
                                res.json({
                                    result: {
                                        success: false,
                                        message: 'easynote collection create failed.'
                                    }
                                });
                            }
                        });
                    })


            

                
        }
    });
    //*/
});

// api: create_admin
router.post('/create_admin', (req, res, next) => {
    console.log(`${req.url} | easynote api`)
    var admin_id = req.body.admin_id;
    var admin_pw = req.body.admin_pw;

    // base64 encode 한글가능 => decodeURIComponent(atob(pw));
    admin_pw = btoa(encodeURIComponent(admin_pw));

    //*
    mongoose.connection.db.listCollections({name: 'easynote.member'})
    .next(function(err, collinfo) {
        if (collinfo) {
            console.log('easynote.member collection already exist')
            
            res.json({
                result: {
                    success: false,
                    message: 'easynote.member collection already exist'
                }
            });
            return;
        }
        else {
            console.log('easynote.member collection not exist')

                mongoose.connection.db.createCollection('easynote.member')
                    .then(() => {
                        mongoose.connection.db.listCollections({name: 'easynote.member'})
                        .next(function(err, collinfo) {
                            if (collinfo) {
                                console.log('easynote.member collection exist')
                                // The easynote.member exists

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


            

                
        }
    });
    //*/
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
                    // The collection exists

                    res.json({
                        result: {
                            success: false,
                            message: 'easynote.member collection drop failed'
                        }
                    });
                }
                else {

                    console.log('easynote.member collection drop success.')

                    mongoose.connection.db.dropCollection('easynote.config').then(() => {
                        mongoose.connection.db.listCollections({name: 'easynote.config'}).next(function(err, collinfo) {

                            if (collinfo) {
                                console.log('easynote.config collection exist')

                                res.json({
                                    result: {
                                        success: false,
                                        message: 'easynote.member collection drop success, but easynote.config collection drop failed'
                                    }
                                });
                            }
                            else {
                                console.log('easynote.config collection drop success.')

                                user_logout(req);

                                res.json({
                                    result: {
                                        success: true,
                                        message: 'easynote.member and easynote.config collection drop success.'
                                    }
                                })
                            }

                        })
                    })
                    .catch(err => {
                        console.log('easynote.config collection drop error')
                    })
                    .finally(() => {
                        user_logout(req);

                        res.json({
                            result: {
                                success: true,
                                message: 'easynote.member and easynote.config collection drop success.'
                            }
                        })
                    })

                }

            })
        })
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
                if (req.session.user_id) {
                    console.log('easynote.member user already logged in')
                }
                else {
                    console.log('easynote.member user set session')
                    req.session.user_id = user_id;
                }

                // session for admin_id
                if (data['level'] == 0) {
                    if (req.session.admin_id) {
                        console.log('easynote.member admin already logged in')
                    }
                    else {
                        console.log('easynote.member admin set session')
                        req.session.admin_id = user_id;
                    }
                }

                res.json({
                    result: {
                        success: true,
                        message: 'easynote.member user login ok.',
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
    if (req.session.user_id) {
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
    if (req.session.admin_id) {
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

    // session for user_id
    if (req.session.user_id || req.session.admin_pw) {
        console.log('easynote user logged in')
        
        // 모든 session 제거..
        //- 일부만 삭제하려면. req.session.user_id = null;
        req.session.destroy(() => {
            //res.redirect('/');
        })

        res.json({
            result: {
                success: true,
                message: 'log out successfully'
            }
        });
    }
    else {
        console.log('easynote no user logged in')

        res.json({
            result: {
                success: true,
                message: 'log out ok'
            }
        });
    }
});

// api:write post (save)
router.post('/write', function (req, res) {
    console.log(`${req.url} | easynote api : post`)

    var title = req.body.title;
    var note = req.body.note;
    var id = req.body.id;
    var pw = req.body.pw;
    var access = req.body.access;

    // base64 encode 한글가능 => decodeURIComponent(atob(pw));
    pw = btoa(encodeURIComponent(pw));
    
    console.log(title, id, pw, access);

    Easynote.findOne({}).sort({ num: -1 }).limit(1).exec(function(err, data) { // num저장을 위한 num_max 찾기
        if (err) {
            console.log(err);
            res.json({
                result: {
                    success: false,
                    message: 'easynote num_max error'
                }
            });
            return;
        }
        else {
            var num_max = data['num'] + 1;
            console.log('num_max = ' + num_max);
            
            var easynote = new Easynote();
            easynote.num_link = 0;
            easynote.num = num_max;
            easynote.title = title;
            easynote.note = note;
            //easynote.date = getCurrentDate(); // ISODate()가 시스템시간과 꼬인다..
            easynote.id = id;
            easynote.pw = pw;
            easynote.access = access;
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
            })
        }
    });

})

// api:write put (edit)
router.put('/write', function (req, res) {
    console.log(`${req.url} | easynote api : put`)

    var num_post = req.body.num;
    var title = req.body.title;
    var note = req.body.note;
    var id = req.body.id;
    var pw = req.body.pw;
    var pwnew = req.body.pwnew; // 받아야할듯..
    var access = req.body.access;

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
                                'title': (data['access'] == 'public' ? data['title'] : '*** private ***'),
                                'note': (data['access'] == 'public' ? data['note'] : '*** private ***'),
                                'id': data['id'],
                                'access': data['access'],
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
                        'title': (data[i]['access'] == 'public' ? data[i]['title'] : '*** private ***'),
                        'note': (data[i]['access'] == 'public' ? data[i]['note'] : '*** private ***'),
                        'id': data[i]['id'],
                        'access': data[i]['access'],
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
