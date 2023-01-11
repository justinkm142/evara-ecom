// const Routes = require('twilio/lib/rest/Routes');
const { user } = require("../models/user");
const { Admin } = require("../models/user");
const { Category } = require("../models/product");
const { Product } = require("../models/product");
const { Order } = require("../models/order");
const session = require("express-session");
const { Payment } = require("../models/payment");
const { Coupon } = require("../models/coupon");
const { Banner } = require("../models/banner");
const { Wallet } = require("../models/wallet");
var mongoose = require('mongoose');






let error=false;

let authorizationOTP = '';






//loding admin page

const admin_page = function (request, response) {
    try {
        if (request.session.loggedIn == true && request.session.user == "Admin") {
            response.redirect("/admin/index.html")
        } else {
            response.render("./admin/login", { loginError: error });
        }
    } catch (err) {
        console.log(err)
    }
}


// loading admin home

const admin_home = async function (request, response) {
    try {
        
        let method=request.query.method
        

       if (method == "today") {
            let todayDate = new Date()
            let todayYear = todayDate.getFullYear()
            let todayMonth = todayDate.getMonth() + 1
            let todayDay = todayDate.getDate()
            let toDayDate = "" + todayYear + "-" + todayMonth + "-" + todayDay

            let orderList = await Order.aggregate([
                {'$project': {'products': 0,'address': 0,'status': 0 }}, 
                {'$lookup': {
                        'from': 'users',
                        'localField': 'userId',
                        'foreignField': '_id',
                        'as': 'userDetails'}}, 
                {'$unwind': {'path': '$userDetails'}},
                {'$addFields': {'DateOnly': {'$dateToString': {'format': '%Y-%m-%d','date': '$createdAt'}}}},
                { '$sort' : { createdAt: -1 }},
                { '$match': { 'DateOnly': toDayDate } }
            ])

            response.render("./admin/index", { orderList: orderList,title:"Today Sale" });

       } else if (method == "date"){

        let toDayDate=request.query.date


        let orderList = await Order.aggregate([
            {'$project': {'products': 0,'address': 0,'status': 0 }}, 
                {'$lookup': {
                        'from': 'users',
                        'localField': 'userId',
                        'foreignField': '_id',
                        'as': 'userDetails'}}, 
                {'$unwind': {'path': '$userDetails'}},
                {'$addFields': {'DateOnly': {'$dateToString': {'format': '%Y-%m-%d','date': '$createdAt'}}}},
                { '$sort' : { createdAt: -1 }},
                { '$match': { 'DateOnly': toDayDate } }
        ])

        response.render("./admin/index", { orderList: orderList,title:"Sales On "+toDayDate });

       } else if (method == "month"){

        let month = request.query.month;

        
        let orderList = await Order.aggregate([
            {'$project': {'products': 0,'address': 0,'status': 0 }}, 
                {'$lookup': {
                        'from': 'users',
                        'localField': 'userId',
                        'foreignField': '_id',
                        'as': 'userDetails'}}, 
                {'$unwind': {'path': '$userDetails'}},
                {'$addFields': {'DateOnly': {'$dateToString': {'format': '%Y-%m','date': '$createdAt'}}}},
                { '$sort' : { createdAt: -1 }},
                { '$match': { 'DateOnly': month } }
        ])

        response.render("./admin/index", { orderList: orderList,title:"Sales of the Month "+month });

       } else if (method == "dateFilter"){

        let startDate = request.query.startDate;
        let endDate = request.query.endDate;

        let orderList = await Order.aggregate([
            {'$project': {'products': 0,'address': 0,'status': 0 }}, 
                {'$lookup': {
                        'from': 'users',
                        'localField': 'userId',
                        'foreignField': '_id',
                        'as': 'userDetails'}}, 
                {'$unwind': {'path': '$userDetails'}},
                {'$addFields': {'DateOnly': {'$dateToString': {'format': '%Y-%m-%d','date': '$createdAt'}}}},
                { '$sort' : { createdAt: -1 }},
                { '$match': { DateOnly: { $gte: startDate, $lte: endDate } } },
                
        ])

        response.render("./admin/index", { orderList: orderList,title:"Sales from "+startDate+" to "+endDate});

        } else {

            response.redirect("/admin/index.html/?method=today")

        }






       // response.render("./admin/index", { orderList: orderList });





        
    } catch (err) {
        console.log(err)
    }
}


