const { load, save } = require(global.appRoot + '/models/db-access')

const insertPlace = (async(place) => {
    const sql = `insert into place(name, about, thumbnail, rating, review, ranking, duration, review_detail, address, phone) 
    values('${place.name}', '${place.about}', '${place.thumbnail}', ${place.rating}, ${place.review}, '${place.ranking}', '${place.duration}', '${place.review_detail}', '${place.address}', '${place.phone}');`;
    return save(sql)
})

const insertImage = ((image, place) => {
    const sql = `insert into images(address, place_id) values('${image}', ${place});`;
    return save(sql)
})

const deactivateImage = ((imageids) => {
    const sql = `update images set status=0 where id in (${imageids});`;
    return save(sql)
})

const deactivateKindOfPlace = ((ids) => {
    const sql = `delete from activity_place where id in (${ids});`;
    return save(sql)
})

const insertContact = (contact => {
    const sql = `insert into contact(phone, address, place_id) values('${contact.phone}', '${contact.address}', ${contact.place_id});`;
    return save(sql)
})

const insertComment = ((comment, place_id, user_id) => {
    const sql = `insert into comments(quote, content, place_id, user_id) values('${comment.quote}', '${comment.content}', ${place_id}, ${user_id});`;
    return save(sql)
})

const insertActivityPlace = ((activity_id, place_id) => {
    const sql = `insert into activity_place(activity_id, place_id) values(${activity_id}, ${place_id});`;
    return save(sql)
})

const loadAllActivities = (() => {
    const sql = `select * from activity_of_place`
    return load(sql)
})

const loadAllIdAndNamePlaces = (() => {
    const sql = `select id, name as content from place where is_active=1`
    return load(sql)
})

const loadAllIdAndAboutPlaces = (async() => {
    const sql = `select id, about as content from place where is_active=1`
    return load(sql)
})

const loadAllIdNameAndAboutPlaces = (async() => {
    const sql = `select id, about, name from place where is_active=1`
    return load(sql)
})

const loadIdAndNamePlaceById = ((id) => {
    const sql = `select id, name as content from place where id=${id} and is_active=1`
    return load(sql)
})

const loadByName = ((name) => {
    const sql = `select id, name from place where name='${name}' and is_active=1;`
    return load(sql)
})

const loadDetailById = ((placeid) => {
    const sql = `select * from place p where p.id=${placeid} and is_active=1;`
    return load(sql)
})

const loadImagesByPlaceId = ((placeid) => {
    const sql = `select * from images i where i.place_id=${placeid} and i.status=1 order by i.id DESC;`
    return load(sql)
})

const loadContactByPlaceId = ((placeid) => {
    const sql = `select * from contact c where c.place_id=${placeid};`
    return load(sql)
})

const loadCommentsByPlaceId = ((placeid) => {
    const sql = `select c.*, u.username as username, u.name as name, u.avatar as avatar from comments c, user u where c.place_id=${placeid} and u.id=c.user_id order by c.id DESC;`
    return load(sql)
})

const loadReviewByPlaceId = ((placeid) => {
    const sql = `select review_detail from place p where p.id=${placeid} and p.is_active=1;`
    return load(sql)
})

const loadTop20ByRating = (() => {
    const query = 'SELECT id, name, thumbnail, rating, ranking, review FROM place where is_active=1 ORDER BY rating DESC, ranking DESC, review DESC LIMIT 20;'
    return load(query)
})  

const loadTopRating = (() => {
    const query = 'SELECT id, name, thumbnail, rating, ranking, review FROM place where is_active=1 ORDER BY rating DESC, ranking DESC, review DESC;'
    return load(query)
})  

const loadAllPlaces = (() => {
    const query = 'SELECT id, name, thumbnail, rating, ranking, review FROM place where is_active=1;'
    return load(query)
})  

const loadAllCategories = (() => {
    const query = 'SELECT * FROM place_category;'
    return load(query)
})

const loadActivitiesByCategoryId = ((cat_id) => {
    const query = `SELECT * FROM activity_of_place WHERE category=${cat_id};`
    return load(query)
})

const loadActivityByName = ((name) => {
    const query = `SELECT * FROM activity_of_place WHERE name='${name}';`
    return load(query)
})

const loadActivityByPlaceId = ((placeid) => {
    const query = `SELECT * FROM activity_place WHERE place_id =${placeid} and stt=1;`
    return load(query)
})

const loadPlacesByActivityId = async(act_ids) => {
    const query = `SELECT DISTINCT p.id, p.name, p.thumbnail, p.rating, p.ranking, p.review FROM place p, activity_place ap WHERE p.id=ap.place_id and p.is_active=1 and ap.activity_id in (${act_ids}) ORDER BY rating DESC, 
    ranking DESC, review DESC;`
    return load(query)
}

