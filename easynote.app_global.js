//------------------------------
// 초기화 설정
//------------------------------

// 전역
require('dotenv').config({ path: '/home/node/app/easynote.app/.env' }) // .env 사용
module.exports = _env = process.env;
module.exports = fs = require('fs') // 파일시스템

// express 웹서버 프레임워크
const express = require('express')
module.exports = app = express();
module.exports = dbModule = require('./database')
module.exports = dbName = new dbModule.database('mongo', _env.DB_URI, _env.DB_NAME)
module.exports = {
	// init() 함수를 노출해주고 var m = require('modules.js'); m.init() 호출 방식.. 다른 module.exports 된것을 사용가능.
	init: function () {
		//app.use(express.static('/home/node/app/public'))
		app.use('/easynote', express.static('/home/node/app/easynote.app/easynote/v1.0.0/public'))
		app.use(express.json())

		// express - post 데이터 처리 사용
		const bodyParser = require('body-parser')

		//app.use(bodyParser.json())
		//app.use(bodyParser.urlencoded({ extended: true })) // create and useapplication/json parser
    // PayloadTooLargeError: request entity too large 해결위해 위의 코드 막고, 아래 코드 추가
		app.use(bodyParser.json({
			limit : "10mb"
		}));
		app.use(bodyParser.urlencoded({
			limit : "10mb",
			extended: true
		}));
		app.use((err, req, res, next) => {
			if (err) {
				res.json({
          result: {
            success: false,
            message: err.stack
          }
        });
			}
			next();
		});

		// express - 쿠키/세션 처리 사용
		const cookieParser = require('cookie-parser')
		const expressSession = require('express-session')
		app.use(cookieParser());
		app.use(expressSession({ secret: 'easynote.secret.key', resave: true, saveUninitailized: true }))

		// database (mongo by mongoose)
		dbName.connect()
	}, // <=== !!!
	otherfunction: function() {
	}
}
