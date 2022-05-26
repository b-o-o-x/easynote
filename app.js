//------------------------------
// 글로벌 설정 (아래 //전역 설정 // 모듈 설정을 정리차원에서 만들긴 했는데 좀 복잡해지네 -_-;;)
//------------------------------
const index_global = require("./app_global.js")
index_global.init();

//#region // 직접 전역,모듈 설정 방식
/*
//------------------------------
// 전역 설정
//------------------------------

//require('dotenv').config({ path: '/home/node/app/.env' }) // .env 사용
//var _env = process.env;
//const fs = require('fs') // 파일시스템

//------------------------------
// 모듈 설정
//------------------------------
// express 웹서버 프레임워크
const express = require('express')
var app = express();
app.use(express.static('/home/node/app/public'))
app.use(express.json())

// express - post 데이터 처리 사용
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true })) // create and useapplication/json parser
app.use(bodyParser.json())

// express - 쿠키/세션 처리 사용
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')
app.use(cookieParser());
app.use(expressSession({ secret: 'booxapikey', resave: true, saveUninitailized: true }))

// database (mongo by mongoose)
var dbModule = require('./system/database')
let dbApi = new dbModule.database('mongo', _env.DB_URI, _env.DB_NAME_API)
let dbPortfolio = new dbModule.database('mongo', _env.DB_URI, _env.DB_NAME_PORTFOLIO)
dbApi.connect()
dbPortfolio.connect()
*/
//#endregion

//------------------------------
// 라우팅
//------------------------------

// index
//app.use('/', require('./easynote')); // 내부에서 상대 URI 사용.
app.get('/', function(req, res, next) {
	console.log('/ redirect to /easynote')
	res.redirect('/easynote');
})

// easynote
app.use('/easynote', require('./easynote/easynote'));

// easynote.multi=tail
app.use('/easynote-multi-tail', require('./easynote-multi-tail/easynote'));


//------------------------------
// 앱시작
//------------------------------
// app start
app.listen(_env.PORT, () => {
	console.log(`${_env.APP_NAME} running at ${_env.HOST_URI}:${_env.PORT}`);
})