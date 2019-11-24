const mysql = require('mysql');

exports.load = sql => {
    return new Promise((resolve, reject) => {
        const cn = mysql.createConnection({
            host: 'localhost',
            port: '3306',
            user: 'root',
            password: 'mysql@12345678',
            database: 'hoian_travel'
        });

        cn.connect();

        cn.query(sql, function(error, rows, fields) {
            if (error) {
                reject(error);
            } else {
                resolve(JSON.parse(JSON.stringify(rows)));
            }

            cn.end();
        });
    });
}

exports.save = sql => {
    return new Promise((resolve, reject) => {
        const cn = mysql.createConnection({
            host: 'localhost',
            port: '3306',
            user: 'root',
            password: 'mysql@12345678',
            database: 'hoian_travel'
        });

        cn.connect();

        cn.query(sql, function(error, value) {
            if (error) {
                reject(error);
            } else {
                resolve(value);
            }

            cn.end();
        });
    });
}