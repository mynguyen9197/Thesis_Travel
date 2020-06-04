const { load, save } = require(global.appRoot + '/models/db-access')

const insertUser = (user => {
    const sql = `insert into user(name, username, password) values ('${user.name}', '${user.username}', '${user.password}');`
    return save(sql)
})

const updateAvatar = (async(avatar, user_id) => {
    const sql = `update user set avatar='${avatar}' where id=${user_id};`
    return save(sql)
})

const findUsersMissingAvatar = (async() => {
    const sql = `select id from user where avatar='null' or avatar is null;`
    return load(sql)
})

const findByUsername = (user => {
    const sql = `select * from user where username='${user.username}';`
    return load(sql)
})

const findById = (id => {
    const sql = `select * from user where id=${id};`
    return load(sql)
})

const updateProfile = (async(user) => {
    const sql = `update user set name='${user.name}', avatar='${user.avatar}' where id=${user.id};`
    return save(sql)
})

const updatePassword = (async(user) => {
    const sql = `update user set password='${user.password}' where id=${user.id};`
    return save(sql)
})

module.exports = {
    insertUser, findByUsername, updateAvatar, updateProfile,
    findById, updatePassword, findUsersMissingAvatar
}