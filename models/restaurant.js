const { load, save } = require(global.appRoot + '/models/db-access')

const insertRestaurant = (async(restaurant) => {
    const sql = `insert into restaurant(name, about, thumbnail, common_rating, open_hour, common_review, review_count, 
        ranking, address, phone, rating_detail, price_from, price_to, kind, meals, features) 
    values('${restaurant.name}', '${restaurant.about}', '${restaurant.thumbnail}', ${restaurant.common_rating}, 
    '${restaurant.open_hour}', '${restaurant.common_review}', ${restaurant.review_count}, '${restaurant.ranking}', 
    '${restaurant.address}', '${restaurant.phone}', '${restaurant.rating_detail}', '${restaurant.from}', '${restaurant.to}',
    '${restaurant.kind}', '${restaurant.meals}', '${restaurant.features}');`;
    return save(sql)
})

const insertImage = (async(image, restaurant) => {
    const sql = `insert into images_restaurant(address, res_id) values('${image}', ${restaurant});`;
    return save(sql)
})

const insertComment = (async(comment, res_id, user_id) => {
    const sql = `insert into comments_restaurant(review, date, quote, content, res_id, user_id) values(${comment.review}, '${comment.date}', '${comment.quote}', '${comment.content}', ${res_id}, ${user_id});`;
    return save(sql)
})

const insertCuisineRestaurant = (async(cuisine, restaurant) => {
    const sql = `INSERT INTO cuisine_restaurant(cuisine_id, res_id) values(${cuisine}, ${restaurant});`
    return save(sql)
})

const insertCuisine = (async(cuisine) => {
    const sql = `INSERT INTO cuisine(name) values('${cuisine}');`
    return save(sql)
})

const insertFoodTypeRestaurant = (async(type, res) => {
    const sql = `INSERT INTO foodtype_restaurant(type_id, res_id) values(${type}, ${res});`
    return save(sql)
})

const insertMealRestaurant = (async(meal, res) => {
    const sql = `INSERT INTO meal_restaurant(meal_id, res_id) values(${meal}, ${res});`
    return save(sql)
})

const insertFeatureRestaurant = (async(feature, res) => {
    const sql = `INSERT INTO feature_restaurant(feature_id, res_id) values(${feature}, ${res});`
    return save(sql)
})

const findCuisineByName = (async(cuisine) => {
    const sql = `SELECT * FROM cuisine WHERE name = '${cuisine}';`
    return load(sql)
})

const findCuisinesByResId = (async(res_id) => {
    const sql = `SELECT * FROM cuisine_restaurant WHERE res_id = ${res_id};`
    return load(sql)
})

const findRestaurantByName = (async(rest) => {
    const sql = `SELECT * FROM restaurant WHERE name = '${rest}';`
    return load(sql)
})

const findFoodTypesByResId = (async(res_id) => {
    const sql = `SELECT * FROM foodtype_restaurant WHERE res_id = ${res_id};`
    return load(sql)
})

const findFoodTypeByName = (async(type) => {
    const sql = `SELECT * FROM food_type WHERE name = '${type}';`
    return load(sql)
})

const findMealsByResId = (async(res_id) => {
    const sql = `SELECT * FROM meal_restaurant WHERE res_id = ${res_id};`
    return load(sql)
})

const findMealByName = (async(meal) => {
    const sql = `SELECT * FROM meal WHERE name = '${meal}';`
    return load(sql)
})

const findFeaturesByResId = (async(res_id) => {
    const sql = `SELECT * FROM feature_restaurant WHERE res_id = ${res_id};`
    return load(sql)
})

const findRestFeatureByName = (async(feature) => {
    const sql = `SELECT * FROM feature WHERE name = '${feature}';`
    return load(sql)
})

const loadAllCuisines = async() => {
    const sql = `SELECT * FROM cuisine;`
    return load(sql)
}

const loadAllFeatures = async() => {
    const sql = `SELECT * FROM feature;`
    return load(sql)
}

const loadAllFoodType = async() => {
    const sql = `SELECT * FROM food_type;`
    return load(sql)
}

const loadAllFoodMeal = async() => {
    const sql = `SELECT * FROM meal;`
    return load(sql)
}

const loadTop20ByRating = (async() => {
    const query = 'SELECT id, name, thumbnail, common_rating, ranking, review_count FROM restaurant ORDER BY common_rating DESC, review_count DESC LIMIT 20;'
    return load(query)
}) 

