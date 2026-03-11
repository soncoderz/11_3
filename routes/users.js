var express = require('express');
var router = express.Router();
let userModel = require('../schemas/users');

// GET all users
router.get('/', async function (req, res, next) {
    try {
        let users = await userModel.find({ isDeleted: false }).populate({
            path: 'role',
            select: 'name description'
        });
        res.send(users);
    } catch (error) {
        res.status(500).send({ message: "Lỗi server", error: error.message });
    }
});

// GET user by id
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await userModel.findById(id).populate({
            path: 'role',
            select: 'name description'
        });
        if (!result || result.isDeleted) {
            res.status(404).send({ message: "ID NOT FOUND" });
        } else {
            res.send(result);
        }
    } catch (error) {
        res.status(404).send({ message: "ID NOT FOUND" });
    }
});

// CREATE new user
router.post('/', async function (req, res, next) {
    try {
        let newUser = new userModel({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            fullName: req.body.fullName,
            avatarUrl: req.body.avatarUrl,
            role: req.body.role,
            status: req.body.status,
            loginCount: req.body.loginCount
        });
        await newUser.save();
        res.send(newUser);
    } catch (error) {
        res.status(400).send({ message: "Lỗi tạo user", error: error.message });
    }
});

// UPDATE user
router.put('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await userModel.findByIdAndUpdate(
            id, 
            req.body, 
            { new: true }
        ).populate({
            path: 'role',
            select: 'name description'
        });
        if (!result || result.isDeleted) {
            res.status(404).send({ message: "ID NOT FOUND" });
        } else {
            res.send(result);
        }
    } catch (error) {
        res.status(404).send({ message: "Lỗi cập nhật", error: error.message });
    }
});

// DELETE user (soft delete)
router.delete('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await userModel.findById(id);
        if (!result || result.isDeleted) {
            res.status(404).send({ message: "ID NOT FOUND" });
        } else {
            result.isDeleted = true;
            await result.save();
            res.send(result);
        }
    } catch (error) {
        res.status(404).send({ message: "ID NOT FOUND" });
    }
});

// ENABLE user - chuyển status về true
router.post('/enable', async function (req, res, next) {
    try {
        let { email, username } = req.body;
        
        if (!email || !username) {
            return res.status(400).send({ message: "Email và username là bắt buộc" });
        }

        let user = await userModel.findOne({ 
            email: email, 
            username: username,
            isDeleted: false 
        });

        if (!user) {
            return res.status(404).send({ message: "Thông tin không đúng" });
        }

        user.status = true;
        await user.save();
        res.send({ message: "Đã kích hoạt user thành công", user: user });
    } catch (error) {
        res.status(500).send({ message: "Lỗi server", error: error.message });
    }
});

// DISABLE user - chuyển status về false
router.post('/disable', async function (req, res, next) {
    try {
        let { email, username } = req.body;
        
        if (!email || !username) {
            return res.status(400).send({ message: "Email và username là bắt buộc" });
        }

        let user = await userModel.findOne({ 
            email: email, 
            username: username,
            isDeleted: false 
        });

        if (!user) {
            return res.status(404).send({ message: "Thông tin không đúng" });
        }

        user.status = false;
        await user.save();
        res.send({ message: "Đã vô hiệu hóa user thành công", user: user });
    } catch (error) {
        res.status(500).send({ message: "Lỗi server", error: error.message });
    }
});

module.exports = router;
