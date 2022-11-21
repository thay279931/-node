const express = require('express');
const session = require('express-session');
const router = express.Router();
const db = require('../../Modules/ConnectDataBase');
const upload = require('../../Modules/Upload_imgs');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const _ = require('lodash');
const { v4: uuidv4 } = require('uuid');
const app = express();
const cors = require('cors');
const multer = require("multer");
const fs = require("fs").promises;
const { body, validationResult } = require("express-validator");





// enable files upload
// 啟動檔案上傳
app.use(fileUpload({
    createParentPath: true
}));

// 加入其它的middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

//讓uploads目錄公開
// https://expressjs.com/zh-tw/starter/static-files.html
//app.use(express.static('uploads'));
// 如果想要改網址路徑用下面的
// 您可以透過 /static 路徑字首，來載入 uploads 目錄中的檔案。
app.use('/uploads', express.static('uploads'));

async function getListData(req, res) {
    const perPage = 20;
    let page = +req.query.page || 1;
    if (page < 1) {
        return res.redirect(req.baseUrl); // api 時不應該轉向
    }

    let search = req.query.search ? req.query.search.trim() : '';
    let where = ` WHERE 1 `;
    if (search) {
        where += ` AND 
        (
            \`name\` LIKE ${db.escape('%' + search + '%')}
            OR
            \`email\` LIKE ${db.escape('%' + search + '%')}
        ) `;
    }

    const t_sql = `SELECT COUNT(1) totalRows FROM member ${where}`;
    const [[{ totalRows }]] = await db.query(t_sql);

    let totalPages = 0;
    let rows = [];
    if (totalRows > 0) {
        totalPages = Math.ceil(totalRows / perPage);
        if (page > totalPages) {
            return res.redirect(`?page=${totalPages}`);
        }
        const sql = `SELECT * FROM member ${where} ORDER BY sid DESC LIMIT ${(page - 1) * perPage}, ${perPage} `;
        [rows] = await db.query(sql);
    }
    return { totalRows, totalPages, perPage, page, rows, search, query: req.query };
}
// CRUD

// 新增資料
router.get('/add', async (req, res) => {
    res.locals.title = '新增資料 | ' + res.locals.title;
    res.render('address-book/add')
});

const authController = (req, res) => {
    // const { email, password ,name} = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

}
// router.post('/add',(req,res,next)=>{

//     console.log(req.body);
//     next()
// })

router.post('/add',
    upload.single('avatar')
    , body('email').
        isEmail()
        .withMessage("email格式錯誤"), // 檢查 req.body.email 是否為 email 格式
    body('password')
        .trim()
        .isLength({ min: 9 })
        .withMessage("密碼格式錯誤"),
    body('phone')
        .trim()
        .isLength(10)
        .withMessage("手機格式錯誤"),
    body("doublepassword")
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("密碼不吻合"); // 兩次輸入的密碼不相同
            }
            return true;
        }),
    (req, res, next) => {
        console.log(req.body);
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next()
    }
    // 檢查 req.body.password 去除空白後長度是否為 8 (含)個字元以上
    //   body("name")
    //     .trim()
    //     .isLength({ min: 1 })
    //     .withMessage("USERNAME_INVALID"), // 帳號必填, 且至少 6 個字元以上
    ,
    // upload.single('avatar'),
    async (req, res) => {
        console.log(req.body);
        const extMap = {
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'image/gif': '.gif',
        };

        const output = {
            code: 0,
            error: {},
            postData: req.body, // 除錯用
        };
        try {
            if (!req.file) {

                const sql = "INSERT INTO `member`(`email`, `password`,`name`,`phone`,`image`) VALUES (?,?,?,?,?)";
                const image = null;
                const [result] = await db.query(sql, [
                    req.body.email,
                    req.body.password,
                    req.body.name,
                    req.body.phone,
                    { image },]
                );
                res.send({
                    code: 0,
                    error: {},
                    postData: req.body, // 除錯用
                    status: true,
                    message: 'No file uploaded'
                });
                // console.log([result]);
            } else {
                let avatar = req.file;
                console.log('try');
                /*
                        //使用輸入框的名稱來獲取上傳檔案 (例如 "avatar")
                        const ext = extMap[avatar.mimetype];
                        avatar.name=uuidv4()+ext
                      //   avatar.name=uuidv4()
                        //使用 mv() 方法來移動上傳檔案到要放置的目錄裡 (例如 "uploads")
                        avatar.mv('./uploads/' + avatar.name);
                */


                const sql = "INSERT INTO `member`(`email`, `password`,`name`,`phone`,`image`) VALUES (?,?,?,?,?)";
                const image = avatar.filename;
                console.log(image);
                const [result] = await db.query(sql, [
                    req.body.email,
                    req.body.password,
                    req.body.name,
                    req.body.phone,
                    req.file.filename,
                ]);
                console.log([result]);


                //送出回應
                res.json({
                    code: 0,
                    error: {},
                    message: {},
                    postData: req.body, // 除錯用
                    status: true,
                    message: 'File is uploaded',
                    data: {
                        name: avatar.filename,
                        mimetype: avatar.mimetype,
                        size: avatar.size
                    },
                    file: req.file
                });
                // console.log(req.files);
                // console.log(req.files.avatar.name);

                //    if(result.affectedRows) output.success = true;
                //    res.json(output);

            }
        } catch (err) {
            res.status(500).json(err);
        }

        // TODO: 檢查欄位的格式, 可以用 joi
        // console.log(req.body.name);
        // const sql = "INSERT INTO `member`(`email`, `password`) VALUES (?,?)";
        // const [result] = await db.query(sql, [
        //     req.body.email,
        //     req.body.password,
        // ]);
        // console.log(req.body);

        // if(result.affectedRows) output.success = true;
        // res.json(output);

    });