const loadAllRestaurant = (async() => {
    const query = 'SELECT id, name, thumbnail, common_rating, ranking, review_count FROM restaurant;'
    return load(query)
}) 

const findRestaurantById = async(id) => {
    const sql = `SELECT * FROM restaurant WHERE id=${id};`
    return load(sql)
}

const loadImagesByRestaurantId = async(id) => {
    const sql = `SELECT * FROM images_restaurant where res_id=${id} and status=1 order by id DESC;`
    return load(sql)
}

const loadCommentsByRestaurantId = async(id) => {
    const sql = `SELECT c.*, u.username as username, u.name as name, u.avatar as avatar FROM comments_restaurant c, user u where res_id=${id} and u.id=c.user_id order by c.id DESC;`
    return load(sql)
}

const findResByNameCuisines = ((name, cuisines_ids) => {
    const query = `SELECT DISTINCT r.* from restaurant r, cuisine_restaurant cr
    WHERE r.id=cr.res_id and cr.cuisine_id in (${cuisines_ids}) and LOWER(r.name) like LOWER('%${name}%') 
    ORDER BY common_rating DESC, review_count DESC;`
    return load(query)
})

const findMostViewedResByNameCuisines = ((name, cuisines_ids, from, to) => {
    const query = `SELECT b.*, count(a.id) as times FROM restaurant_user_log a,
        (SELECT DISTINCT r.* from restaurant r, cuisine_restaurant cr
        WHERE r.id=cr.res_id and cr.cuisine_id in (${cuisines_ids}) and LOWER(r.name) like LOWER('%${name}%')) as b
    WHERE a.rest_id=b.id and log_time between '${from}' and '${to}' group by rest_id  
    ORDER BY times DESC, common_rating DESC, review_count DESC;`
    return load(query)
})

const findResByNameFeatures = ((name, features_ids) => {
    const query = `SELECT DISTINCT r.* from restaurant r, feature_restaurant fr
    WHERE r.id=fr.res_id and fr.feature_id in (${features_ids}) and LOWER(r.name) like LOWER('%${name}%') 
    ORDER BY common_rating DESC, review_count DESC;`
    return load(query)
})

const findMostViewedResByNameFeatures = ((name, features_ids, from, to) => {
    const query = `SELECT b.*, count(a.id) as times from restaurant_user_log a,
        (SELECT DISTINCT r.* from restaurant r, feature_restaurant fr
        WHERE r.id=fr.res_id and fr.feature_id in (${features_ids}) and LOWER(r.name) like LOWER('%${name}%')) as b
    WHERE a.rest_id=b.id and log_time between '${from}' and '${to}' group by rest_id 
    ORDER BY times DESC, common_rating DESC, review_count DESC;`
    return load(query)
})

const findResByNameFoodTypes = ((name, types_ids) => {
    const query = `SELECT DISTINCT r.* from restaurant r, foodtype_restaurant fr
    WHERE r.id=fr.res_id and fr.type_id in (${types_ids}) and LOWER(r.name) like LOWER('%${name}%') 
    ORDER BY common_rating DESC, review_count DESC;`
    return load(query)
})

const findMostViewedResByNameFoodTypes = ((name, types_ids, from, to) => {
    const query = `SELECT b.*, count(a.id) as times from restaurant_user_log a,
        (SELECT DISTINCT r.* from restaurant r, foodtype_restaurant fr
        WHERE r.id=fr.res_id and fr.type_id in (${types_ids}) and LOWER(r.name) like LOWER('%${name}%')) as b
    WHERE a.rest_id=b.id and log_time between '${from}' and '${to}' group by rest_id 
    ORDER BY times DESC, common_rating DESC, review_count DESC;`
    return load(query)
})

const findResByRestIds = ((rest_ids) => {
    const query = `SELECT id, name, thumbnail, common_rating, ranking, review_count FROM restaurant where id in (${rest_ids}) ORDER BY common_rating DESC, review_count DESC;`
    return load(query)
})

const findResByName = ((name) => {
    const query = `SELECT DISTINCT * from restaurant r 
    WHERE LOWER(r.name) like LOWER('%${name}%') 
    ORDER BY common_rating DESC, review_count DESC;`
    return load(query)
})

