const mongoose = require('mongoose'); // 몽고DB 관리자

// [CMD]
// /> mongo mongodb://mongouser:mongo4444@192.168.0.4:27017/admin
// /> show dbs
// /> use testdb   // 없어도 사용가능.
// /> db // 현재 db 보기
// /> db.createCollection("testcol") // testdb 내 생성
// /> show collections
// /> db.person.insert({"name":"andy", "email":"test@test.com"}) // collection 생성하며 insert
// /> db.person.find({})
// /> db.person.remove({"name":"andy"})
// /> db.testcol.drop()
// /> db.person.drop()
// /> testdb.dropDatabase()
//
// /> db.user.createIndex({userid:1, score:-1}) // 복합인덱스.
//
// http://192.168.0.4:27017/ 로 접속해보면 MongoDB가 잘 동작은 하고 있는지 확인할 수 있당..

class database {
  constructor(dbType, dbUri, dbName) {
    this.dbConn = null;
    this.dbType = dbType;
    this.dbUri = dbUri;
    this.dbName = dbName;
  }
  connect() {
    if (this.dbType == 'mongo') {
      mongoose.connect(this.dbUri, {dbName: this.dbName, useNewUrlParser: true},
        (error) => {
          if (error) { console.log(`${this.dbType} database connection Failed!!! [${this.dbUri}, ${this.dbName}]`, error)}
          else {
            this.dbConn = mongoose.connection.useDb(this.dbName);
            console.log(`${this.dbType} database connection Success~ [${this.dbUri}, ${this.dbName}]`)}
        })
    }
  }
  conn() {
    return this.dbConn;
  }
  collection(name) {
    return this.conn().collection(name);
  }
}

function connect(_env) {
    //if (_Env.NODE_ENV !== 'production') {
    //  mongoose.set('debug', true);
    //}

    mongoose.connect(_env.DB_URI, {
      dbName: _env.DB_NAME,
      useNewUrlParser: true,
      //userCreateIndex: true,
    }, (error) => {
      if (error) {
        console.log('몽고디비 연결 에러', error);
      } else {
        console.log('몽고디비 연결 성공');
      }
    });
  }

  /*
    // TEST.insertOne
    var conn = mongoose.connection;
    var user = { a: 'abc'}
    //db.collection('aaa').insertOne(user)


  mongoose.connection.on('error', (error) => {
    console.error('몽고디비 연결 에러', error);
  });

  mongoose.connection.on('disconnected', () => {
    console.error('몽고디비 연결이 끊겼습니다. 연결을 재시도 합니다');
    connect();
  });
*/
function conn() {
    return mongoose.connection;
}
function collection(name) {
  return conn().collection(name);
}

module.exports = { database, connect, conn, collection }




/*
mongoose.connect(_Env.DB_URI)
var db = mongoose.connection;
db.on('error', function() {
	console.log('Mongodb Connection Failed!')
})
//*/

/*
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Successfully connected to mongodb'))
  .catch(e => console.error(e));
//*/

// /usr/local/bin/nodemon indexed.js
// MONGO_INITDB_ROOT_USERNAME : mongouser / MONGO_INITDB_ROOT_PASSWORD : mongo4444