// 修改資料
router.get('/edit', async (req, res) => {
    const sql = " SELECT * FROM member WHERE sid=?";
    const [rows] = await db.query(sql, [req.query.sid]);
    res.json(rows);
});
router.put('/edit/:sid', upload.single('avatar'),
    body('password')
        .trim()
        .isLength({ min: 9 })
        .withMessage("密碼格式錯誤"),
    body('phone')
        .trim()
        .isLength(10)
        .withMessage("手機格式錯誤"),
    body("doublepassword")
        .trim()
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error("密碼不吻合"); // 兩次輸入的密碼不相同
            }
            return true;
        }),
    (req, res, next) => {
        console.log(req.body);
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next()
    }, async (req, res) => {
        console.log(req.params.sid);
        const extMap = {
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'image/gif': '.gif',
        };
        const output = {
            success: false,
            code: 0,
            error: {},
            postData: req.body, // 除錯用
        };

        // TODO: 檢查欄位的格式, 可以用 joi
        try {
            if (!req.file) {

                const sql = "UPDATE member SET name=?,password=?,phone=?,image=? WHERE sid=?";
                const image = null;
                const [result] = await db.query(sql, [
                    req.body.name,
                    req.body.password,
                    req.body.phone,
                    { image },
                    req.params.sid
                ]);
                res.send({
                    code: 200,
                    error: {},
                    postData: req.body, // 除錯用
                    status: true,
                    message: 'No file uploaded'
                });
                // console.log(result);
                // if(result.affectedRows) output.success = true;
                // if(result.changedRows) output.success = true;
                // res.json(output);
            } else {
                const avatar = req.file
                console.log("111111");
                console.log(req.file);
                console.log(req.file.filename);
                const sql = "UPDATE member SET name=?,password=?,phone=?,image=? WHERE sid=?";
                const [result] = await db.query(sql, [
                    req.body.name,
                    req.body.password,
                    req.body.phone,
                    req.file.filename,
                    req.params.sid
                ]);
                res.json({
                    code: 200,
                    error: {},
                    message: {},
                    postData: req.body, // 除錯用
                    status: true,
                    message: 'File is uploaded',
                    data: {
                        name: avatar.filename,
                        mimetype: avatar.mimetype,
                        size: avatar.size
                    },
                    file: req.file
                });
                // console.log(result);
            }
        } catch (err) {

            res.status(500).json(err);
        }

    });

router.delete('/del/:sid', async (req, res) => {
    // consele.log(req.body)
    const sql = " DELETE FROM favorite_shop WHERE member_sid=? && shop_sid=?";
    const [result] = await db.query(sql,[req.params.sid&&req.body.shop_sid]);
    res.json({ success: !!result.affectedRows, result });
});

//
router.get('/item/:id', async (req, res) => {
    // 讀取單筆資料
});

router.get(['/', '/list'], async (req, res) => {
    const data = await getListData(req, res);

    res.render('address-book/list', data);
});

router.get(['/api', '/api/list'], async (req, res) => {
    res.json(await getListData(req, res));
});

router.get('/api2/:sid', async (req, res) => {
    // const {sid} = req.params;g
    console.log(req.params.sid);
    const sql = "SELECT * FROM member WHERE sid=?";
    const [result] = await db.query(sql, [
        req.params.sid,
    ]);
    console.log(result);
    res.json(result);
});


router.get('/api3/:sid', async (req, res) => {
    // const {sid} = req.params;g
    console.log(req.params.sid);
    const sql = "SELECT favorite_shop.*, shop.name,shop.address,shop.phone,shop.src FROM favorite_shop JOIN shop ON favorite_shop.shop_sid = shop.sid WHERE member_sid=?";
    const [result] = await db.query(sql, [
        req.params.sid,
    ]);
    console.log(result);
    res.json(result);
});

router.get('/api4', async (req, res) => {

    const sql = "SELECT * FROM shop";
    const [result] = await db.query(sql);
    console.log(result);
    res.json(result);
});

router.get('/api5/:sid', async (req, res) => {

    const sql = "SELECT c.*, cc.`coupon_name`, cc.`use_range`, cc.`sale_detail`, cc.`shop_sid`, s.name FROM `coupon` c LEFT JOIN  `coupon_content` cc ON  c.`coupon_sid` = cc.`sid` LEFT JOIN `shop` s ON s.`sid` = cc.`shop_sid` WHERE c.`member_sid` = ?";
    const [result] = await db.query(sql,[req.params.sid]);
    console.log(result);
    res.json(result);
});

router.post('/addshop/:sid', upload.none(), async (req, res) => {
    // console.log(req.body);
    // const output = {
    //     code: 0,
    //     error: {},
    //     postData: req.body, // 除錯用
    // };

    const sql = "INSERT INTO `favorite_shop`(`member_sid`, `shop_sid`) VALUES (?,?)";
    const [result] = await db.query(sql,[req.params.sid,req.body.shop_sid]);
    res.json(result);

});



module.exports = router;