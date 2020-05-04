const { load, save } = require(global.appRoot + '/models/db-access')

const insertUserLog = async(tourid, userid, last_update, event_type) => {
    const sql = `insert into tour_user_log (tour_id, user_id, log_time, event_type) values(${tourid}, ${userid}, '${last_update}', '${event_type}');`
    return save(sql)
}

const getRecentActivities = async(userid) => {
    const sql = `select t.id, max(log_time) as date, name, thumbnail, rating, price, review from tour t, tour_user_log 
    where user_id=${userid} and tour_id = t.id group by tour_id order by date desc limit 20;`
    return load(sql)
}

module.exports = {
    insertUserLog, getRecentActivities
}