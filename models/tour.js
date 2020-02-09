const { load, save } = require(global.appRoot + '/models/db-access')

const insertTour = async(tour, tourism) => {
    const sql = `insert into tour(name, rating, review, price, overview, highlight, wtd, important_info, additional, cancel_policy, key_detail, advantage, thumbnail, tourism_id, duration, review_detail) 
    values('${tour.name}', ${tour.rating}, ${tour.review}, ${tour.price}, '${tour.overview}', '${tour.highlight}', '${tour.wtd}', '${tour.important_info}', '${tour.additional}', '${tour.cancel_policy}', '${tour.key_detail}', '${tour.advantage}', '${tour.thumbnail}', ${tourism}, '${tour.duration}', '${tour.review_detail}');`;
    return save(sql)
}

const insertTourism = async(tourism_name) => {
    const sql = `insert into tourism(name) values('${tourism_name}')`
    return save(sql)
}

const insertComment = async(comment, tourid, userid) => {
    const sql = `insert into comments_tour(review, date, quote, content, tour_id, user_id) values(${comment.review}, '${comment.date}', '${comment.quote}', '${comment.content}', ${tourid}, ${userid});`;
    return save(sql)
}

const insertImage = async(image, tour) => {
    const sql = `insert into images_tour(address, tour_id) values('${image}', ${tour});`;
    return save(sql)
}

const insertActivityTour = async(tour_id, activity_id) => {
    const sql = `insert into activity_tour(activity_id, tour_id) values(${activity_id}, ${tour_id});`;
    return save(sql)
}

const loadAllTours = () => {
    const sql = `select name from tour ORDER BY id ASC;`
    return load(sql)
}

const loadAllTourism = () => {
    const sql = `select name from tourism ORDER BY id ASC;`
    return load(sql)
}

const findTourByName = async(name) => {
    const sql = `SELECT * FROM tour where name = '${name}';`
    return load(sql)
}

const findTourByActivityName = async(name, type) => {
    const sql = `SELECT t.* FROM tour t, activity_tour at where t.name = '${name}' and t.id=at.tour_id and at.activity_id=${type};`
    return load(sql)
}

const findTourismByName = async(name) => {
    const sql = `select id from tourism where name='${name}';`
    return load(sql)
}

const findTourismById = async(tourism_id) => {
    const sql = `select * from tourism where id=${tourism_id};`
    return load(sql)
}

const loadTourByActivityId = async(act_ids) => {
    const query = `SELECT DISTINCT t.id, t.name, t.thumbnail, t.rating, t.price, t.review FROM tour t, activity_tour at WHERE t.id=at.tour_id and at.activity_id in (${act_ids}) ORDER BY rating DESC, 
    review DESC;`
    return load(query)
}

const loadInfoAllTours = async() => {
    const query = `SELECT t.id, t.name, t.thumbnail, t.rating, t.price, t.review from tour t;`
    return load(query)
}

const loadAllTourActivities = ((cat_id) => {
    const query = `SELECT * FROM activity_of_tour;`
    return load(query)
})

const findTourById = (id) => {
    const sql = `select * from tour where id=${id};`
    return load(sql)
}

const loadTourByListId = async(tour_ids) => {
    const query = `SELECT DISTINCT id, name, thumbnail, rating, price, review FROM tour where id in (${tour_ids}) ORDER BY rating DESC, 
    review DESC;`
    return load(query)
}

const loadImagesByTourId = ((tour_id) => {
    const sql = `select * from images_tour i where i.tour_id=${tour_id} order by i.id DESC;`
    return load(sql)
})

const loadCommentsByTourId = ((tour_id) => {
    const sql = `select c.*, u.username from comments_tour c, user u where c.tour_id=${tour_id} and u.id=c.user_id order by c.id DESC;`
    return load(sql)
})

const loadReviewByTourId = ((tourid) => {
    const sql = `select review_detail from tour t where t.id=${tourid};`
    return load(sql)
})

const updateReview = ((review, tour_id) => {
    const query =  `update tour set review_detail='${review}' where id=${tour_id};`
    return save(query)
})

const checkIfUserAlreadyReview = ((tour_id, user_id) => {
    const query = `select * from rating_tour where tour_id=${tour_id} and user_id=${user_id};`
    return load(query)
})

const insertRating = ((info) => {
    const query = `insert into rating_tour(rating, tour_id, user_id) values(${info.rating}, ${info.tour_id}, ${info.user_id});`;
    return save(query)
})

const updateRating = ((info) => {
    const query = `update rating_tour set rating = ${info.rating} where tour_id=${info.tour_id} and user_id=${info.user_id};`;
    return save(query)
})

const loadAllIdAndNameTours = (() => {
    const sql = `select id, name as content from tour`
    return load(sql)
})

const insertUserLog = async(tourid, userid, last_update) => {
    const sql = `insert into tour_user_log (tour_id, user_id, times, last_update) values(${tourid}, ${userid}, 1, '${last_update}');`
    return save(sql)
}

const updateUserLog = async(tourid, userid, times, last_update) => {
    const sql = `update tour_user_log set tour_id=${tourid}, user_id=${userid}, times=${times}, last_update='${last_update}';`
    return save(sql)
}

const findUserLog = async(tourid, userid) => {
    const sql = `select * from tour_user_log where tour_id=${tourid} and user_id=${userid};`
    return load(sql)
}

const findOtherTourInGroup = async(tourid) => {
    const sql = `SELECT DISTINCT p.id as id, p.name as content from tour p, activity_tour ap WHERE p.id=ap.tour_id and ap.activity_id in 
    (SELECT activity_id FROM activity_tour WHERE tour_id=${tourid});`
    return load(sql)
}
const updateTour = async(tour, tourism) => {
    const sql = `update tour set name='${tour.name}', rating=${tour.rating}, review=${tour.review}, price=${tour.price}, overview='${tour.overview}',
     highlight='${tour.highlight}', wtd='${tour.wtd}', important_info='${tour.important_info}', additional='${tour.additional}',
     cancel_policy='${tour.cancel_policy}', key_detail='${tour.key_detail}', advantage='${tour.advantage}', thumbnail='${tour.thumbnail}',
      tourism_id=${tourism}, duration='${tour.duration}', review_detail='${tour.review_detail}' where id=${tour.id};`;
    return save(sql)
}

module.exports = {
    insertTour, insertTourism,
    insertComment, loadAllTourism, insertImage,
    loadAllTours, findTourByName, findTourismByName,
    loadTourByActivityId, findTourById,
    loadImagesByTourId, loadCommentsByTourId,
    findTourismById, updateReview, loadAllTourActivities,
    loadReviewByTourId, insertActivityTour, findTourByActivityName,
    checkIfUserAlreadyReview, insertRating, updateRating,
    loadAllIdAndNameTours, loadTourByListId,
    insertUserLog, updateUserLog, findUserLog,
    findOtherTourInGroup, updateTour, loadInfoAllTours
}