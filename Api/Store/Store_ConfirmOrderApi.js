const express = require("express");
const router = express.Router();
const DB = require('../../Modules/ConnectDataBase');
const moment = require("moment-timezone");
router.use((req, res, next) => {
    next();
});
//店家訂單動作
router.use('/', async (req, res) => {
    // {"order_sid": outputSid,"whoCanceled": 0,"canceledReason":reason,"coupon_sid":0}
    const shopSid = req.session.store.sid;
    //取消
    let postData = JSON.parse(JSON.stringify(req.body));
    if (Number(postData.confirm) === 0) {
        let response;
        let couponResponse = 1;
        const { order_sid, canceledReason, coupon_sid } = postData;
        //修改訂單資料
        const sql = "UPDATE `orders` SET `shop_order_status`= 0, `order_finish`= 1, `complete_time` = NOW(), `who_canceled` = 1, `canceled_reason` = ? WHERE `sid` = ?";
        [orderResponse] = await DB.query(sql, [canceledReason, order_sid]);
        response = orderResponse.changedRows;
        //如果有使用優惠券則修改優惠券資料(退還)
        if (coupon_sid) {
            const couponsql = "UPDATE `coupon` SET `order_sid` = ?,`is_used` = 0,`used_time` = ? WHERE `sid`= ?";
            [couponDBResponse] = await DB.query(couponsql, [null, null, parseInt(coupon_sid)]);
            couponResponse = couponDBResponse.changedRows;
        }
        if (response == 1 && couponResponse == 1) {
            return res.json(1);
        }
        else {
            return res.json(0);
        }
    }
    //接單
    else if (Number(postData.confirm) === 1) {
        const { order_sid } = postData;
        const sql = "UPDATE `orders` SET `shop_order_status`= 1,`recept_time` =NOW() WHERE `orders`.`sid` = ?";
        const [response] = await DB.query(sql, order_sid);
        // console.log(response);
        if (response.affectedRows == 1) {
            return res.json(1);
        }
        else {
            return res.json(0);
        }
    }
    //完成
    else if (Number(postData.confirm) === 2) {
        const { order_sid } = postData;
        const sql = "UPDATE `orders` SET `shop_order_status`= 1,    `order_finish`= 1,`complete_time` =NOW() WHERE `orders`.`sid` = ?";
        const [response] = await DB.query(sql, order_sid);
        // console.log(response.affectedRows);
        if (response.affectedRows == 1) {
            return res.json(1);
        }
        else {
            return res.json(0);
        }
    }
    //讀取等待時間
    else if (Number(postData.confirm) === 3) {
        const sql = "SELECT s.`wait_time` FROM `shop` s WHERE `sid` = ?";
        const [[response]] = await DB.query(sql,shopSid);
        if (response) {
            return res.json(response);
        }
        else {
            return res.json(0);
        }
    }
    //更改等待時間
    else if (Number(postData.confirm) === 4) {
        const { time } = postData;
        const sql = "UPDATE `shop` SET `wait_time`=? WHERE `sid`=?"
        const [response] =  await DB.query(sql,[time,shopSid]);
        if (response.changedRows==1) {
            return res.json(response.changedRows);
        }
        else {
            return res.json(0);
        }
    }










    res.json(0);


})
module.exports = router;