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
    // console.log(shopSid);

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
        let outputDatas = {cart:[],coupon:[]};
        outputDatas.cart = outputData;


        const memberSid = req.session.member.sid;
        //shopSid

        const couponSql = "SELECT c.*,cc.coupon_name, cc.sale_detail, cc.use_range,cc.shop_sid FROM `coupon` c  LEFT JOIN `coupon_content` cc ON (c.coupon_sid = cc.sid) WHERE (c.`member_sid` =? ) AND (cc.shop_sid = ? OR cc.shop_sid = 101) AND(c.is_used = 0)";

        const [response] = await DB.query(couponSql,[memberSid,shopSid]);
        response.forEach((element)=>{
            const expireTime = element.expire
            if (expireTime) {
                element.expire = moment(expireTime).tz("Asia/Taipei").format("YYYY-MM-DD HH:mm:ss");
            }
            const getTime = element.get_time
            if (getTime) {
                element.get_time = moment(getTime).tz("Asia/Taipei").format("YYYY-MM-DD HH:mm:ss");
            }
            // element.expire;
            // element.get_time;
        })
        // console.log(response);
        // outputData.coupon = {};
        outputDatas.coupon = {} = response;
        // console.log(outputDatas);

        res.json(outputDatas);
    }

})
module.exports = router;