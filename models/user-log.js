const { load, save } = require(global.appRoot + '/models/db-access')

const insertRating = (async(info) => {
    const sql = `insert into user_log(user_id, date, rating, rate_for, kind) 
    values(${info.user_id}, '${info.date}', ${info.rating}, ${info.rate_for}, ${info.kind});`;
    return save(sql)
})

module.exports = {
    insertRating
}