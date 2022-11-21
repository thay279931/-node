const express = require("express");
const router = express.Router();
const DB = require('../../Modules/ConnectDataBase');
const moment = require("moment-timezone");
router.use((req, res, next) => {
    next();
});


//要分割成兩部分 歷史訂單和現在訂單



router.use('/', async (req, res) => {
    // console.log(req.session.member);
    //沒登入判定
    if (!req.session.store) {
        return res.json(0);
    }
    //有登入才叫資料
    else {

        let storeSid = req.session.store.sid;

        let sql = "SELECT o.`SID`, o.`member_sid`, o.`shop_sid`, o.`shop_order_status`, o.`order_finish`, o.`order_time`, o.`recept_time`,o.`complete_time`,o.`order_total`,o.`memo`,o.`coupon_sid`,o.`sale`,o.`review`,o.`chat_sid`,o.`canceled_reason`,o.`who_canceled`,m.`name` 'member_name',m.`phone`,cc.`coupon_name` FROM `orders` o LEFT JOIN `member` m ON m.sid = o.`member_sid` LEFT  JOIN `shop` s ON o.`shop_sid` = s.`sid` LEFT JOIN `coupon` c ON o.`coupon_sid`=c.`sid` LEFT JOIN `coupon_content` cc ON  c.`coupon_sid` = cc.`sid` WHERE order_finish = 0 AND o.shop_sid = ?";

        let [getData] = await DB.query(sql, storeSid);

        //＊＊＊＊＊  forEach 沒有 await  ＊＊＊＊＊
        for (let element of  getData) {

            const orderSid = element.SID;
            // console.log(orderSid);

            const sqlDetail = "SELECT od.* ,p.name `product_name`,p.src FROM `order_detail` od LEFT JOIN `products` p ON od.`product_sid`= p.`SID` WHERE od.`order_sid` = ? ";

            let [details] = await DB.query(sqlDetail, orderSid);
            //每筆訂單的細節放進原本的資料裡
            element.cartList = details;

            const orderTime = element.order_time
            if (orderTime) {
                const orderTimeChanged = moment(orderTime).tz("Asia/Taipei").format("YYYY-MM-DD HH:mm:ss");
                element.order_time = orderTimeChanged;
            }
            const receptTime = element.recept_time
            if (receptTime) {
                const receptTimeChanged = moment(receptTime).tz("Asia/Taipei").format("YYYY-MM-DD HH:mm:ss");
                element.recept_time = receptTimeChanged;
            }
            const completeTime = element.complete_time
            if (completeTime) {
                const completeTimeChanged = moment(completeTime).tz("Asia/Taipei").format("YYYY-MM-DD HH:mm:ss");
                element.complete_time = completeTimeChanged;
            }
        }
        return res.json(getData);
    }
})
module.exports = router;