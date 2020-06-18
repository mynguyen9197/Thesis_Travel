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

const getAllTourisms = () => {
    const sql = `select * from tourism;`
    return load(sql)
}

const findCheapestTourByName = async(name) => {
    const sql = `SELECT * FROM tour WHERE LOWER(name) like ('%${name}%') and is_active=1 ORDER BY price, rating DESC, review DESC;`
    return load(sql)
}

const findMostExpensiveTourByName = async(name) => {
    const sql = `SELECT * FROM tour WHERE LOWER(name) like ('%${name}%') and is_active=1 ORDER BY price DESC, rating DESC, review DESC;`
    return load(sql)
}

const findMostViewedTourByName = async(name, from, to) => {
    const sql = `SELECT b.*, count(a.id) as times from tour_user_log a,
    (SELECT * FROM tour WHERE LOWER(name) like ('%${name}%')) as b
    WHERE a.tour_id=b.id and log_time between '${from}' and '${to}' group by tour_id 
    ORDER BY times DESC, rating DESC, review DESC;`
    return load(sql)
}

const findTourByName = async(name) => {
    const sql = `SELECT * FROM tour WHERE LOWER(name) like ('%${name}%') and is_active=1 ORDER BY rating DESC, review DESC;`
    return load(sql)
}

const findTourByActivityName = async(name, type) => {
    const sql = `SELECT t.* FROM tour t, activity_tour at where LOWER(t.name) like ('%${name}%') and t.id=at.tour_id and at.activity_id=${type};`
    return load(sql)
}

const findTourByNameAndActivity = async(name, type) => {
    const sql = `SELECT DISTINCT t.id, t.name, t.thumbnail, t.rating, t.price, t.review FROM tour t, activity_tour at where LOWER(t.name) like LOWER('%${name}%') 
    and t.id=at.tour_id and t.is_active=1 and at.activity_id in (${type}) ORDER BY rating DESC, review DESC;`
    return load(sql)
}

const findMostViewedTourByNameAndActivity = async(name, type, from, to) => {
    const sql = `SELECT b.*, count(a.id) as times FROM tour_user_log a,
    (SELECT DISTINCT t.id, t.name, t.thumbnail, t.rating, t.price, t.review 
        FROM tour t, activity_tour at WHERE LOWER(t.name) like LOWER('%${name}%') 
    and t.id=at.tour_id and t.is_active=1 and at.activity_id in (${type})) as b
    WHERE a.tour_id=b.id and log_time between '${from}' and '${to}' group by tour_id 
    ORDER BY times DESC, rating DESC, review DESC;`
    return load(sql)
}

const findCheapestTourByNameAndActivity = async(name, type) => {
    const sql = `SELECT DISTINCT t.id, t.name, t.thumbnail, t.rating, t.price, t.review FROM tour t, activity_tour at where LOWER(t.name) like LOWER('%${name}%') 
    and t.id=at.tour_id and t.is_active=1 and at.activity_id in (${type}) ORDER BY price, rating DESC, review DESC;`
    return load(sql)
}

const findMostExpensiveTourByNameAndActivity = async(name, type) => {
    const sql = `SELECT DISTINCT t.id, t.name, t.thumbnail, t.rating, t.price, t.review FROM tour t, activity_tour at where LOWER(t.name) like LOWER('%${name}%') 
    and t.id=at.tour_id and t.is_active=1 and at.activity_id in (${type}) ORDER BY price DESC, rating DESC, review DESC;`
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
    const query = `SELECT DISTINCT t.id, t.name, t.thumbnail, t.rating, t.price, t.review FROM tour t, activity_tour at 
    WHERE t.id=at.tour_id and at.activity_id in (${act_ids}) ORDER BY rating DESC, 
    review DESC;`
    return load(query)
}

const loadCheapestTourByActivityId = async(act_ids) => {
    const query = `SELECT DISTINCT t.id, t.name, t.thumbnail, t.rating, t.price, t.review FROM tour t, activity_tour at 
    WHERE t.id=at.tour_id and at.activity_id in (${act_ids}) ORDER BY price, rating DESC, 
    review DESC;`
    return load(query)
}

const loadMostExpensiveTourByActivityId = async(act_ids) => {
    const query = `SELECT DISTINCT t.id, t.name, t.thumbnail, t.rating, t.price, t.review FROM tour t, activity_tour at 
    WHERE t.id=at.tour_id and at.activity_id in (${act_ids}) ORDER BY price DESC, rating DESC, 
    review DESC;`
    return load(query)
}

