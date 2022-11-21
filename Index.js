//※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※
//全域設定
//設定變數
require("dotenv").config();
//伺服器系統
const express = require("express");
//檔案系統
const multer = require("multer");
//時區
const moment = require("moment-timezone");
//session
const session = require("express-session");
//資料庫連線模組 1014/1130
const DB = require(__dirname + '/modules/ConnectDataBase');
//session存到資料庫
const mySqlStore = require("express-mysql-session")(session);
const sessionStore = new mySqlStore({}, DB);
// const upload = multer({dest:"/TempFiles"})
//圖片上傳模組  1012/1050
const upload = require(__dirname + '/modules/Upload_Imgs');
//搬移檔案系統
const fs = require("fs").promises;
//UUID 隨機碼
//     {解構賦值重設呼叫名}
const { v4: getv4 } = require("uuid");
const app = express();
//解譯
const bodyParser = require('body-parser');
const { log } = require("console");
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const cors = require("cors");
//設定方法 EJS
app.set('view engine', 'ejs');

const corsOptions = {
    credentials: true,
    origin: function (origin, callback) {
        console.log({origin});
        callback(null, true);
    }
};

app.use(cors(corsOptions));

//※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※

//※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※
//使用session

app.use(session({
    //未初始化時是否儲存
    saveUninitialized: false,
    //是否儲存
    resave: false,
    //加密植
    secret: "fdsfdsfsf54564SDFSA64f465AadsrfdesfesTGEFDAT",
    //session存到資料庫
    store: sessionStore,
    //cookie設定
    cookie: {
        //最長存在時間ms 數字加底線一樣有用
        maxAge: 3_600_000
        // originalMaxAge: null,
        // expires: null,
        // httpOnly: true,
        // path: "/"
    }
}))
//session  他會掛在req裡面
app.get("/sessionTest", (req, res) => {
    req.session.countTest ||= 0;
    req.session.countTest++;
    res.json(req.session);
})
//清除session
app.get("/ClearAllSession", (req, res) => {
    delete req.session;
    res.send("Session Clear")
})



//※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※


//※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※
//檔頭解析
//放在檔頭會先解析再往下傳
// app.use(urlencodedParser);
app.use(express.urlencoded({ extended: false }))
//先解析JSON格式
app.use(express.json());
//設定POST程式
const formDataParse = multer().none();
//FormData解析
app.post(multer().none(), async (req, res) => {
    next();
})

//※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※
//登入檢查程式

//管理者
const AdminLogCheck = (req, res, next) => {
    if (!req.session.admin) {
        console.log("管理者未登入");
        // res.json(0);
        return res.redirect("/");
    } else {
        next();
    }
}
const StoreLogCheck = (req, res, next) => {

    if (!req.session.store) {
        console.log("店家未登入");
        // res.json(0);
        return res.redirect("/");
    } else {
        next();
    }
}
const MemberLogCheck = (req, res, next) => {
    if (!req.session.member) {
        console.log("會員未登入");
        // res.json(0);
        return res.redirect("/");
    } else {
        next();
    }
}


//※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※


//設定首頁
app.get("/", (req, res) => {
    res.redirect("/index.html")
})

//會員登入檢查
app.get("/MemberLoginCheck", (req, res) => {
    console.log(req.session.member);
    if (!req.session.member) {
        return res.json(0);
        // return res.redirect("/Member/Member_Login.html");
    }
    else {
        return res.json(1);
    }
})

//店家登入檢查
app.get("/StoreLoginCheck", (req, res) => {
    if (!req.session.store) {
        return res.json(0);
        // return res.redirect("./Store/Store_Login.html");
    }
    else {
        return res.json(1);
    }
})

//管理者登入檢查
app.get("/StoreLoginCheck", (req, res) => {
    if (!req.session.admin) {
        return res.json(0);
        // return res.redirect("./Store/Store_Login.html");
    }
    else {
        return res.json(1);
    }
})


//登出

app.post("/Logout", require("./Api/LogoutApi"))

//※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※
//CRUD router 1014/1530
// app.use("/member", require(__dirname + "/Routes/Member"));

//※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※

//※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※
//API路由

//會員
//※※※※※
//路徑登入阻擋
//獲得優惠券
app.use("/Member/Member_CouponGet.html", MemberLogCheck);
//訂單
app.use("/Member/Member_Order.html", MemberLogCheck);
//紅利點數確認
app.use("/Member/Member_Point.html", MemberLogCheck);
//確認優惠券
app.use("/Member/Member_Coupon.html", MemberLogCheck);
//※※※※※



app.use("/Shopping/PayPage.html", (req, res, next) => {
    if (!req.session.cartShop) {
        res.redirect("/Shopping/CartChooseShop.html");
    }
    else {
        next();
    }
})
app.use("/Shopping/CartChooseShop.html", (req, res, next) => {
    if (!req.session.cart) {
        res.redirect("/Shopping/Products.html");
    }
    else {
        next();
    }
})

//※※※※※
//API
app.use('/MemberLogin', require("./Api/Admin/address-book"));
//會員登入頁檢查(動作)
app.use("/MemberLoginApi", require("./Api/Member/Member_LoginApi"));

//會員紅利點數(資料)
app.use("/MemberPointApi", require("./Api/Member/Member_PointApi"));

//會員訂單(資料)
app.use("/MemberOrderApi", require("./Api/Member/Member_OrderApi"));

