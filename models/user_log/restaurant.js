const { load, save } = require(global.appRoot + '/models/db-access')

const insertUserLog = async(restid, userid, last_update, event_type) => {
    const sql = `insert into restaurant_user_log (rest_id, user_id, log_time, event_type) values(${restid}, ${userid}, '${last_update}', '${event_type}');`
    return save(sql)
}

const getRecentActivities = async(userid) => {
    const sql = `select r.id, max(log_time) as date, name, thumbnail, common_rating, ranking, review_count FROM restaurant r, restaurant_user_log 
    where user_id=${userid} and rest_id = r.id group by rest_id order by date desc limit 20;`
    return load(sql)
}

module.exports = {
    insertUserLog, getRecentActivities
}