const findMostViewedResByName = ((name, from, to) => {
    const query = `SELECT b.*, count(a.id) as times from restaurant_user_log a,
        (SELECT DISTINCT * from restaurant r 
        WHERE LOWER(r.name) like LOWER('%${name}%')) as b
    WHERE a.rest_id=b.id and log_time between '${from}' and '${to}' group by rest_id
    ORDER BY times DESC, common_rating DESC, review_count DESC;`
    return load(query)
})

const findResByNameMeals = ((name, meals_ids) => {
    const query = `SELECT DISTINCT r.* from restaurant r, meal_restaurant mr
    WHERE r.id=mr.res_id and mr.meal_id in (${meals_ids}) and LOWER(r.name) like LOWER('%${name}%') 
    ORDER BY common_rating DESC, review_count DESC;`
    return load(query)
})

const findMostViewResByNameMeals = ((name, meals_ids, from, to) => {
    const query = `SELECT b.*, count(a.id) as times from restaurant_user_log a,
        (SELECT DISTINCT r.* from restaurant r, meal_restaurant mr
        WHERE r.id=mr.res_id and mr.meal_id in (${meals_ids}) and LOWER(r.name) like LOWER('%${name}%')) as b
    WHERE a.rest_id=b.id and log_time between '${from}' and '${to}' group by rest_id
    ORDER BY times DESC, common_rating DESC, review_count DESC;`
    return load(query)
})

const checkIfUserAlreadyReview = ((res_id, user_id) => {
    const query = `select * from rating_restaurant where res_id=${res_id} and user_id=${user_id};`
    return load(query)
})

const insertRating = ((info) => {
    const query = `insert into rating_restaurant(rating, res_id, user_id) values(${info.rating}, ${info.res_id}, ${info.user_id});`;
    return save(query)
})

const updateRating = ((info) => {
    const query = `update rating_restaurant set rating = ${info.rating} where res_id=${info.res_id} and user_id=${info.user_id};`;
    return save(query)
})

const loadReviewByResId = ((resid) => {
    const sql = `select review_detail from restaurant t where t.id=${resid};`
    return load(sql)
})

const updateReview = ((review, average, res_id) => {
    const query =  `update restaurant set review_detail='${review}', common_rating=${average} where id=${res_id};`
    return save(query)
})

const findOtherRestInCuisineGroup = async(restid) => {
    const sql = `SELECT DISTINCT p.id, CONCAT(p.kind, ' ',p.meals, ' ',p.features) as content from restaurant p, cuisine_restaurant ap WHERE p.id=ap.res_id and ap.cuisine_id in 
    (SELECT cuisine_id FROM cuisine_restaurant WHERE res_id=${restid});`
    return load(sql)
}

const findOtherRestInFeatureGroup = async(restid) => {
    const sql = `SELECT DISTINCT p.id as id, p.name as content from restaurant p, feature_restaurant ap WHERE p.id=ap.res_id and ap.feature_id in 
    (SELECT feature_id FROM feature_restaurant WHERE res_id=${restid});`
    return load(sql)
}

const findOtherRestInFoodTypeGroup = async(restid) => {
    const sql = `SELECT DISTINCT p.id as id, p.name as content from restaurant p, foodtype_restaurant ap WHERE p.id=ap.res_id and ap.type_id in 
    (SELECT type_id FROM foodtype_restaurant WHERE res_id=${restid});`
    return load(sql)
}

const findOtherRestInMealGroup = async(restid) => {
    const sql = `SELECT DISTINCT p.id as id, p.name as content from restaurant p, meal_restaurant ap WHERE p.id=ap.res_id and ap.meal_id in 
    (SELECT meal_id FROM meal_restaurant WHERE res_id=${restid});`
    return load(sql)
}
const updateRestaurant = (async(restaurant) => {
    const sql = `update restaurant set name='${restaurant.name}', about='${restaurant.about}', thumbnail='${restaurant.thumbnail}', 
    open_hour='${restaurant.open_hour}', address='${restaurant.address}', 
    phone='${restaurant.phone}', price_from='${restaurant.from}', price_to='${restaurant.to}' where id=${restaurant.id};`;
    return save(sql)
})

const deactivateRestaurant = async(rest_id) => {
    const sql = `update restaurant set is_active=0 where id in (${rest_id});`
    return save(sql)
}

const activateRestaurant = async(rest_id) => {
    const sql = `update restaurant set is_active=1 where id in (${rest_id});`
    return save(sql)
}

