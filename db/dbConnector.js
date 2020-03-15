let mysql = require('mysql');
let pool  = mysql.createPool({
    connectionLimit : 10,
    //socketPath: `/cloudsql/push-notif-259017:europe-west6:pushnotifications`,
    /*host            : '34.65.49.75',
    user            : 'root',
    password        : 'password1',
    database        : 'push_notif',*/
    user: process.env.DB_USER, // e.g. 'my-db-user'
    password: process.env.DB_PASS, // e.g. 'my-db-password'
    database: process.env.DB_NAME,
    socketPath: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`,
    connectTimeout: 10000, // 10 seconds
    acquireTimeout: 10000, // 10 seconds
    waitForConnections: true, // Default: true
    queueLimit: 0, // Default: 0
});

pool.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
    if (error) throw error;
    console.log('The solution is: ', results[0].solution);
    console.log("Db connected");
});

module.exports=pool;


