const mySql = require("mysql2");
const pool = mySql.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "project",
    waitForConnections: true,
    connectionLimit: 10, // 最大連線數
    queueLimit: 0 //排隊限制
})
module.exports =  pool.promise();