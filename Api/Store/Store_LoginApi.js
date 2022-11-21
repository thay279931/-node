const express = require("express");
const router = express.Router();
const DB = require('../../Modules/ConnectDataBase');


router.use((req, res, next) => {
    next();
});

// CRUD
router.post('/', async (req, res) => {

    let errorStatus={
        "errorType":"帳號或密碼錯誤"
    };

    // console.log(req.body);
    const email = req.body.email.trim();
    const password = req.body.password.trim();

    if (!email || !password) {
        return res.json(0);
    }

    const loginSql = "SELECT `sid`, `name`, `email`, `password` FROM `shop` WHERE `email` = ? ";

    let [[result]] = await DB.query(loginSql, [email]);
    // console.log(result);
    //如果沒有結果，代表沒有這個帳號，並回傳結果
    if (!result){
        return res.json(errorStatus);
    }
    //檢查密碼
    let passStat = false;
    result.password  === password ? passStat = true : null;
    //如果密碼不一樣
    if (!passStat) {
        return res.json(errorStatus);
    }

    if(result.sid===101){
        req.session.admin = {email:result.email,name:result.name,sid:result.sid};
    }
    //※※※※※※※※※※※※※
    //使用session               信箱                姓名            SID
    req.session.store = {email:result.email,name:result.name,sid:result.sid};
    // req.session.member.name = result.name;

    //※※※※※※※※※※※※※
    //都沒問題回傳正確
    return res.json(1);

});

module.exports = router;