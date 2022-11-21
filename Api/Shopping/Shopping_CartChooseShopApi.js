const express = require("express");
const router = express.Router();
const DB = require('../../Modules/ConnectDataBase');
const moment = require("moment-timezone");
router.use((req, res, next) => {
    next();
});

router.use('/', async (req, res) => {

    let postData = req.body;

    let outputData = {};

    if (!req.session.cart) {
        res.redirect("/Shopping/Products.html")
    }
    //渲染
    if (postData.state === 0) {

        outputData.cartTotal = req.session.cartTotal;
        outputData.shopList = new Array();
        let index = 0;
        for (element in req.session.cart) {

            const sql = `SELECT name FROM shop WHERE sid= ${element} `;

            const [[result]] = await DB.query(sql);
            console.log(result);
            // console.log(index);

            outputData.shopList[index] = {};

            outputData.shopList[index].shop_name = result.name;

            outputData.shopList[index].shopTotal = req.session.cart[element].shopTotal;

            outputData.shopList[index].shop_sid = element;

            index++;
        }
        console.log(outputData);
        res.json(outputData);
    }
    //選擇
    else if (postData.state === 1) {
        req.session.cartShop = postData.choosed_sid;
        res.json(1);
    }

})
module.exports = router;