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

const loadAllTourActivities = ((cat_id) => {
    const query = `SELECT * FROM activity_of_tour;`
    return load(query)
})

const findTourById = (id) => {
    const sql = `select * from tour where id=${id};`
    return load(sql)
}

const loadImagesByTourId = ((tour_id) => {
    const sql = `select * from images_tour i where i.tour_id=${tour_id};`
    return load(sql)
})

const loadCommentsByTourId = ((tour_id) => {
    const sql = `select c.*, u.username from comments_tour c, user u where c.tour_id=${tour_id} and u.id=c.user_id;`
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

module.exports = {
    insertTour, insertTourism,
    insertComment, loadAllTourism, insertImage,
    loadAllTours, findTourByName, findTourismByName,
    loadTourByActivityId, findTourById,
    loadImagesByTourId, loadCommentsByTourId,
    findTourismById, updateReview, loadAllTourActivities,
    loadReviewByTourId, insertActivityTour, findTourByActivityName
}