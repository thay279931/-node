const express = require("express");
const router = express.Router();

router.use((req, res, next) => {

    if (!req.body) {
        return res.json(0);
    }
    const getData = req.body;

    switch (getData.logout) {
        case 0:
            delete req.session.member;
            return res.json(1);
        case 1:
            delete req.session.store;
            return res.json(1);
        case 2:
            delete req.session.store;
            delete req.session.admin;
            return res.json(1);
        default:
            return res.json(0);
    }
});

module.exports = router;