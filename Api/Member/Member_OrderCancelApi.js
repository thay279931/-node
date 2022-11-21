const express = require("express");
const router = express.Router();
const DB = require('../../Modules/ConnectDataBase');
const moment = require("moment-timezone");
router.use((req, res, next) => {
    next();
});
router.use('/', async (req, res) => {
    // {"order_sid": outputSid,"whoCanceled": 0,"canceledReason":reason,"coupon_sid":0}

    const {order_sid,whoCanceled,canceledReason} = req.body;
    console.log({order_sid});
    console.log({whoCanceled});
    console.log({canceledReason});
    console.log(req.body);
    const sql = "UPDATE `orders` SET `shop_order_status`= 0, `order_finish`= 1, `complete_time` = NOW(), `who_canceled` =?, `canceled_reason` = ? WHERE `sid` = ?";

    const [response] = await DB.query(sql,[whoCanceled,canceledReason,order_sid]);
    // console.log(response.changedRows);

    res.json(response.changedRows);
})
module.exports = router;