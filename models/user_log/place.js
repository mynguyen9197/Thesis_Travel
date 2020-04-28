const { load, save } = require(global.appRoot + '/models/db-access')

const insertUserLog = async(placeid, userid, last_update, event_type) => {
    const sql = `insert into place_user_log (place_id, user_id, log_time, event_type) values(${placeid}, ${userid}, '${last_update}', '${event_type}');`
    return save(sql)
}

const getRecentActivities = async(userid) => {
    const sql = `select p.id, max(log_time) as date, p.name, p.thumbnail, p.rating, p.ranking, p.review FROM place p, place_user_log 
    where user_id=${userid} and place_id = p.id group by place_id order by date desc limit 20;`
    return load(sql)
}

module.exports = {
    insertUserLog, getRecentActivities
}