//--------------------------------------------------
// easynote
//--------------------------------------------------
// Andy Yang.
// 22.05.03-18:20 - Init version
//--------------------------------------------------
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
mongoose.pluralize(null); // collection name을 복수화(-s)하려는 것 강제로 비활성화


//############################
// easynote model
//############################
const { Schema } = mongoose;
const Easynote = new mongoose.model('easynote', {
    num_link: { type: Number }, // 확장용. 댓글 등 추가된 easynote와의 연동을 위한 것..
    num: { type: Number, unique: true }, // auto increment 어케하냐..
    title: { type: String },
    note: { type: String },
    date: { type: Date, default: Date.now },
    id: { type: String },
    pw: { type: String },
    access: { type: String }, // 접근권한. 기본은public/private. 확장사용시 1/2/3/4/5 등 소스코드 구분사용.
    // file ???
});


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



//############################
// easynote pages
//############################
// welcome page
router.get('/', (req, res, next) => {
    console.log(`${req.url} | easynote page`)

    //res.send("<h3>Welcome to EasyNote</h3><hr>");
    //res.sendFile(_env.ROOT + '/easynote/welcome3.html', 'utf8');

    mongoose.connection.db.listCollections({name: 'easynote'})
    .next(function(err, collinfo) {
        if (collinfo) {
            // The collection exists
            var query = Easynote.find({});
            query.count(function (err, count) {
                if (err) {
                    console.log(err);
                    res.sendFile(_env.ROOT + '/easynote/welcome.html', 'utf8');
                    return;
                }
                else {
                    console.log("count:", count);
                    if (1 <= count) {
                        let data = fs.readFileSync(_env.ROOT + '/easynote/list.html', 'utf8');
                        if (data) {
                            //data = data.replaceAll('[groupid]', groupid)
                            data = data.replaceAll('[root]', `${_env.HOST_URI}:${_env.PORT}/easynote`)
                            data = data.replaceAll('[systemdate]', Date.now()); // OK. - 1970.01.01이후 경과된 ms. front에서는 var sysdate = new Date([systemdate]); 로 사용.
                            //data = data.replaceAll('[systemdate]', new Date()); // OK. - front에서는 var sysdate = new Date('[systemdate]'); 로 사용
                            res.send(data);
                        }
                    }
                    else {
                        console.log('no easynote data.')
                        res.sendFile(_env.ROOT + '/easynote/welcome.html', 'utf8');
                    }
                }
            });
        }
        else {
            res.sendFile(_env.ROOT + '/easynote/welcome.html', 'utf8');
        }
    });
});
// page: admin
router.get('/admin', (req, res, next) => {
    // 0번 data 조회해서 있으면 해당 id, pw 확인하고, 없으면 진입.. 진입이후 바로 설정하도록..
    console.log(`${req.url} | easynote page`)

    var query = Easynote.find({'notenum':0});
    query.count(function (err, count) {
        if (err) {
            console.log(err);
            res.send("error");
        }
        else {
            console.log("count:",count);
            if (count == 0) { // not initialized..
                res.send('<h5>No groupid</h5><hr> <a href="/easynote">/easynote</a>');
            }
            else {
                // 로그인 되어있으면 admin.html, 아니면 admin_login.html
                let data = fs.readFileSync(_env.ROOT + '/easynote/admin.html', 'utf8');
                if (data) {
                    //data = data.replaceAll('[groupid]', groupid)
                    //data = data.replaceAll('[root]', `${_env.HOST_URI}:${_env.PORT}/easynote`)
                    res.send(data);
                }
            }
        }
    });
})
// page: write
router.get('/write/:num?', (req, res, next) => {
    var num = req.params.num;
    console.log(`${req.url} | easynote page`)

    let data = fs.readFileSync(_env.ROOT + '/easynote/write.html', 'utf8');
    if (data) {
        //data = data.replaceAll('[groupid]', groupid)
        data = data.replaceAll('[root]', `${_env.HOST_URI}:${_env.PORT}/easynote`)
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
    console.log(`${req.url} | easynote api`)
    var adminid = req.body.adminid;
    var adminpw = req.body.adminpw;


    //*
    mongoose.connection.db.listCollections({name: 'easynote'})
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
// drop api
router.post('/drop', (req, res, next) => {
    console.log(`${req.url} | easynote api`)

    mongoose.connection.db.dropCollection('easynote')
        .then(() => {
            mongoose.connection.db.listCollections({name: 'easynote'})
                        .next(function(err, collinfo) {
                            if (collinfo) {
                                console.log('easynote collection exist')
                                // The collection exists
    
                                 res.json({
                                            result: {
                                                success: false,
                                                message: 'easynote collection drop failed'
                                            }
                                        });
                            }
                            else {
                                console.log('easynote collection drop success.')
                                res.json({
                                    result: {
                                        success: true,
                                        message: 'easynote collection drop success.'
                                    }
                                });
                            }
                        });
        })
});
// api:login
router.post('/login', (req, res, next) => {
    console.log(`${req.url} | easynote api`)

    var adminid = req.body.adminid;
    var adminpw = req.body.adminpw;

    var query = Easynote.find({'id':adminid, 'pw':adminpw});
    query.count(function (err, count) {
        if (err) {
            console.log(err);
            res.send("error");
        }
        else {
            console.log("count:",count);
            if (count == 0) { // no admin info
                console.log('easynote no admin info.')
                res.json({
                    result: {
                        success: false,
                        message: 'no admin information.'
                    }
                });
            }
            else {
                console.log('easynote admin login ok.')
                res.json({
                    result: {
                        success: true,
                        message: 'admin login ok.'
                    }
                });
            }
        }
    });
});

// api:save
router.post('/save/:num?', function (req, res) {
    console.log(`${req.url} | easynote api`)

    var num_get = req.params.num;
    
    var title = req.body.title;
    var note = req.body.note;
    var id = req.body.id;
    var pw = req.body.pw;
    var access = req.body.access;
    
    console.log(num_get, title, note, id, pw, access);

    if (!num_get) { // new

        Easynote.findOne({}).sort({ num: -1 }).limit(1).exec(function(err, data) {
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
                console.log('maxNum = ' + num_max);
                
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
                                message: 'easynote save successfully.'
                            }
                        });
                    }
                })
            }
        });

    }
    else { // edit
        if (tokenid_get == tokenid) {

        }
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
                                'title': data['title'],
                                'note': data['note'],
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

    Easynote.find({'num':{ $gte : 1 }, 'access':'public'}).sort({ date:-1 }).exec(function(err, data) {
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
                        'title': data[i]['title'],
                        'note': data[i]['note'],
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