const loadMostViewedTourByActivityId = async(act_ids, from, to) => {
    const query = `SELECT b.*, count(a.id) as times from tour_user_log a,
    (SELECT DISTINCT t.id, t.name, t.thumbnail, t.rating, t.price, t.review FROM tour t, activity_tour at 
        WHERE t.id=at.tour_id and at.activity_id in (${act_ids})) as b
    WHERE a.tour_id=b.id and log_time between '${from}' and '${to}' group by tour_id 
    ORDER BY times DESC, rating DESC, review DESC;`
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

const loadTopCheapest = async() => {
    const query = `SELECT DISTINCT id, name, thumbnail, rating, price, review FROM tour where is_active=1 
    ORDER BY price, rating DESC, review DESC;`
    return load(query)
}

const loadTopMostExpensive = async() => {
    const query = `SELECT DISTINCT id, name, thumbnail, rating, price, review FROM tour where is_active=1 
    ORDER BY price DESC, rating DESC, review DESC;`
    return load(query)
}

const loadImagesByTourId = ((tour_id) => {
    const sql = `select * from images_tour i where i.tour_id=${tour_id} and i.status=1 order by i.id DESC;`
    return load(sql)
})

const loadCommentsByTourId = ((tour_id) => {
    const sql = `select c.*, u.username as username, u.name as name, u.avatar as avatar from comments_tour c, user u where c.tour_id=${tour_id} and u.id=c.user_id order by c.id DESC;`
    return load(sql)
})

const loadReviewByTourId = ((tourid) => {
    const sql = `select review_detail from tour t where t.id=${tourid};`
    return load(sql)
})

const updateReview = ((review, average, tour_id) => {
    const query =  `update tour set review_detail='${review}', rating=${average} where id=${tour_id};`
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

const findOtherTourInGroup = async(tourid) => {
    const sql = `SELECT DISTINCT p.id as id, p.name as content from tour p, activity_tour ap WHERE p.id=ap.tour_id and ap.activity_id in 
    (SELECT activity_id FROM activity_tour WHERE tour_id=${tourid});`
    return load(sql)
}

const deactivateTour = async(tour_id) => {
    const sql = `update tour set is_active=0 where id in (${tour_id});`
    return save(sql)
}

const activateTour = async(tour_id) => {
    const sql = `update tour set is_active=1 where id in (${tour_id});`
    return save(sql)
}

const insertNewTour = async(tour, tourism_id) => {
    const sql = `insert into tour(name, price, highlight, wtd, important_info, additional, cancel_policy, key_detail, advantage, thumbnail, tourism_id, duration)
    values('${tour.name}', ${tour.price}, '${tour.highlight}', '${tour.wtd}', '${tour.important_info}', '${tour.additional}', '${tour.cancel_policy}',
    '${tour.key_detail}', '${tour.advantage}', '${tour.thumbnail}', ${tourism_id}, '${tour.duration}');`
    return save(sql)
}

const updateTour = (async(tour) => {
    const sql = `update tour set name='${tour.name}', price=${tour.price}, highlight='${tour.highlight}', wtd='${tour.wtd}', important_info='${tour.important_info}', additional='${tour.additional}', 
    cancel_policy='${tour.cancel_policy}', key_detail='${tour.key_detail}', advantage='${tour.advantage}', thumbnail='${tour.thumbnail}', 
    tourism_id=${tour.tourism_id}, duration='${tour.duration}' where id=${tour.id};`
    return save(sql)
})

const deactivateImage = ((imageids) => {
    const sql = `update images_tour set status=0 where id in (${imageids});`;
    return save(sql)
})

const loadActivityByTourId = ((tourid) => {
    const query = `SELECT * FROM activity_tour WHERE tour_id =${tourid} and stt=1;`
    return load(query)
})

const deactivateKindOfTour = ((ids) => {
    const sql = `delete from activity_tour where id in (${ids});`;
    return save(sql)
})

const loadMostViewTours = ((from, to) => {
    const query = `SELECT b.*, count(a.id) as times from tour_user_log a, tour b 
    where a.tour_id=b.id and log_time between '${from}' and '${to}' group by tour_id order by times desc;`
    return load(query)
})

const loadTopRating = async() => {
    const query = `SELECT DISTINCT id, name, thumbnail, rating, price, review FROM tour where is_active=1 ORDER BY rating DESC, 
    review DESC;`
    return load(query)
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
    findOtherTourInGroup, loadInfoAllTours,
    deactivateTour, activateTour, loadTopRating,
    insertNewTour, updateTour, deactivateImage,
    loadActivityByTourId, deactivateKindOfTour,
    loadMostViewTours, loadTopCheapest, loadTopMostExpensive,
    getAllTourisms, findTourByNameAndActivity,
    findMostViewedTourByName, findMostViewedTourByNameAndActivity, loadMostViewedTourByActivityId,
    findMostExpensiveTourByName, findCheapestTourByName,
    findMostExpensiveTourByNameAndActivity, findCheapestTourByNameAndActivity,
    loadMostExpensiveTourByActivityId, loadCheapestTourByActivityId
}