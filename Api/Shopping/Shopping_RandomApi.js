const express = require("express");
const router = express.Router();
const DB = require('../../Modules/ConnectDataBase');


router.use((req, res, next) => {
    next();
});


router.get('/', async (req, res) => {


    const sql = "SELECT `sid`, `name`, `email`, `password`, `address`, `phone`, `food_type_sid`, `bus_start`, `bus_end`, `bus_day`, `rest_right`, `plat_right`, `src`, `pay`, `side`, `wait_time` FROM `shop` WHERE 1";

    let [[result]] = await DB.query(sql);

    console.log(result);




    return res.json(result);

});

module.exports = router;