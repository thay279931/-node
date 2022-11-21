const express = require("express");
const router = express.Router();
const DB = require('../../Modules/ConnectDataBase');
const moment = require("moment-timezone");
// router.use((req, res, next) => {
//     let postdata = req.body;
//     if (!postdata.state) {
//         res.json(0);
//     }
//     else {
//         next();
//     }
// });

router.use('/', async (req, res) => {

    let postdata = req.body;
    //商店SID
    let shopSid = Number(postdata.shop_sid);
    //訂單頁用設定店家SID
    if (!postdata.shop_sid) {
        shopSid = req.session.cartShop;
    }
    const productSid = Number(postdata.sid);
    // console.log(postdata);
    //增加
    if (postdata.state === 0) {
        //如果沒設定過則設定購物車物件
        if (!req.session.cart) {
            req.session.cart = {}
        }
        if (!req.session.cart[shopSid]) {
            req.session.cart[shopSid] = {};
        }
        if (!req.session.cart[shopSid].list) {
            req.session.cart[shopSid].list = {};
        }

        //總數有沒有設定過 沒設定過設定1 有設定過則+1
        if (!req.session.cart[shopSid].list[productSid]) {
            req.session.cart[shopSid].list[productSid] = 1;
            //沒設定過需要另外設定 shopTotal
            if (!req.session.cart[shopSid].shopTotal) {
                req.session.cart[shopSid].shopTotal = 1;
            } else {
                req.session.cart[shopSid].shopTotal++;
            }
        }
        else {
            req.session.cart[shopSid].list[productSid]++;
            req.session.cart[shopSid].shopTotal++;
        }
        //總數重新計算
        let cartTotal = 0;
        for (element in req.session.cart) {
            if (element) {
                cartTotal += req.session.cart[element].shopTotal;
            }
        }
        req.session.cartTotal = cartTotal;
        // console.log({cartTotal});

        res.json({"cartTotal": cartTotal});
    }
    //減少
    else if (postdata.state === 1) {
        //shopSid productSid
        let cartTotal = 0;
        //沒設定過則結束  需逐層判斷
        if (!req.session.cartTotal || !req.session.cart[shopSid] || !req.session.cart[shopSid].list || !req.session.cart[shopSid].list[productSid]) {
            cartTotal = req.session.cartTotal || 0;
            return res.json({ "text": "無商品", "cartStatus": 0 ,"cartTotal": cartTotal});
        }
        //有設定過
        if (req.session.cart[shopSid].list[productSid] > 1) {
            req.session.cart[shopSid].list[productSid]--;
        }
        else if (req.session.cart[shopSid].list[productSid] === 1) {
            delete req.session.cart[shopSid].list[productSid];
        }
        //商品總數減1
        req.session.cart[shopSid].shopTotal--;
        //如果這個商店商品總數為零則清空這台購物車
        if (req.session.cart[shopSid].shopTotal === 0) {
            delete req.session.cart[shopSid];
        }

        //總數重新計算

        for (element in req.session.cart) {
            if (req.session.cart[element].shopTotal) {
                cartTotal += req.session.cart[element].shopTotal;
            }
        }
        req.session.cartTotal = cartTotal;
        //如果總數為零則清空全部購物車
        if (cartTotal === 0) {
            delete req.session.cartTotal;
            delete req.session.cart;
        }
        // console.log({cartTotal});
        const output = { "text": "有商品", "cartStatus": 1, "cartTotal": cartTotal }
        res.json(output);
    }
    //全部刪除
    else if (postdata.state === 2) {

        // productSid

        delete req.session.cart[shopSid].list[productSid];


        //購物車總數
        let shopTotal = 0;
        for (element in req.session.cart[shopSid].list) {
            if (req.session.cart[shopSid].list[element]) {
                shopTotal += req.session.cart[shopSid].list[element];
            }
        }
        req.session.cart[shopSid].shopTotal = shopTotal;

        if (shopTotal === 0) {
            delete req.session.cart[shopSid];
            delete req.session.cartShop;
        }

        //購物車總數
        let cartTotal = 0;
        for (element in req.session.cart) {
            if (req.session.cart[element].shopTotal) {
                cartTotal += req.session.cart[element].shopTotal;
            }
        }
        req.session.cartTotal = cartTotal;
        res.json(1)
    }
    //清空購物車
    else if (postdata.state === 3) {
        delete req.session.cart[shopSid];
        delete req.session.cartShop;
        res.json(1);
    }

})
module.exports = router;