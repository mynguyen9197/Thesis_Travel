const { load, save } = require(global.appRoot + '/models/db-access')

const insertUserLog = async(restid, userid, last_update, event_type) => {
    const sql = `insert into restaurant_user_log (rest_id, user_id, log_time, event_type) values(${restid}, ${userid}, '${last_update}', '${event_type}');`
    return save(sql)
}

module.exports = {
    insertUserLog
}