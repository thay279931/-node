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
    if (!req.session.member) {
        return res.json(0);
    }
    //有登入才叫資料 
    else {

        let memberSid = req.session.member.sid;

        let sql = "SELECT c.*, cc.`coupon_name`, cc.`use_range`, cc.`sale_detail`, cc.`shop_sid`, s.name FROM `coupon` c LEFT JOIN  `coupon_content` cc ON  c.`coupon_sid` = cc.`sid` LEFT JOIN `shop` s ON s.`sid` = cc.`shop_sid` WHERE c.`member_sid` = ?";

        let [getData] = await DB.query(sql, memberSid);

        for (let element of  getData) {
            //時間格式設定             expire get_time used_time
            const expire = element.expire
            if (expire) {
                element.expire  = moment(expire).tz("Asia/Taipei").format("YYYY-MM-DD HH:mm:ss");                
            }
            const getTime = element.get_time
            if (getTime) {
                element.get_time = moment(getTime).tz("Asia/Taipei").format("YYYY-MM-DD HH:mm:ss");
            }
            const usedTime = element.used_time
            if (usedTime) {
                element.used_time  = moment(usedTime).tz("Asia/Taipei").format("YYYY-MM-DD HH:mm:ss");                
            }
        }
        return res.json(getData);
    }
})
module.exports = router;