//login check for admin 
const login_admin = function (request, response) {
   
    try {
    let email = request.body.email;
    let password = request.body.userPassword;

    Admin.find({}, function (err, foundUser) {
        if (err) {
            console.log(err)
        }
        else {
            var count = 0;
            var check = 0;
            foundUser.forEach(function (item) {
                count += 1;
                if (email == item.email && password == item.password) {
                    request.session.loggedIn = true;
                    request.session.user = "Admin";
                    console.log("login suceessfull")
                    error = false;
                    response.redirect("/admin/index.html/?method=today");
                    check = 1;
                }
                else if (count == foundUser.length && check == 0) {
                    console.log("wrong username and password")
                    error = true;
                    response.render("./admin/login", { loginError: error });
                }
            })
        }
    })
} catch (err) {
    console.log(err)
}
}


//list all the users  
const user_list = function (request, response) {
   
    try {
    user.find({}, function (err, foundUser) {
        if (err) {
            console.log(err)
        }
        else {
            response.render("./admin/page-account-login", { userList: foundUser });
        }
    })
} catch (err) {
    console.log(err)
}
}


//block user 

const block_user = function (request, response) {
   
    try {
    let userid = request.params.userid;
    user.findByIdAndUpdate(userid, { $set: { userBlocked: true } }, function (err) {
        if (err) {
            console.log(err)
        } else {
            console.log("user Blocked Sucessfully ")
            response.redirect("/admin/page-account-login.html")
        }
    })
} catch (err) {
    console.log(err)
}
}


//un_block user 


const unblock_user = function (request, response) {
   
    try {
    let userid = request.params.userid;
    user.findByIdAndUpdate(userid, { $set: { userBlocked: false } }, function (err) {
        if (err) {
            console.log(err)
        } else {
            console.log("user Un-Blocked Sucessfully ")
            response.redirect("/admin/page-account-login.html")
        }
    })
} catch (err) {
    console.log(err)
}
}



// add new Category 

const add_category = async function (request, response) {

    try {
        let name = request.body.name.toUpperCase();
        let discription = request.body.discription.toUpperCase();


        let catFound = await Category.findOne({ name: name }).exec()
           
        console.log(catFound);

        if (!catFound) {
            const item = new Category({
                name: name,
                discription: discription,
                sell: 0
            });
            item.save().catch((err) => {
                console.log(err);
            }).then((result) => {
                console.log(" category added sucessfully")
            })
            response.redirect("/admin/page-categories.html");
        
        } else {
            await Category.find({}, function (err, foundList) {
                if (err) {
                    console.log(err)
                }
                else {
                    console.log(" category already included")
                    response.render("./admin/page-categories", { categoryList: foundList, error: true });
                }
            })
        }
    } catch (err) {
        console.log(err)
    }
}





//list all category

const category_list = function (request, response) {
   
    try {
    Category.find({}, function (err, foundList) {
        if (err) {
            console.log(err)
        }
        else {
            response.render("./admin/page-categories", { categoryList: foundList, error:false });
        }
    })
} catch (err) {
    console.log(err)
}
}


//category update view 

const viewUpdate_category = function (request, response) {
    
    try {
    
    let updateId = request.params.updateId;
    Category.findById(updateId, function (err, foundList) {
        if (err) {
            console.log(err)
        }
        else {
            response.render("./admin/page-categoriesUpdate", { data: foundList});
        }
    });
} catch (err) {
    console.log(err)
}
}



//category update post   

const update_category = function (request, response) {
   
    try {
    let updateId = request.params.updateId;
    Category.findByIdAndUpdate(updateId, { $set: { name: request.body.name.toUpperCase(), discription: request.body.discription.toUpperCase() } }, function (err) {
        if (err) {
            console.log(err)
        } else {
            console.log("category updated Sucessfully ")
            response.redirect("/admin/page-categories.html")
        }
    })
} catch (err) {
    console.log(err)
}
}


//category delete

const delete_category = function (request, response) {
    
    try {
    let deleteId = request.params.deleteId;

    Category.findByIdAndDelete(deleteId, function (err) {
        if (err) {
            console.log(err)
        } else {
            console.log("category deleted Sucessfully ")
            response.redirect("/admin/page-categories.html")
        }
    })
} catch (err) {
    console.log(err)
}
}


//----------------------------------Add product with multer---------------

const multer = require('multer');
const coupon = require("../models/coupon");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + file.originalname
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})
const upload = multer({ storage: storage })

const add_image = upload.array('image', 12)

