const express = require("express");
const router = express.Router();
const DB = require('../Modules/ConnectDataBase');
// const moment = require("moment-timezone");

router.use("/", async (req, res, next) => {

    //每頁幾個 有需要改一頁幾個改這邊
    const perPage = 20;

    //輸出資料
    let output = {};

    //現在要去第幾頁  只要不是數字都轉成1
    let queryPage = Number(req.query.page) || 1;
    queryPage < 1 ? queryPage = 1 : null;

    //是否有搜尋字串
    let search = req.query.search ? req.query.search.trim() : '';
    //是否有價格上限
    let priceMax = req.query.priceMax ? Number(req.query.priceMax.trim()) : 0;
    //是否有價格下限
    let priceMin = req.query.priceMin ? Number(req.query.priceMin.trim()) : 0;
    //基礎字串
    let where = ` WHERE 1 `;
    //如果搜尋字串不是空，就連上          DB.escape()  文字跳脫
    if (search) {
        where += ` AND         
            name LIKE ${DB.escape('%' + search + '%')} 
            `;
    }
    //價格範圍上限
    if (priceMax > 0) {
        where += ` AND         
            price <= ${priceMax}  
            `;
    }
    //價格範圍下限
    if (priceMin > 0) {
        if (priceMin > priceMax && priceMax > 0) {
            priceMin = priceMax
        }
        where += ` AND        
        price >= ${priceMin}  
        `;
    }

    //如果有字串:    WHERE 1 AND `name` LIKE '%search%' OR `address` LIKE '%search%' ;

    //獲得總數(output.totalRows)                                    如果有搜尋字串結果會不一樣
    const countSqlString = `SELECT COUNT(1) totalRows FROM products ${where}`;
    let [[{ totalRows }]] = await DB.query(countSqlString);

    //總筆數掛到輸出資料
    output.totalRows = totalRows;
    //每頁幾個
    output.perPage = perPage;
    //總頁數
    let totalPages = 0;
    //有資料才算頁數
    if (totalRows > 0) {
        totalPages = Math.ceil(totalRows / perPage);
    }
    //總頁數輸出
    output.totalPages = totalPages;
    //要求的頁數如果太大則選擇最後一頁
    if (queryPage > totalPages) {
        queryPage = totalPages;
    }
    if (totalPages === 0) {
        queryPage = 1;
    }
    output.page = queryPage;

    //asc 升  desc 降
    let sort = "ASC";
    req.query.sort === "down" ? sort = "DESC" : null;
    //排序對象
    let sortBy = "price";
    req.query.sortBy === "sid" ? sortBy = "sid" : null;

    //叫資料
    let sqlString = `SELECT * FROM products  ${where}  ORDER BY ${sortBy}  ${sort} LIMIT ${(queryPage - 1) * perPage}, ${perPage}`;
    let [datas] = await DB.query(sqlString);
    output.datas = datas;
    res.json(output);

});
module.exports = router;