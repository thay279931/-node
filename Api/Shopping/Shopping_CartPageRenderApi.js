const express = require("express");
const router = express.Router();
const DB = require('../../Modules/ConnectDataBase');
const moment = require("moment-timezone");
router.use((req, res, next) => {
    next();
});

router.use('/', async (req, res) => {

    let postData = req.body;

    let outputData = [];
    //購物車空則導向商品頁


    const shopSid = req.session.cartShop;
    console.log(shopSid);

    if (!req.session.cart || !shopSid) {
        // console.log(123);
        res.json(0);
    } else {

        let cartList = req.session.cart[shopSid].list;

        let index = 0;

        for (element in cartList) {

            const sql = "SELECT p.`sid`,p.`name` product_name,p.`price`,p.`src`,s.`name`,p.`shop_sid`,s.`wait_time` FROM products p LEFT JOIN `shop` s ON p.`shop_sid`= s.`sid` WHERE p.`sid` = ?";

            const [[result]] = await DB.query(sql, element);
            //商品明細        
            outputData[index] = result;
            //商品數量
            outputData[index].amount = cartList[element];

            index++;
        }
        res.json(outputData);
    }

})
module.exports = router;