//會員訂單取消(動作)
app.use("/MemberOrderCancel", require("./Api/Member/Member_OrderCancelApi"));

//會員讀取已有優惠券(資料)
app.use("/MemberCouponRenderApi", require("./Api/Member/Member_CouponRenderApi"));

//會員獲得優惠券(資料)
app.use("/MemberCouponGetRenderApi", require("./Api/Member/Member_CouponGetRenderApi"));

//會員獲得優惠券(動作)
app.use("/MemberCouponGetApi", require("./Api/Member/Member_CouponGetApi"));

//商品列表頁(資料)
app.get("/ShoppingList", async (req, res) => {
    const sqlString = "SELECT * FROM products";
    let [datas] = await DB.query(sqlString);
    res.json(datas);
})


//購物流程
//※※※※※
//購物車修改(動作)
app.post("/ShoppingProductSet", require("./Api/Shopping/Shopping_ProductSetApi"));

//店家選擇(資料)
app.post("/CartChooseShopApi", require("./Api/Shopping/Shopping_CartChooseShopApi"));

//購物車畫面(資料)
app.get("/CartPageRenderApi", require("./Api/Shopping/Shopping_CartPageRenderApi"));

//結帳畫面(資料)
app.get("/PayPageRenderApi", require("./Api/Shopping/Shopping_PayPageRenderApi"));

//結帳畫面(動作)
app.post("/PayApi", require("./Api/Shopping/Shopping_PayApi"));

//隨機叫資料
// app.get("/ShoppingRandomApi", require("./Api/Shopping/Shopping_RandomApi"));

//店家
//※※※※※
//路徑登入阻擋
//歷史訂單
app.get("/Store/Store_Order.html", StoreLogCheck);
//現在訂單
app.get("/Store/Store_ConfirmOrder.html", StoreLogCheck);

//※※※※※
//API
//店家登入頁檢查(動作)
app.use("/StoreLoginApi", require("./Api/Store/Store_LoginApi"));

//店家歷史訂單(資料)
app.get("/StoreOrderRenderApi", StoreLogCheck, require("./Api/Store/Store_OrderRenderApi"));

//店家現在訂單(資料)
app.get("/StoreConfirmOrderRenderApi", StoreLogCheck, require("./Api/Store/Store_ConfirmOrderRenderApi"));

//店家確認訂單(動作)
app.post("/StoreConfirmOrderApi", [StoreLogCheck, formDataParse], require("./Api/Store/Store_ConfirmOrderApi"));

//店家獲取訂單 測試  伺服器發送資料
app.get("/StoreGetOrderInfo", async (req, res) => {
    if (!req.session.store) {
        return;
    }
    let sid = req.session.store.sid;

    let id = 30;

    const sql = `SELECT COUNT(1) totalOrder FROM orders WHERE shop_order_status = 0 AND shop_sid = ${sid}`

    let [[{ totalOrder }]] = await DB.query(sql)
    // console.log(totalOrder);
    res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'CacheControl': 'no-cache',
        'Connection': 'keep-alive',
    });
    let totalOrderSet = totalOrder;

    setInterval(checkOrder, 5000);

    async function checkOrder() {
        let op = 0;

        let [[{totalOrder}]] = await DB.query(sql);
        // console.log({ totalOrderSet });
        // console.log({ totalOrder });
        if (totalOrderSet != totalOrder) {
            op = 1;
            totalOrderSet = totalOrder;
        }
        res.write(`id: ${id++}\n`);
        res.write(`data: ${op}\n\n`);

    }

})

//管理者
//※※※※※
//路徑登入阻擋
app.use("/Admin/Admin_Coupon.html", AdminLogCheck);

//優惠券管理(資料)
app.use("/AdminCouponRenderApi", AdminLogCheck, require("./Api/Admin/Admin_CouponRenderApi"));

//優惠券管理(動作)
app.post("/AdminCouponEditApi", AdminLogCheck, require("./Api/Admin/Admin_CouponEditApi"));




//※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※

//※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※
//檔案上傳 備用
app.post('/uploadPage', upload.single("fileset"), async (req, res) => {
    res.json(req.file);
})


//解析POST用這個 1017/1330
// app.post('/uploadPage', upload.none("fileset"), async (req, res) => {
//     res.json(req.file);
// })
//回應
// {
//     "fieldname": "fileset",
//     "originalname": "3.png",
//     "encoding": "7bit",
//     "mimetype": "image/png",
//     "destination": "/TempFiles",
//     "filename": "1dee7dd92e2bf5de21427fbfd7cfe262",
//     "path": "\\TempFiles\\1dee7dd92e2bf5de21427fbfd7cfe262",
//     "size": 39472
// }
app.post('/uploadPageMulti', upload.array("filesets"), async (req, res) => {

    res.json(req.files);

})

// 取得 queryString (GET) 直接在req.query內 備用
app.get("/test_queryString", (req, res) => {
    res.json(req.query);
})

//※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※

//※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※
//get測試

app.get("/GetSearch", require("./GetProductTest/SearchApi"));


//※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※

//※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※
//設定根目錄資料夾 通常放在404前面
app.use(express.static('Public'));

//404頁面 放最後
app.use((req, res) => {
    res.status(404).render("error");
})
//設定PORT
const port = process.env.SERVER_PORT || 3001;
//設定監聽port
app.listen(port, () => {
    console.log("server start port:", port);
})
//※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※※
