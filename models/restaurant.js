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

const findRestaurantByName = (async(rest) => {
    const sql = `SELECT * FROM restaurant WHERE name = '${rest}';`
    return load(sql)
})

const findFoodTypeByName = (async(type) => {
    const sql = `SELECT * FROM food_type WHERE name = '${type}';`
    return load(sql)
})

const findMealByName = (async(meal) => {
    const sql = `SELECT * FROM meal WHERE name = '${meal}';`
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

const findRestaurantById = async(id) => {
    const sql = `SELECT * FROM restaurant WHERE id=${id};`
    return load(sql)
}

const loadImagesByRestaurantId = async(id) => {
    const sql = `SELECT * FROM images_restaurant where res_id=${id};`
    return load(sql)
}

const loadCommentsByRestaurantId = async(id) => {
    const sql = `SELECT * FROM comments_restaurant where res_id=${id};`
    return load(sql)
}

module.exports = {
    insertRestaurant, insertImage, insertComment,
    insertCuisine, findCuisineByName, insertCuisineRestaurant,
    insertMealRestaurant, insertFeatureRestaurant,
    findRestaurantByName, findFoodTypeByName, findMealByName,
    findMealByName, findRestFeatureByName, insertFoodTypeRestaurant,
    loadAllCuisines, loadAllFeatures, loadAllFoodMeal, loadAllFoodType,
    loadTop20ByRating, findRestaurantById, loadImagesByRestaurantId,
    loadCommentsByRestaurantId
    
}