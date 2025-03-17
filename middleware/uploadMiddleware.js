const multer=require("multer");

// Configration Storage
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads/')
    },
    filename:(req,file,cb)=>{
        cb(null,`${Date.now()}-${file.originalname}`)
    },
});

// File filter
const fileFilter=(req,file,cb)=>{
    const allowedTypes=['image/jpeg','image/png','image/jpg'];
    if(allowedTypes.includes(file.mimetype)){
        cb(null,true);
    }else{
        cb(new Error('Only .jpeg, .jpg, .png format are allowed'),false);

    }
};

const upload=multer({storage,fileFilter});


module.exports=upload;