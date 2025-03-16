const express =require("express");


const {
    registerUser,
    loginUser,
    getUserInfo,
}=require("../controllers/authControllers");


const router=express.Router();

router.post("/register",registerUser);

router.post("/login",loginUser);

// router.post("/getUser",protect, getUserInfo);

module.exports=router;