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

        let sql = "SELECT p.*,cc.`coupon_name` FROM `point_detail` p LEFT JOIN `coupon_content` cc ON p.`coupon_sid` = cc.`sid` WHERE  `member_sid`= ? ";

        let [getData] = await DB.query(sql, memberSid);

        // console.log(getData);
        //轉換時間格式
        getData.forEach(element => {
            const time = element.point_change_time
            const timeChanged = moment(time).tz("Asia/Taipei").format("YYYY-MM-DD HH:mm:ss");
            element.point_change_time = timeChanged;
        });
        // console.log(getData);
        // console.log("有登入");
        return res.json(getData);
    }


})








//$msid = $_SESSION['user']['sid'];

// $sql = "SELECT p.*,cc.`coupon_name`
// FROM `point_detail` p
// LEFT JOIN `coupon_content` cc
// ON p.`coupon_sid` = cc.`sid`
// WHERE 
// `member_sid`=$msid";
module.exports = router;