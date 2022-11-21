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
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
        return res.redirect("/Member/Member_Login.html");
    }

    const loginSql = "SELECT `sid`, `name`, `email`, `password` FROM `member` WHERE `email` LIKE ? ";

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
    //※※※※※※※※※※※※※
    //使用session               信箱                姓名            SID
    req.session.member = {email:result.email,name:result.name,sid:result.sid};
    // req.session.member.name = result.name;

    //※※※※※※※※※※※※※
    //都沒問題回傳正確
    return res.json(1);












    // //一頁放幾筆
    // let perpage = 10;
    // //現在第幾頁  如果沒設定則給1
    // let page = Number(req.query.page) || 1;
    // //如果小於1 則回到基本頁(取消設定query)
    // if (page < 1) {
    //     return res.redirect(req.baseUrl);
    // }
    // //SQL
    // const t_sql = "SELECT COUNT(1) totalRows FROM member";
    // const [[{ totalRows }]] = await DB.query(t_sql);
    // //預設總頁數值
    // let totalPages = 0;

    // let rows = [];
    // //如果總筆數大於0才繼續動作
    // if (totalRows > 0) {
    //     //總頁數計算
    //     totalPages = Math.ceil(totalRows / perpage);
    //     //如果破表則返回最大值
    //     if (page > totalPages) {
    //         return res.redirect(`?page=${totalPages}`);
    //     }

    //     const sql = `SELECT * FROM member ORDER BY sid DESC LIMIT ${(page - 1) * perpage},${perpage}`;

    //     [rows] = await DB.query(sql);

    // }

    // res.json({ totalRows, page, totalPages, perpage, rows });
});

module.exports = router;