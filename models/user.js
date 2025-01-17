const { load, save } = require(global.appRoot + '/models/db-access')

const insertUser = (user => {
    const sql = `insert into user(name, username, password, email, activate) values ('${user.name}', '${user.username}', '${user.password}', '${user.email}', ${user.activate});`
    return save(sql)
})

const activeAccount = (id => {
    const sql = `update user set activate=true where id=${id};`
    return save(sql)
})

const checkActiveAccount = (id => {
    const sql = `select activate from user where id=${id};`
    return load(sql)
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

const findByEmail = (user => {
    const sql = `select * from user where email='${user.email}';`
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

const markAsLogined = (async(id) => {
    const sql = `update user set is_used=1 where id=${id};`
    return save(sql)
})

module.exports = {
    insertUser, findByUsername, updateAvatar, updateProfile,
    findById, updatePassword, findUsersMissingAvatar, activeAccount,
    checkActiveAccount, findByEmail, markAsLogined
}