const { load, save } = require(global.appRoot + '/models/db-access')

const insertUserLog = async(placeid, userid, last_update, event_type) => {
    const sql = `insert into place_user_log (place_id, user_id, log_time, event_type) values(${placeid}, ${userid}, '${last_update}', '${event_type}');`
    return save(sql)
}

module.exports = {
    insertUserLog
}