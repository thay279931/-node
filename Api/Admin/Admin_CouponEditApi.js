const express = require("express");
const router = express.Router();
const DB = require('../../Modules/ConnectDataBase');
const moment = require("moment-timezone");
router.use((req, res, next) => {
    if(!req.session.admin){
        console.log("error");
        res.json(0);
        return;
    }
    next();
});

router.use('/', async (req, res) => {
    // console.log("in");
    let postdata = req.body;
    
    if (!postdata.needPoint || postdata.needPoint < 0) {
        postdata.needPoint = 0;
    }
    if (!postdata.limitCost || postdata.limitCost < 0) {
        postdata.limitCost = 0;
    }
    if (!postdata.cutamount || postdata.cutamount < 10) {
        postdata.cutamount = 10;
    }
    let getLimit = null;
    if (postdata.getLimit) {
        getLimit = postdata.getLimit + ' 23:59:59';
    }
    let useLimit = null;
    if (postdata.useLimit) {
        useLimit = postdata.useLimit + ' 23:59:59';
    }

    //沒登入什麼都不能做
    if (!req.session.admin) {
        return res.json(0);
    }
    //postdata.state  {0:修改,1:刪除,2:新增}
    //修改
    else if (postdata.state === 0) {

        const sql = "UPDATE `coupon_content` SET `coupon_name` = ?, `sale_detail` = ?, `use_range` = ?, `need_point` = ?, `get_limit_time` = ?, `expire` = ?, `coupon_available` = ?, `coupon_complete` = ? WHERE `sid` = ?";

        let [getData] = await DB.query(sql, [postdata.Cname, postdata.cutamount, postdata.limitCost, postdata.needPoint, getLimit, useLimit, postdata.couponAvail, postdata.couponComp, postdata.sid]);

        // console.log(getData);
        return res.json(getData.affectedRows);
    }
    //刪除
    else if (postdata.state === 1) {

        const deleteSid = postdata.sid;

        const deleteSql = `DELETE FROM coupon_content WHERE sid = ${deleteSid} `;

        let [getData] = await DB.query(deleteSql);

        return res.json(getData.affectedRows);
    }
    //新增
    else if (postdata.state === 2) {

        const insertSql = "INSERT INTO `coupon_content`(`coupon_name`,`shop_sid`,`sale_detail`,`use_range`,`need_point`,`get_limit_time`,`expire`) VALUES(?,?,?,?,?,?,?)";

        const [getData] = await DB.query(insertSql,[postdata.coupon_name,postdata.newCouponShopSid,postdata.cutamount,postdata.limitCost,postdata.needPoint,getLimit,useLimit]);

        return res.json(getData.affectedRows);

    }
    //一併刪除
    else if (postdata.state === 3) {

        const deleteList = postdata.deleteList;

        const deleteSql = `DELETE FROM coupon_content WHERE sid IN (${deleteList}) `;

        let [getData] = await DB.query(deleteSql);

        return res.json(getData.affectedRows);
    }
})
module.exports = router;