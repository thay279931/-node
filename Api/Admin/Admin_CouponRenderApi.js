const express = require("express");
const router = express.Router();
const DB = require('../../Modules/ConnectDataBase');
const moment = require("moment-timezone");
router.use((req, res, next) => {
    next();
});

router.use('/', async (req, res) => {
    // console.log(req.session.member);
    //沒登入判定
    if (!req.session.admin) {
        return res.json(0);
    }
    //有登入才叫資料 
    else if(req.session.admin.sid ===101){

        const sql = "SELECT cc.*, s.name shop_name FROM `coupon_content` cc LEFT JOIN `shop` s ON s.`sid` = cc.`shop_sid` WHERE 1";

        let [getData] = await DB.query(sql);

        for (let element of  getData) {
            //時間格式設定
            const expire = element.expire
            if (expire) {
                element.expire  = moment(expire).tz("Asia/Taipei").format("YYYY-MM-DD HH:mm:ss");                
            }
            const getTime = element.get_limit_time
            if (getTime) {
                element.get_limit_time = moment(getTime).tz("Asia/Taipei").format("YYYY-MM-DD HH:mm:ss");
            }
        }

        return res.json(getData);
    }
})
module.exports = router;