const loadPlacesByPlaceIds = async(place_ids) => {
    const query = `SELECT DISTINCT p.id, p.name, p.thumbnail, p.rating, p.ranking, p.review FROM place p WHERE p.id in (${place_ids}) and p.is_active=1 ORDER BY rating DESC, 
    ranking DESC, review DESC;`
    return load(query)
}

const findPlacesById = async(place_ids) => {
    const query = `SELECT * FROM place WHERE id in (${place_ids}) and is_active=1 ORDER BY rating DESC, 
    ranking DESC, review DESC;`
    return load(query)
}

const findPlaceByName = (name => {
    const query =  `SELECT id, name, thumbnail, rating, ranking, review FROM place WHERE LOWER(name) like LOWER('%${name}%') and is_active=1 ORDER BY rating DESC, ranking DESC, review DESC; `
    return load(query)
})

const findRatedPlaceByUser = async(userid) => {
    const query =  `SELECT * FROM rating_place WHERE user_id=${userid} ORDER BY id DESC; `
    return load(query)
}

const findPlaceByNameAndActivity = ((name, act_ids) => {
    const query = `SELECT DISTINCT p.id, p.name, p.thumbnail, p.rating, p.ranking, p.review FROM place p, activity_place ap
    WHERE p.id=ap.place_id and p.is_active=1 and ap.activity_id in (${act_ids}) and LOWER(p.name) like LOWER('%${name}%') ORDER BY rating DESC, 
    ranking DESC, review DESC;`
    return load(query)
})

const updateReview = ((review, average, placeid) => {
    const query =  `update place set review_detail='${review}', rating=${average} where id=${placeid};`
    return save(query)
})

const checkIfUserAlreadyReview = ((placeid, user_id) => {
    const query = `select * from rating_place where place_id=${placeid} and user_id=${user_id};`
    return load(query)
})

const updateRating = ((info) => {
    const query = `update rating_place set rating = ${info.rating} where place_id=${info.place_id} and user_id=${info.user_id};`;
    return save(query)
})

const insertRating = ((info) => {
    const query = `insert into rating_place(rating, place_id, user_id) values(${info.rating}, ${info.place_id}, ${info.user_id});`;
    return save(query)
})

const findOtherPlaceInGroup = async(placeid) => {
    const sql = `SELECT DISTINCT p.id as id, p.name as content from place p, activity_place ap WHERE p.id=ap.place_id and p.is_active=1 and ap.activity_id in 
    (SELECT activity_id FROM activity_place WHERE place_id=${placeid});`
    return load(sql)
}

const updatePlace = (async(place) => {
    const sql = `update place set name='${place.name}', about='${place.about}', thumbnail='${place.thumbnail}',
     open_hour='${place.open_hour}', duration='${place.duration}', 
     address='${place.address}', phone='${place.phone}' where id=${place.id};`
    return save(sql)
})

const deactivatePlace = async(place_id) => {
    const sql = `update place set is_active=0 where id in (${place_id});`
    return save(sql)
}

const activatePlace = async(place_id) => {
    const sql = `update place set is_active=1 where id in (${place_id});`
    return save(sql)
}

const loadChildCategoriesOnly = (() => {
    const query = `SELECT * FROM activity_of_place WHERE id not in (SELECT distinct a1.id FROM activity_of_place a1, activity_of_place a2 WHERE a1.id = a2.parent);`
    return load(query)
})

const loadMostViewPlaces = ((from, to) => {
    const query = `SELECT b.*, count(a.id) as times FROM place_user_log a, place b 
    where a.place_id=b.id and log_time between '${from}' and '${to}' group by place_id order by times desc;`
    return load(query)
})

const addNewPlace = (async(place) => {
    const sql = `insert into place(name, about, thumbnail, open_hour, duration, address, phone) 
    values('${place.name}', '${place.about}', '${place.thumbnail}', '${place.open_hour}', '${place.duration}', '${place.address}', '${place.phone}');`;
    return save(sql)
})

module.exports = {
    insertPlace, insertImage,
    insertContact, insertComment,
    insertActivityPlace, loadAllActivities,
    loadDetailById, loadImagesByPlaceId,
    loadContactByPlaceId, loadCommentsByPlaceId,
    loadReviewByPlaceId, loadTop20ByRating,
    loadAllCategories, loadActivitiesByCategoryId,
    loadPlacesByActivityId, findPlaceByName,
    findPlaceByNameAndActivity, updateReview, 
    loadAllIdAndNamePlaces, findPlacesById,
    loadActivityByName, loadByName,
    checkIfUserAlreadyReview, updateRating,
    insertRating, loadAllIdAndAboutPlaces,
    loadIdAndNamePlaceById, findRatedPlaceByUser,
    loadPlacesByPlaceIds,
    findOtherPlaceInGroup, loadAllIdNameAndAboutPlaces,
    updatePlace, loadAllPlaces,
    deactivatePlace, activatePlace,
    loadChildCategoriesOnly, deactivateImage,
    loadActivityByPlaceId, deactivateKindOfPlace,
    addNewPlace, loadMostViewPlaces, loadTopRating
}