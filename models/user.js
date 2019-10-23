const { load, save } = require(global.appRoot + '/models/db-access')

const insertUser = (user => {
    const sql = `insert into user(name, username, password) values ('${user.name}', '${user.username}', '${user.password}');`
    return save(sql)
})

const findByUsername = (user => {
    const sql = `select * from user where username='${user.username}';`
    return load(sql)
})

module.exports = {
    insertUser, findByUsername
}