const insertNewRestaurant = async(restaurant) => {
    const sql = `insert into restaurant(name, about, thumbnail, open_hour, address, phone, price_from, price_to) 
    values('${restaurant.name}', '${restaurant.about}', '${restaurant.thumbnail}', 
    '${restaurant.open_hour}', '${restaurant.address}', '${restaurant.phone}', '${restaurant.from}', '${restaurant.to}');`;
    return save(sql)
}

const deactivateImage = ((imageids) => {
    const sql = `delete from images_restaurant where id in (${imageids});`;
    return save(sql)
})

const deactivateCuisineOfRestaurant = ((cuisine_ids) => {
    const sql = `delete from cuisine_restaurant where id in (${cuisine_ids});`;
    return save(sql)
})

const deactivateFTOfRestaurant = ((ft_ids) => {
    const sql = `delete from foodtype_restaurant where id in (${ft_ids});`;
    return save(sql)
})

const deactivateMealsOfRestaurant = ((meal_ids) => {
    const sql = `delete from meal_restaurant where id in (${meal_ids});`;
    return save(sql)
})

const deactivateFeaturesOfRestaurant = ((feature_ids) => {
    const sql = `delete from feature_restaurant where id in (${feature_ids});`;
    return save(sql)
})

const loadCuisineByRestId = ((restid) => {
    const query = `SELECT * FROM cuisine_restaurant WHERE res_id =${restid} and stt=1;`
    return load(query)
})

const loadFoodTypeByRestId = ((restid) => {
    const query = `SELECT * FROM foodtype_restaurant WHERE res_id =${restid} and stt=1;`
    return load(query)
})

const loadMealByRestId = ((restid) => {
    const query = `SELECT * FROM meal_restaurant WHERE res_id =${restid} and stt=1;`
    return load(query)
})

const loadFeatureByRestId = ((restid) => {
    const query = `SELECT * FROM feature_restaurant WHERE res_id =${restid} and stt=1;`
    return load(query)
})

const loadMostViewRestaurants = ((from, to) => {
    const query = `SELECT b.*, count(a.id) as times from restaurant_user_log a, restaurant b 
    where a.rest_id=b.id and log_time between '${from}' and '${to}' group by rest_id order by times desc;`
    return load(query)
})

const loadAllFeaturesOfRes = (() => {
    const query = `SELECT id, kind FROM restaurant;`
    return load(query)
})

const loadTopRating = (async() => {
    const query = 'SELECT id, name, thumbnail, common_rating, ranking, review_count FROM restaurant where is_active=1 ORDER BY common_rating DESC, review_count DESC;'
    return load(query)
}) 

module.exports = {
    insertRestaurant, insertImage, insertComment,
    insertCuisine, findCuisineByName, insertCuisineRestaurant,
    insertMealRestaurant, insertFeatureRestaurant, loadTopRating,
    findRestaurantByName, findFoodTypeByName, findMealByName,
    findMealByName, findRestFeatureByName, insertFoodTypeRestaurant,
    loadAllCuisines, loadAllFeatures, loadAllFoodMeal, loadAllFoodType,
    loadTop20ByRating, findRestaurantById, loadImagesByRestaurantId,
    loadCommentsByRestaurantId, findResByNameCuisines, findResByNameFeatures,
    findResByNameFoodTypes, findResByNameMeals, findResByName,
    checkIfUserAlreadyReview, insertRating, updateRating, 
    loadReviewByResId, updateReview, findResByRestIds,
    findOtherRestInCuisineGroup, findOtherRestInFoodTypeGroup, findOtherRestInMealGroup,
    findOtherRestInFeatureGroup, updateRestaurant, loadAllRestaurant,
    deactivateRestaurant, activateRestaurant, insertNewRestaurant,
    deactivateImage, loadCuisineByRestId, loadFoodTypeByRestId,
    loadMealByRestId, loadFeatureByRestId,loadMostViewRestaurants, 
    findMealsByResId, findFeaturesByResId, findFoodTypesByResId, findCuisinesByResId,
    deactivateCuisineOfRestaurant, deactivateFTOfRestaurant, deactivateFeaturesOfRestaurant, deactivateMealsOfRestaurant,
    loadAllFeaturesOfRes, findMostViewedResByNameCuisines, findMostViewedResByNameFeatures,
    findMostViewedResByNameFoodTypes, findMostViewResByNameMeals, findMostViewedResByName
}