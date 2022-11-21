const express = require("express");
const router = express.Router();
const DB = require('../../Modules/ConnectDataBase');
const moment = require("moment-timezone");
router.use((req, res, next) => {
    next();
});

router.use('/', async (req, res) => {

    let { price, cuttedprice, coupon_sid, memos } = req.body;

    let outputData = [];

    const shopSid = req.session.cartShop;
    // console.log(shopSid);

    const memberSid = req.session.member.sid;
    // shopSid memberSid

    //寫入訂單資料
    const orderListSql = "INSERT INTO `orders`(`member_sid`,`shop_sid`, `order_time`,`order_total`,`memo`,`coupon_sid`,`sale`) VALUES (?,?,NOW(),?,?,?,?)";

    const [result] = await DB.query(orderListSql,[memberSid,shopSid,price,memos,coupon_sid,cuttedprice]);
    // console.log("id",result.insertId);
    const insertedSid = result.insertId;
    // console.log("row",result.affectedRows);
    // res.json(result);

    //※※※※※※※※※※※※※※※※※※※※※※※※※

    let cartList = req.session.cart[shopSid].list;

    let op;


    //寫入訂單明細(商品、價格、數量)
    for (element in cartList) {

        const getPriceSql = "SELECT `SID`,`price` FROM `products` WHERE SID = ?";

        const [[gettedprice]] = await DB.query(getPriceSql,element);
        // console.log(gettedprice.price);
        const sqlDetail =  "INSERT INTO `order_detail`(`order_sid`,`product_sid`,`product_price`,`amount`)VALUES(?,?,?,?)";

        const [detailResult] = await DB.query(sqlDetail,[insertedSid,element,gettedprice.price,cartList[element]]);
        op = detailResult;
    }
    if(coupon_sid!==0){
        //insertedSid

        const couponSql = "UPDATE`coupon` SET `order_sid` = ?, `is_used` = 1, `used_time` = NOW() WHERE `sid` = ?";

        const [couponResult] = await DB.query(couponSql,[insertedSid,coupon_sid]);
    }

    delete req.session.cart[shopSid];
    delete req.session.cartShop;

    let cartTotal = 0;
    for (element in req.session.cart) {
        if (req.session.cart[element].shopTotal) {
            cartTotal += req.session.cart[element].shopTotal;
        }
    }
    
    req.session.cartTotal = cartTotal;
    if(cartTotal===0){
        delete req.session.cart;
        delete req.session.cartTotal;
    }
    res.json(1);
})
module.exports = router;