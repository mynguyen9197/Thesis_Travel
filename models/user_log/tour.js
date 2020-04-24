const { load, save } = require(global.appRoot + '/models/db-access')

const insertUserLog = async(tourid, userid, last_update, event_type) => {
    const sql = `insert into tour_user_log (tour_id, user_id, log_time, event_type) values(${tourid}, ${userid}, '${last_update}', '${event_type}');`
    return save(sql)
}

module.exports = {
    insertUserLog
}