const add_product = function (request, response) {
    try {
    let name = request.body.name;
    let shortDescription = request.body.shortDescription;
    let longDescription = request.body.longDescription;
    let brand = request.body.brand;
    let MRP = request.body.MRP
    let sellingPrice = request.body.sellingPrice
    let category = request.body.category
    let subCategory = request.body.subCategory
    let image = [];
    for (let i = 0; i < request.files.length; i++) {
        image.push(request.files[i].filename)
    }
    let stock = request.body.stock
    let status = request.body.status

    const item = new Product({
        name: name,
        shortDescription: shortDescription,
        longDescription: longDescription,
        brand: brand,
        MRP: MRP,
        sellingPrice: sellingPrice,
        category: category,
        subCategory: subCategory,
        image: image,
        stock: stock,
        status: status
    });
    item.save().catch((err) => {
        console.log(err);
    }).then((result) => {
        console.log(" product added sucessfully")
        response.redirect("/admin/page-products-list.html");
    })
} catch (err) {
    console.log(err)
}

}

//update product details 
const update_productData = async function (request, response) {
    try {

        let productData= await Product.findById(request.params.updateId).exec();
        let image = productData.image;
        for (let i = 0; i < request.files.length; i++) {
            image.push(request.files[i].filename)
        }
        let name = request.body.name;
        let shortDescription = request.body.shortDescription;
        let longDescription = request.body.longDescription;
        let brand = request.body.brand;
        let MRP = request.body.MRP
        let sellingPrice = request.body.sellingPrice
        let category = request.body.category
        let subCategory = request.body.subCategory
        let stock = request.body.stock
        let status = request.body.status


        await Product.findByIdAndUpdate(request.params.updateId, { $set: {
            name:name,
            shortDescription:shortDescription,
            longDescription:longDescription,
            brand:brand,
            MRP:MRP,
            sellingPrice:sellingPrice,
            category:category,
            subCategory:subCategory,
            stock:stock,
            status:status,
            image:image
        }})


response.redirect("/admin/page-products-list.html")



    } catch (err) {
        console.log(err)
    }

}





//product page view 

const view_product = async function (request, response) {
    try {

        const pageNum = request.query.page;
        
        const perPage = 10;

   let result = await  Product?.find({})
    .sort({createdAt: -1})
    .skip((pageNum-1)*perPage)
    .limit(perPage).exec()

   let  pageLength= await Product?.find({}).count().exec()
    console.log(pageLength)
    response.render("./admin/page-products-list", { product: result,pageLength:pageLength });


        
    } catch (err) {
        console.log(err)
    }
}

//new product add page

const new_product = function (request, response) {
    try {
    Category.find({})
        .then((result) => {
            response.render("./admin/page-form-product-2", { result: result })
        })
        .catch((err) => {
            console.log(err);
        })
    } catch (err) {
        console.log(err)
    }

}

//product delete

const delete_product = function (request, response) {
    try {
        let deleteId = request.params.productID;

        Product.findByIdAndDelete(deleteId, function (err) {
            if (err) {
                console.log(err)
            } else {
                console.log("category deleted Sucessfully ")
                response.redirect("/admin/page-products-list.html")
            }
        })
    } catch (err) {
        console.log(err)
    }
}

//Product update page load 

const update_product = async function (request, response) {
    try {
        let updateId = request.params.updateId;
        let result = await Category.find({}).exec()

        let productData = await Product.findById(updateId).exec()

        response.render("./admin/page-update-product", {
            result: result, productData: productData
        })
    } catch (err) {
        console.log(err)
    }
}

//Product image  delete 

const delete_photo = async function (request,response){
    try{

        let productData= await Product.findById(request.body.productId).exec();
        let array = productData.image;
        array.splice(Number(request.body.photoIndex),1)

        await Product.findByIdAndUpdate(request.body.productId,{$set:{ image: array }})
        response.json({status:true})

    } catch (err){
        console.log(err)
    }
}






//--------------------------------order page-------------------

//order list page
const order_page = async function (request, response) {
    try {
        const pageNum = request.query.page;
        
        const perPage = 10;
        let orderList = await Order.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userInfo"
                }
            },
            {$unwind: "$userInfo"},
            { $sort : { createdAt: -1 }},
            { $skip :(pageNum-1)*perPage},
            { $limit : perPage }

           ])
        let pageLength=  await Order.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userInfo"
                }
            },
            {$unwind: "$userInfo"}
           ])
           
           pageLength=pageLength.length
           console.log(pageLength)
          
            

        response.render("./admin/page-orders-1",{orderList:orderList,pageLength:pageLength});

    } catch (err) {
        console.log(err)
    }

}



