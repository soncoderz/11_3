var express = require('express');
var router = express.Router();
let roleModel = require('../schemas/roles');
let userModel = require('../schemas/users');

// GET all roles
router.get('/', async function (req, res, next) {
    try {
        let roles = await roleModel.find({ isDeleted: false });
        res.send(roles);
    } catch (error) {
        res.status(500).send({ message: "Lỗi server", error: error.message });
    }
});

// GET role by id
router.get('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await roleModel.findById(id);
        if (!result || result.isDeleted) {
            res.status(404).send({ message: "ID NOT FOUND" });
        } else {
            res.send(result);
        }
    } catch (error) {
        res.status(404).send({ message: "ID NOT FOUND" });
    }
});

// GET all users by role id
router.get('/:id/users', async function (req, res, next) {
    try {
        let roleId = req.params.id;
        
        // Kiểm tra role có tồn tại không
        let role = await roleModel.findById(roleId);
        if (!role || role.isDeleted) {
            return res.status(404).send({ message: "Role không tồn tại" });
        }

        // Lấy tất cả users có role này
        let users = await userModel.find({ 
            role: roleId, 
            isDeleted: false 
        }).populate({
            path: 'role',
            select: 'name description'
        });
        
        res.send(users);
    } catch (error) {
        res.status(500).send({ message: "Lỗi server", error: error.message });
    }
});

// CREATE new role
router.post('/', async function (req, res, next) {
    try {
        let newRole = new roleModel({
            name: req.body.name,
            description: req.body.description
        });
        await newRole.save();
        res.send(newRole);
    } catch (error) {
        res.status(400).send({ message: "Lỗi tạo role", error: error.message });
    }
});

// UPDATE role
router.put('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await roleModel.findByIdAndUpdate(
            id, 
            req.body, 
            { new: true }
        );
        if (!result || result.isDeleted) {
            res.status(404).send({ message: "ID NOT FOUND" });
        } else {
            res.send(result);
        }
    } catch (error) {
        res.status(404).send({ message: "Lỗi cập nhật", error: error.message });
    }
});

// DELETE role (soft delete)
router.delete('/:id', async function (req, res, next) {
    try {
        let id = req.params.id;
        let result = await roleModel.findById(id);
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

module.exports = router;