//order details page
const order_details = async function (request, response) {
    try {

        let orderId = mongoose.Types.ObjectId(request.params.orderId);

        let orderList = await Order.aggregate([
            {$match:{_id:orderId}},
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userInfo"
                }
            },
            {$unwind: "$userInfo"}
           ])


        let productList=await Order.aggregate([
           
            {$match:{_id:orderId}},
            {$project:{products:1}},
            {$unwind:"$products"},
            { $addFields: { newProductId: { $toObjectId: "$products.productId" } } },
            {
                $lookup: {
                    from: "products",
                    localField: "newProductId",
                    foreignField: "_id",
                    as: "productInfo"
                }
            },
            {$unwind:"$productInfo"},

        ])


console.log(orderList[0])

        response.render("./admin/page-orders-detail",{orderList:orderList[0],productList:productList});


    } catch (err) {
        console.log(err)
    }

}




// coupons add page 

const coupon_list = async function (request, response) {
    try {

       let couponList= await Coupon.find({}).exec()
        
        response.render("./admin/page-coupon",{categoryList: couponList, error:false});

    } catch (err) {
        console.log(err)
    }

}      


const add_coupon = async function (request,response ){
    try{
        console.log(request.body.startDate)
            const item = new Coupon({
                coupon:request.body.coupon,
                discount:request.body.discount,
                startDate:request.body.startDate,
                endDate:request.body.endDate,
                limit1:request.body.limit1,
                limit:request.body.limit
        })
        item.save().catch((err)=>{
            console.log(err)
        }).then((result)=>{
            response.redirect("/admin/page-coupons-list.html");
        })

    } catch (err){
        console.log(err)
    }
}




//order status details 

const order_update = async function (request, response) {
    try {

        let productId=mongoose.Types.ObjectId(request.body.productId);
        let selection=request.body.proSelection
        let newValue=request.body.newValue
        let orderId=mongoose.Types.ObjectId(request.body.orderId);

        let array= await Order.aggregate([
            {$match:{_id:orderId}}
        ])

        console.log("************************************************"+selection)
        
        let oldArray=array[0].products;
        let oldProData=array[0].products[selection];
        oldProData.status=newValue;
        
        

        console.log(newValue)
        

        oldArray.splice(selection,1,oldProData);
        await Order.findByIdAndUpdate(orderId, { $set: {products:oldArray}})

        if(newValue=="Cancel" && array[0].paymentStatus=="success"){
            let existingBalace= await Wallet.findOne({userId:request.session.userId})
            let productPrice= await Product.findById(productId);
            let refund =array[0].products[selection].quantity*productPrice.sellingPrice

            await Wallet.updateOne({userId:request.session.userId},{$set:{balance:refund+existingBalace.balance}})
        }
        if(newValue=="Refund"){
            let existingBalace= await Wallet.findOne({userId:array[0].userId})
            let productPrice= await Product.findById(productId);
            let refund =array[0].products[selection].quantity*productPrice.sellingPrice

            await Wallet.updateOne({userId:array[0].userId},{$set:{balance:refund+existingBalace.balance}})
        }

        response.json({ name: "justin" })
        
    } catch (err) {
        console.log(err)
    }

}



// banner page 

const banner_page = async function (request, response) {
    try {

        let banner= await Banner.find({}).exec();
        response.render("./admin/page-banner",{banner:banner});

    } catch (err) {
        console.log(err)
    }

} 

// add banner 
const add_banner = async function (request,response ){
    try{

            const item = new Banner({
                h1:request.body.h1text,
                h2:request.body.h2text,
                h3:request.body.h3text,
                offer:request.body.offer,
                startDate:request.body.startDate,
                endDate:request.body.endDate,
                imageName:request.files[0].filename,
        })
        item.save().catch((err)=>{
            console.log(err)
        }).then((result)=>{
            response.redirect("/admin/page-banner.html")
        })

    } catch (err){
        console.log(err)
    }
}















module.exports = {
    login_admin,
    user_list,
    block_user,
    unblock_user,
    add_category,
    category_list,
    viewUpdate_category,
    update_category,
    delete_category,
    add_product,
    add_image,
    view_product,
    new_product,
    delete_product,
    update_product,
    order_page,
    order_details,
    order_update,
    admin_page,
    admin_home,
    delete_photo,
    update_productData,
    coupon_list,
    add_coupon,
    banner_page,
    add_banner
    
}