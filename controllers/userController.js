//const Routes = require('twilio/lib/rest/Routes');
const twilio = require('twilio');

const { user } = require("../models/user");
const { Admin } = require("../models/user");
const { Category } = require("../models/product");
const { Product } = require("../models/product");
const { Cart } = require("../models/cart");
const { Order } = require("../models/order");
const { Payment } = require("../models/payment");
const { WishList } = require("../models/wishList");
const { Coupon } = require("../models/coupon");
const { Banner } = require("../models/banner");
const { Wallet } = require("../models/wallet");
const session = require("express-session")
var mongoose = require('mongoose');
const paypal = require('paypal-rest-sdk');
const CC = require('currency-converter-lt');
const product = require("../models/product");



let phoneError = false;
let error = false;
let otpError = false;
let blocked = false;


//Home page redirect 
const home_page=function (request,response){
    try{
        response.redirect ("/index.html");


    }catch(err){
        console.log(err)

    }
}


//Home page 
const home_user = async function (request, response) {
    try {
        if (!request.session.userId) {
            request.session.userId = Date.now();
            request.session.cartNo=0;
            request.session.wishNo=0;
        }
        let productData = await Product.find({}).sort({createdAt:-1}).limit(10).exec();
        let productMen = await Product.find({category:"MEN"}).limit(8).exec();
        let productWoman = await Product.find({category:"WOMAN"}).limit(8).exec();
        let productKids = await Product.find({category:"KIDS"}).limit(8).exec();
        let banner = await Banner.find({}).exec();
            
        response.render("./user/index", {
            loginStatus: request.session.loggedIn,
            userName: request.session.user,
            productData: productData,
            productMen:productMen,
            productWoman:productWoman,
            productKids:productKids,
            session:request.session,
            banner:banner
        });
    } catch (err) {
        console.log(err)
    }
}                          


// single product view 
const product_view = async function (request, response) {
    try {
        let productId = request.params.productId
        let productData = await Product.findById(productId).exec();

        console.log(productData)
        response.render("./user/shop-product-full", {
            loginStatus: request.session.loggedIn,
            userName: request.session.user, productData: productData,
            session:request.session
        })
    } catch (err) {
        console.log(err)
    }
}


//user login 
const login_user = async function (request, response) {

    try {

        let email = request.body.email;
        let password = request.body.password;

        let userData = await user.find({ email: email }).exec();
            
        if (userData.length == 0) {
            console.log("user not found")
            console.log("wrong username and password")
            error = true;
            response.render("./user/page-login-register", {
                loginStatus: request.session.loggedIn,
                userName: request.session.user, loginError: error, phoneError: phoneError, otpError: otpError, blocked: userData[0].userBlocked,
                session:request.session
            });
        } else {
            if (email == userData[0].email && password == userData[0].password) {
                if (userData[0].userBlocked) {
                    console.log("user is blocked by admin")
                    blocked = true;
                    response.render("./user/page-login-register", {
                        loginStatus: request.session.loggedIn,
                        userName: request.session.user, loginError: error, phoneError: phoneError, otpError: otpError, blocked: userData[0].userBlocked,
                        session:request.session
                    });
                } else {
                    blocked = false;
                    await Cart.findOneAndUpdate({userId:request.session.userId},{userId:userData[0]._id})

                    
                    request.session.loggedIn = true;
                    request.session.user = userData[0].name;
                    request.session.userId = userData[0]._id
                    let userIdString=userData[0]._id.toHexString()

                    let cartNum=await Cart.aggregate([
                        {'$match': {'userId': userIdString}}, 
                        {'$unwind': {'path': '$products'}}, 
                        {'$group': {'_id': userIdString,'cartTotal': {'$sum': '$products.quantity'}}}
                      ])

                      

                      let wishNum= await WishList.findOne({userId:userIdString}).exec();


                    if(cartNum.length>0){
                        request.session.cartNo=cartNum[0].cartTotal;
                    }

                    if(wishNum){
                        request.session.wishNo=wishNum.products.length;
                    }

                   

                    console.log("login suceess full")
                    response.redirect("/index.html")
                    check = 1;
                }

            } else {
                console.log("wrong username and password")
                error = true;
                response.render("./user/page-login-register", {
                    loginStatus: request.session.loggedIn,
                    userName: request.session.user, loginError: error, phoneError: phoneError, otpError: otpError, blocked: userData[0].userBlocked,
                    session:request.session
                });
            }
        }
    } catch (err) {
        console.log(err)
    }
}


// otp login page 
const otp_page = function (request, response) {
    try {
        if (request.session.loggedIn == true) {
            response.redirect("/index.html")
        } else {
            response.render("./user/page-login-register2", {
                loginStatus: request.session.loggedIn,
                userName: request.session.user, loginError: error, phoneError: phoneError, otpError: otpError, blocked: blocked,
                session: request.session
            });
        }
    } catch (err) {
        console.log(err)
    }

}


//verify mobile and send OTP
const send_mobileOTP = async function (request, response) {
    try {
        let phoneNumber = request.body.phoneNumber;
        let userFound = await user.findOne({ phone: phoneNumber }).exec();
            

        if (!userFound) {
            console.log("phone number not found")
            error = false;
            phoneError = true;
            response.json({err:"phone number not found"});
            // response.render("./user/page-login-register2", {
            //     loginStatus: request.session.loggedIn,
            //     userName: request.session.user, loginError: error, phoneError: phoneError, otpError: otpError, blocked: blocked,
            //     session:request.session
            // });
        } else {

            console.log("phonenumber found in database")
            request.session.user = userFound.name;
            request.session.userId = userFound._id;
            var OTP = await otpGenerator();
            request.session.OTP = OTP;
            function otpGenerator() {
                var digits = '0123456789';
                OTP = '';
                for (let i = 0; i < 4; i++) {
                    OTP += digits[Math.floor(Math.random() * 10)];
                }
                console.log("message going to send to " + phoneNumber)
                return OTP;
            }

            const accountSid = process.env.accountSid;
            const authToken = process.env.authToken;
            const client = require('twilio')(accountSid, authToken);
            client.messages
                .create({
                    body: 'Evara Your Verification Code is ' + OTP,
                    from: '+13854755801',
                    //  messagingServiceSid: 'MG7357b6ce143d76e874edb2e834e86941',      
                    to: "+91" + phoneNumber
                })
                .then(message => console.log(message.sid))
                .catch((err)=>{
                console.log("err catched is   ")
                console.log(err)
                })
                .done()
            console.log("OTP " + OTP + " Send sucessfully");
            phoneError = false;
            error = false;
            
            response.json({name:"justin"});
            // response.render("./user/page-login-register2", {
            //     loginStatus: request.session.loggedIn,
            //     userName: request.session.user, loginError: error, phoneError: phoneError, otpError: otpError, blocked: blocked,
            //     session:request.session
            // });
            check = 1;
        }
    } catch (err) {
        console.log(err)
    }
}



//verify OTP from user
const verify_OTP = function (request, response) {
    try {
        let otpFromUser = request.body.OTP;
        console.log(request.session.OTP)
        if (otpFromUser == request.session.OTP) {
            request.session.loggedIn = true;
            console.log("OTP verified succesfully")
            response.redirect("/index.html");
        }
        else {
            console.log("OTP verification failed")
            phoneError = false;
            error = false;
            otpError = true;
            response.render("./user/page-login-register2", {
                loginStatus: request.session.loggedIn,
                userName: request.session.user, loginError: error, phoneError: phoneError, otpError: otpError, blocked: blocked,
                session:request.session
            });
        }
    } catch (err) {
        console.log(err)
    }
}


// add new user 
const register_user = function (request, response) {
    try {
        let name = request.body.name;
        let email = request.body.email;
        let phoneNumber = request.body.phoneNumber;
        let password = request.body.password;

        const item = new user({
            name: name,
            email: email,
            phone: phoneNumber,
            password: password,
        });
        item.save()
        .then((result) => {
            console.log(result)   
            console.log("user added sucessfully")
            const item = new Wallet({
                userId: result._id
            });
            item.save()
            .then((result)=>{
                
                response.redirect("/index.html");

            })   
        })
        .catch((err) => {
            console.log(err);
        })
        
    } catch (err) {
        console.log(err)
    }
}


// user signout
const signout_user = function (request, response) {
    try {
        request.session.destroy();
        error = false;
        response.redirect("/index.html");
    } catch (err) {
        console.log(err)
    }
}


// user login page 
const loginpage_user = function (request, response) {
    try {
        if (request.session.loggedIn == true) {
            response.redirect("/index.html")
        } else {
            response.render("./user/page-login-register", {
                loginStatus: request.session.loggedIn,
                userName: request.session.user, loginError: error, phoneError: phoneError, otpError: otpError, blocked: blocked,
                session: request.session
            });
        }
    } catch (err) {
        console.log(err)
    }
}


// signup page loading 
const signup_page = function (request, response) {
    try {
        if (request.session.loggedIn == true) {
            response.redirect("/index.html")
        } else {
            response.render("./user/page-login-register1", {
                loginStatus: request.session.loggedIn,
                userName: request.session.user, loginError: error, phoneError: phoneError,
                session: request.session
            });
        }
    } catch (err) {
        console.log(err)
    }
}


// add item to Cart
const add_cart = async function (request, response) {
    try {
        let productId = request.params.productId
        let userFoundInCart = await Cart.exists({ userId: request.session.userId });
        console.log("product id received from user to cart"+productId)
        
        if (!userFoundInCart) {
            const item = new Cart({
                userId: request.session.userId,
                products: [{
                    productId: productId,
                    quantity: 1
                }],
            });
            await item.save().then((result) => {
                console.log("item added to cart sucessfully")
                request.session.cartNo=request.session.cartNo+1;
                response.redirect("/index.html")
            }).catch((err) => {
                console.log(err);
            })

        } else {
            let productFoundInCart = await Cart.exists({ 'products.productId': productId });
            console.log("product available in cart check output"+productFoundInCart)
            if (!productFoundInCart) {
                console.log("product not found in cart")
                let newProduct = {
                    productId: productId,
                    quantity: 1
                }
                await Cart.updateOne(
                    { userId: request.session.userId },
                    { $push: { products: newProduct } },)


            } else {
                console.log("product found in cart")
                await Cart.updateOne({ 'products.productId': productId, userId: request.session.userId }, { $inc: { 'products.$.quantity': +1 } })
                console.log("product++ cart" + productId)
            }
            request.session.cartNo=request.session.cartNo+1;
            response.json({name:"justin"})
        }
    } catch (err) {
        console.log(err)
    }
}



//show cart
const show_cart = async function (request, response) {
    try {
        //request.session.userId="1670082126765"
        let cartData = await Cart.aggregate([{ $match: { userId: request.session.userId } },
        { $unwind: "$products" },
        { $addFields: { newProductId: { $toObjectId: "$products.productId" } } },

        {
            $lookup: {
                from: "products",
                localField: "newProductId",
                foreignField: "_id",
                as: "productInfo"
            }
        },
        { $unwind: "$productInfo" },
        { $addFields: { subTotal: { $multiply: ["$products.quantity", "$productInfo.sellingPrice"] } } }
        ])
            
        let userIdString=request.session.userId

        let cartNum=await Cart.aggregate([
            {'$match': {'userId': userIdString}}, 
            {'$unwind': {'path': '$products'}}, 
            {'$group': {'_id': userIdString,'cartTotal': {'$sum': '$products.quantity'}}}
          ])

        if(cartNum.length>0){
            request.session.cartNo=cartNum[0].cartTotal;
        }



        response.render("./user/shop-cart",{
            loginStatus: request.session.loggedIn,
            userName: request.session.user,
            cartData:cartData,
            session:request.session
            //cartData: cartData
        });
    } catch (err) {
        console.log(err)
    }
}


// cart update
const update_cart = async function (request, response) {
    try {

        let productId=request.query.id
        let newQuantity=request.query.newValue
        
        console.log("product Id"+productId+"new Quantity"+newQuantity)

        let updatedCart=await Cart.updateOne({ userId: request.session.userId,"products.productId":productId}, 
                                                { "products.$.quantity": newQuantity })
        .then((result) => {
            return result
        }).catch((err) => {
            console.log(err)
        })

        console.log(updatedCart)

    response.redirect("/index.html")

     } catch (err) {
        console.log(err)
    }
}

// cart delete

const delete_cart = async function (request, response) {
    try {
        let productId = request.params.productId

        console.log(productId)

        await Cart.updateOne({ userId: request.session.userId }, { "$pull": { "products": { "productId": productId } }}, { safe: true, multi:true } );

response.redirect("/shop-cart.html")

    } catch (err) {
        console.log(err)
    }
}



// add item to wishlist 
const add_wishList = async function (request, response) {
    try {
        let productId = request.params.productId
        let userFoundInCart = await WishList.exists({ userId: request.session.userId });
        console.log("product id received from user to cart"+productId)
        
        if (!userFoundInCart) {
            const item = new WishList({
                userId: request.session.userId,
                products: [{
                    productId: productId,
                    quantity: 1
                }],
            });
            await item.save().then((result) => {
                console.log("item added to cart sucessfully")
                request.session.wishNo=request.session.wishNo+1;
                response.redirect("/index.html")
            }).catch((err) => {
                console.log(err);
            })

        } else {
            let productFoundInCart = await WishList.exists({ 'products.productId': productId });
            console.log("product available in cart check output"+productFoundInCart)
            if (!productFoundInCart) {
                console.log("product not found in cart")
                let newProduct = {
                    productId: productId,
                    quantity: 1
                }
                await WishList.updateOne(
                    { userId: request.session.userId },
                    { $push: { products: newProduct } },)


            } else {
                console.log("product found in cart")
                await WishList.updateOne({ 'products.productId': productId, userId: request.session.userId }, { $inc: { 'products.$.quantity': +1 } })
                console.log("product++ cart" + productId)
            }
            request.session.wishNo=request.session.wishNo+1;
            response.json({name:"justin"})
        }
    } catch (err) {
        console.log(err)
    }
}

// delete wishlist items

const delete_wishList = async function (request, response) {
    try {
        let productId = request.params.productId

        console.log(productId)

        await WishList.updateOne({ userId: request.session.userId }, { "$pull": { "products": { "productId": productId } }}, { safe: true, multi:true } );
        request.session.wishNo=request.session.wishNo-1;
        response.redirect("/shop-wishlist.html")

    } catch (err) {
        console.log(err)
    }
}


// add item to Cart from wishList
const wishAdd_cart = async function (request, response) {
    try {
        let productId = request.params.productId
        let userFoundInCart = await Cart.exists({ userId: request.session.userId });
        console.log("product id received from user to cart"+productId)
        
        if (!userFoundInCart) {
            const item = new Cart({
                userId: request.session.userId,
                products: [{
                    productId: productId,
                    quantity: 1
                }],
            });
            await item.save().then((result) => {
                console.log("item added to cart sucessfully")
                request.session.cartNo=request.session.cartNo+1;
                response.redirect("/index.html")
            }).catch((err) => {
                console.log(err);
            })

        } else {
            let productFoundInCart = await Cart.exists({ 'products.productId': productId });
            console.log("product available in cart check output"+productFoundInCart)
            if (!productFoundInCart) {
                console.log("product not found in cart")
                let newProduct = {
                    productId: productId,
                    quantity: 1
                }
                await Cart.updateOne(
                    { userId: request.session.userId },
                    { $push: { products: newProduct } },)


            } else {
                console.log("product found in cart")
                await Cart.updateOne({ 'products.productId': productId, userId: request.session.userId }, { $inc: { 'products.$.quantity': +1 } })
                console.log("product++ cart" + productId)
            }

            console.log("user id:"+ request.session.userId);
            console.log("product id is :"+ productId);

            await WishList.updateOne({ userId: request.session.userId }, { "$pull": { "products": { "productId": productId } }}, { safe: true, multi:true } );
            request.session.cartNo=request.session.cartNo+1;
            request.session.wishNo=request.session.wishNo-1;
            response.redirect("/shop-wishlist.html")
            //response.json({name:"justin"})
        }

    } catch (err) {
        console.log(err)
    }
}

















// check out page loading 

const check_out = async function (request, response) {
    try {

        let cartTotal = await Cart.aggregate([{ $match: { userId: request.session.userId } },
        { $unwind: "$products" },
        { $addFields: { newProductId: { $toObjectId: "$products.productId" } } },

        {
            $lookup: {
                from: "products",
                localField: "newProductId",
                foreignField: "_id",
                as: "productInfo"
            }
        },
        { $unwind: "$productInfo" },
        { $addFields: { subTotal: { $multiply: ["$products.quantity", "$productInfo.sellingPrice"] } } },
        { $project: { subTotal: 1 } },
        { $group: { _id: "", cartTotal: { $sum: "$subTotal" } } }
        ])
            


        let userData = await user.findOne({ "_id": request.session.userId }).exec();
            

        response.render("./user/shop-checkout", {
            loginStatus: request.session.loggedIn,
            userName: request.session.user, cartTotal: cartTotal, userData: userData,
            session: request.session
        })

    } catch (err) {
        console.log(err)
    }
}



//user account

const user_account = async function (request, response) {
    try {

    let orderDetail= await Order.find({ userId: request.session.userId }).sort({ "createdAt" : -1 }).exec();
    let walletDetails= await Wallet.findOne({userId:request.session.userId})

    let userDetail= await user.findOne({'_id':request.session.userId}).exec();
   

        response.render("./user/page-account",{loginStatus: request.session.loggedIn,
        userName: request.session.user, sessionData:request.session,
        orderDetail:orderDetail,userDetail:userDetail,walletDetails:walletDetails,
        session:request.session})


        
    } catch (err) {
        console.log(err)
    }
}

// update user data 
const user_update = async function (request, response) {
    try {

        let userId = request.session.userId
        let name = request.body.name;
        let phoneNumber = request.body.phoneNumber;
        let email = request.body.email;
        let oldpass = request.body.password; 
        let password = request.body.npassword;
        if(password.length<3){
        password=oldpass;
        }

        

        await user.findByIdAndUpdate(userId, { $set:{name:name,phone:phoneNumber,email:email,password:password}})


        response.json({ name: "justin" })

    } catch (err) {
        console.log(err)
    }
}













//add Address

const new_address = async function (request, response) {
    try {

        let userId = request.session.userId
        let name = request.body.name;
        let address = request.body.address;
        let city = request.body.city;
        let state = request.body.state;
        let zipCode = request.body.zipCode;
        let phoneNumber = request.body.phoneNumber;
        let email = request.body.email;

        const item = {
            name: name,
            address: address,
            city: city,
            state: state,
            zipCode: zipCode,
            phoneNumber: phoneNumber,
            email: email
        };

        await user.findByIdAndUpdate(userId, { $push: { address: item } })

            
        response.json({ name: "justin" })

    } catch (err) {
        console.log(err)
    }
}

//edit Address

const edit_address = async function (request, response) {
    
    
    try {


        console.log("*****************+++++++++++++++++***************************")
        console.log(request.body.addressIndex)
        console.log(request.body.data.name)



        let addressIndex=Number(request.body.addressIndex)
        let userId = request.session.userId
        let name = request.body.data.name;
        let address = request.body.data.address;
        let city = request.body.data.city;
        let state = request.body.data.state;
        let zipCode = request.body.data.zipCode;
        let phoneNumber = request.body.data.phoneNumber;
        let email = request.body.data.email;



        const item = {
            name: name,
            address: address,
            city: city,
            state: state,
            zipCode: zipCode,
            phoneNumber: phoneNumber,
            email: email
        };

        let userData= await user.findById(userId).exec()

        let array=userData.address;

        array.splice(addressIndex, 1, item);

        await user.findByIdAndUpdate(userId, { $set: { address: array } })

        response.json({ name: "justin" })

    } catch (err) {
        console.log(err)
    }
}


//delete Address

const delete_address = async function (request, response) {
    
    
    try {
        console.log(request.body.addressIndex)
        let addressIndex=Number(request.body.addressIndex);
        let userId = request.session.userId;



        let userData= await user.findById(userId).exec()

        let array=userData.address;

        array.splice(addressIndex, 1);

        await user.findByIdAndUpdate(userId, { $set: { address: array } })

        response.json({ name: "justin" })

    } catch (err) {
        console.log(err)
    }
}



// place order

const place_order = async function (request, response) {
    try {

        let addressId = request.body.addressId;
        let payment = request.body.payment;
        let couponCode=request.body.couponCode; 
        let discount= request.body.amount;

        if(discount>0){
            await user.findByIdAndUpdate(request.session.userId, { $push: { coupanUsed: couponCode } })
        }
        

        let cart = await Cart.findOne({ userId: request.session.userId }).exec();
            


        let cartTotal = await Cart.aggregate([{ $match: { userId: request.session.userId } },
        { $unwind: "$products" },
        { $addFields: { newProductId: { $toObjectId: "$products.productId" } } },

        {
            $lookup: {
                from: "products",
                localField: "newProductId",
                foreignField: "_id",
                as: "productInfo"
            }
        },
        { $unwind: "$productInfo" },
        { $addFields: { subTotal: { $multiply: ["$products.quantity", "$productInfo.sellingPrice"] } } },
        { $project: { subTotal: 1 } },
        { $group: { _id: "", cartTotal: { $sum: "$subTotal" } } }
        ])
            


        let userData = await user.findOne({ "_id": request.session.userId }).exec()
            

        // console.log("--------user data--------")
        // console.log(userData)
        // console.log("--------user data--------")

        let userId = mongoose.Types.ObjectId(request.session.userId);
        let products = cart.products;
        let totalAmount = (cartTotal[0].cartTotal)-discount;
        let address = userData.address[addressId];
        let status = "processing";
        let paymentMethod = payment;
        let date = new Date();


        const item = new Order({
            userId: userId,
            products: products,
            totalAmount: totalAmount,
            address: address,
            status: status,
            paymentMethod: paymentMethod,
            date: date
        });
        let newOrder = await item.save().then((result) => {
            return result;
        }).catch((err) => {
            console.log(err);
        })


        await Cart.deleteOne({ userId: request.session.userId })
            .then((result) => {
                console.log("order placed sucessfully")
            }).catch((err) => {
                console.log(err)
            })

        request.session.cartNo = 0;


        if (payment == "Cash on Delivery") {

            response.json({ status: true })
        }
        else if (payment == "razorpay") {

            const Razorpay = require('razorpay');

            var instance = new Razorpay({
                key_id: process.env.key_id,
                key_secret: process.env.key_secret,
            });

            console.log(newOrder);

            instance.orders.create({
                amount: totalAmount * 100,
                currency: "INR",
                receipt: "" + newOrder._id,



            }, function (err, order) {
                if (err) {
                    console.log(err)
                } else {
                    console.log(order)
                    response.json({ order, userData })
                }
            })
        } else if(payment == "paypal"){
            

            paypal.configure({
                'mode': 'sandbox', //sandbox or live
                'client_id': process.env.client_id,
                'client_secret': process.env.client_secret
            });
        
            

            let currencyConverter= new CC({from:"INR", to:"USD", amount:totalAmount})

            let totalInUSD= await currencyConverter.convert().then((response) => {
                console.log(response)
                return response//or do something else
            })
           
            let totalUSD=totalInUSD.toFixed(2);

            console.log("currency in usd"+totalUSD)

            const create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": "http://localhost:3000/payment_success",
                    "cancel_url": "http://localhost:3000/payment_fail"
                },
                "transactions": [{

                    "item_list": {
                        "items": [{
                            "name": "Red Sox Hat",
                            "sku": "001",
                            "price": ""+totalUSD,
                            "currency": "USD",
                            "quantity": 1
                        }]
                    },

                                                "amount": {
                                                            "currency": "USD",
                                                            "total": ""+totalUSD
                                                            },
                                                "description": "Hat for the best team ever"
                }]

            };
            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    throw error;
                } else {
                    for(let i = 0;i < payment.links.length;i++){
                      if(payment.links[i].rel === 'approval_url'){
                        let redirectLink=payment.links[i].href
                        let token=redirectLink.split('=')[2];


                        const item = new Payment({
                            everaOrderId: "" + newOrder._id,
                            paymentDetails: {
                                payment_token: token,
                                paypal_id: "",
                            },
                            amount: totalAmount,
                            status: "pending",
                            date: new Date()
            
                        });
                        let newPayment = item.save().then((result) => {
                            return result;
                        }).catch((err) => {
                            console.log(err);
                        })

                        response.json({ link:redirectLink, method:"paypal" })
                        //response.redirect(payment.links[i].href);
                      }
                    }
                }
              });
        }
    } catch (err) {
        console.log(err)
    }
}


//confirm Payment 
const confirm_payment = async function (request, response) {
    try {
        let razorpay_signature = request.body.signature;

        var hmac_sha256 = require("crypto-js/hmac-sha256");
        let generated_signature = hmac_sha256(request.body.razerPayOrder_id + "|" + request.body.payment_id, 'DGKSQ2Uj8KYbDyNTgm5939dt');

        if (generated_signature == razorpay_signature) {
            console.log("payment is successful");

            const item = new Payment({
                everaOrderId: request.body.everaOrderId,
                paymentDetails: {
                    payment_id: request.body.payment_id,
                    razerPayOrder_id: request.body.razerPayOrder_id,
                    signature: request.body.signature,
                },
                amount: (request.body.amount)/100,
                status: "success",
                date: new Date()

            });
            let newPayment = await item.save().then((result) => {
                return result;
            }).catch((err) => {
                console.log(err);
            })

            await Order.findByIdAndUpdate(request.body.everaOrderId, { $set: { paymentStatus: "success" } })
            .then((result) => {
                console.log(result)
                console.log("address added sucessfully")
            }).catch((err) => {
            })

            response.json({ status: "success" })
        } else {
            response.json({ status: "fail" })
        }

    } catch (err) {
        console.log(err)
    }

}


// paypal payment confirmation 


const payment_success = async function (request, response) {
    try {
        const payerId = request.query.PayerID;
        const paymentId = request.query.paymentId;
        const payment_token=""+request.query.token;

       
        let paymentDetail=  await Payment.findOne({"paymentDetails.payment_token":payment_token}).exec();  

        let currencyConverter= new CC({from:"INR", to:"USD", amount:paymentDetail.amount})

        let totalInUSD= await currencyConverter.convert().then((response) => {
            console.log(response)
            return response//or do something else
        })

        let totalUSD=totalInUSD.toFixed(2);
      
        const execute_payment_json = {
          "payer_id": payerId,
          "transactions": [{
              "amount": {
                  "currency": "USD",
                  "total": ""+totalUSD
              }
          }]
        };

        paypal.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
            if (error) {
                console.log(error.response);
                throw error;
            } else {
                //console.log(JSON.stringify(payment));
                await Payment.updateOne({"paymentDetails.payment_token":payment_token},{$set:{
                    paymentDetails:{payment_token:payment_token, paypal_id:paymentId },
                    status:"success",
                }})

                await Order.updateOne({_id:paymentDetail.everaOrderId},{$set:{paymentStatus:"success"}})
                // response.send('Success');
                response.render("./user/page-payment-success",{loginStatus: request.session.loggedIn,
                    userName: request.session.user, sessionData:request.session,session:request.session}); 

            }
        });
        





    } catch (err) {
        console.log(err)
    }

}

const payment_fail= function(request,response){
try{

    response.render("./user/page-payment-fail",{loginStatus: request.session.loggedIn,
        userName: request.session.user, sessionData:request.session,session:request.session});


}catch(err){
   console.log(err) 
}


}

//each order details page
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

        let invoiceList=await Order.aggregate([
           
            {$match:{_id:orderId}},
                {
                  '$project': {
                    'userId': 1, 
                    'products': 1, 
                    'date': 1
                  }
                }, {
                  '$unwind': {
                    'path': '$products', 
                    'preserveNullAndEmptyArrays': false
                  }
                }, {
                  '$addFields': {
                    'quantity': '$products.quantity'
                  }
                }, {
                  '$addFields': {
                    'productId': '$products.productId'
                  }
                }, {
                  '$project': {
                    'userId': 1, 
                    'date': 1, 
                    'quantity': 1, 
                    'productId': 1
                  }
                }, {
                  '$addFields': {
                    'newProductId': {
                      '$toObjectId': '$productId'
                    }
                  }
                }, {
                  '$lookup': {
                    'from': 'products', 
                    'localField': 'newProductId', 
                    'foreignField': '_id', 
                    'as': 'productInfo'
                  }
                }, {
                  '$unwind': {
                    'path': '$productInfo'
                  }
                }, {
                  '$addFields': {
                    'productName': '$productInfo.name', 
                    'productPrice': '$productInfo.sellingPrice'
                  }
                }, {
                  '$project': {
                    'date': 1, 
                    'quantity': 1, 
                    'productName': 1, 
                    'productPrice': 1
                  }
                }
              
        ])

        console.log(invoiceList)

        response.render("./user/page-account-orderDetail",{loginStatus: request.session.loggedIn,
            userName: request.session.user, sessionData:request.session,orderList:orderList[0],productList:productList,
            session:request.session,invoiceList:invoiceList});


    } catch (err) {
        console.log(err)
    }

}



//wish list 


const wish_list = async function (request, response) {
    try {

       //request.session.userId="1670082126765"
       let cartData = await WishList.aggregate([{ $match: { userId: request.session.userId } },
        { $unwind: "$products" },
        { $addFields: { newProductId: { $toObjectId: "$products.productId" } } },

        {
            $lookup: {
                from: "products",
                localField: "newProductId",
                foreignField: "_id",
                as: "productInfo"
            }
        },
        { $unwind: "$productInfo" },
        { $addFields: { subTotal: { $multiply: ["$products.quantity", "$productInfo.sellingPrice"] } } }
        ])
            
    
  
        response.render("./user/shop-wishlist",{
            loginStatus: request.session.loggedIn,
            userName: request.session.user,
            cartData:cartData,
            session:request.session});


    } catch (err) {
        console.log(err);
    }

}

// coupon check 

const coupon_check= async function (request,response){
    try{


        let couponCode= request.body.coupon
        let total = Number(request.body.total)
        let message

        let couponResult = await Coupon.findOne({coupon:couponCode}).exec();
        if (couponResult){

            let couponFoundInUser = await user.findOne({_id:request.session.userId,coupanUsed:couponCode}).exec();
            if (couponFoundInUser){
                message="coupon already used"
            }else{

                let todayDate = new Date()
                let todayYear = todayDate.getFullYear()
                let todayMonth = todayDate.getMonth() + 1
                if (todayMonth<10){
                    todayMonth="0"+todayMonth;
                }
                let todayDay = todayDate.getDate()
                if (todayDay<10){
                    todayDay="0"+todayDay;
                }
                let toDayDate = "" + todayYear + "-" + todayMonth + "-" + todayDay;
                console.log(toDayDate)
                console.log(couponResult.startDate)
                console.log(couponResult.endDate)
                if(toDayDate>=couponResult.startDate && toDayDate<=couponResult.endDate){
                    if(total>=couponResult.limit1){
                        message="coupon is valid"
                        let discount= Math.round(total*couponResult.discount/100);
                        if(discount<=couponResult.limit){
                            total=total-discount;
                        }else{
                            total=total-couponResult.limit;
                        }
                    }else{
                        message="add ₹ "+(couponResult.limit1-total)+" to cart for apply this coupon"
                    }

                }else{
                    message="coupon is expired"
                }
            }

        }else{
            message="coupon not found"
        }


        console.log("new total is "+total)
        console.log("message is "+ message)

        response.json({message:message,total:total})

    }catch(err){
        console.log(err)
    }
}

const about_page =function (request,response){
    try{
    response.render("./user/page-about",{
        loginStatus: request.session.loggedIn,
        userName: request.session.user,
        session:request.session})
    }catch(err){
        console.log(err)
    }
}



const contact_page =function (request,response){
    try{
    response.render("./user/page-contact",{
        loginStatus: request.session.loggedIn,
        userName: request.session.user,
        session:request.session})
    }catch(err){
        console.log(err)
    }
}

const product_list= async function (request,response){
    try{
    let filter=request.query.filter;
    let sort=request.query.sort;

    if (filter == "MEN") {
        let productList;
            if (sort=="low"){
                productList = await Product.find({ category: "MEN" }).sort({ sellingPrice: 1 }).exec();
            }else if (sort=="high"){
                productList = await Product.find({ category: "MEN" }).sort({ sellingPrice: -1 }).exec();
            }else{
                productList = await Product.find({ category: "MEN" }).sort({ createdAt: -1 }).exec();
            }
        response.render("./user/shop-grid-left", {
            loginStatus: request.session.loggedIn,
            userName: request.session.user,
            productList: productList,
            filter:"MEN",
            sort:sort,
            session: request.session
        })
    } else if (filter == "WOMAN") {

        let productList;
        if (sort=="low"){
            productList = await Product.find({ category: "WOMAN" }).sort({ sellingPrice: 1 }).exec();
        }else if (sort=="high"){
            productList = await Product.find({ category: "WOMAN" }).sort({ sellingPrice: -1 }).exec();
        }else{
            productList = await Product.find({ category: "WOMAN" }).sort({ createdAt: -1 }).exec();
        }
       
        response.render("./user/shop-grid-left", {
            loginStatus: request.session.loggedIn,
            userName: request.session.user,
            productList: productList,
            filter:"WOMAN",
            sort:sort,
            session: request.session
        })

    } else if (filter == "KIDS") {

        let productList;
        if (sort=="low"){
            productList = await Product.find({ category: "KIDS" }).sort({ sellingPrice: 1 }).exec();
        }else if (sort=="high"){
            productList = await Product.find({ category: "KIDS" }).sort({ sellingPrice: -1 }).exec();
        }else{
            productList = await Product.find({ category: "KIDS" }).sort({ createdAt: -1 }).exec();
        }
      
        response.render("./user/shop-grid-left", {
            loginStatus: request.session.loggedIn,
            userName: request.session.user,
            productList: productList,
            filter:"KIDS",
            sort:sort,
            session: request.session
        })

    } else {

        let productList;
        if (sort=="low"){
            productList = await Product.find({ }).sort({ sellingPrice: 1 }).exec();
        }else if (sort=="high"){
            productList = await Product.find({ }).sort({ sellingPrice: -1 }).exec();
        }else{
            productList = await Product.find({}).sort({ createdAt: -1 }).exec();
        }
        
        response.render("./user/shop-grid-left", {
            loginStatus: request.session.loggedIn,
            userName: request.session.user,
            productList: productList,
            filter:"ALL",
            sort:sort,
            session: request.session
        })
    }
}catch(err){
    console.log(err)
}     
}


//privacy policy 
const privacy_policy =function (request,response){
    try{
    response.render("./user/page-privacy-policy",{
        loginStatus: request.session.loggedIn,
        userName: request.session.user,
        session:request.session})
    }catch(err){
        console.log(err)
    }
}

//page terms and conditions 
const page_terms =function (request,response){
    try{
    response.render("./user/page-terms",{
        loginStatus: request.session.loggedIn,
        userName: request.session.user,
        session:request.session})
    }catch(err){
        console.log(err)
    }
}

const page_search= async function (request,response){
    try{
   console.log(request.body.search)
//    await Product.createIndex( { name: "text" } )
   let productList=await Product.find( { $text: { $search: request.body.search } } ).exec();
   
    response.render("./user/shop-grid-left", {
        loginStatus: request.session.loggedIn,
        userName: request.session.user,
        productList: productList,
        filter:"ALL",
        sort:"search",
        session: request.session
    })
}catch(err){
    console.log(err);
}
}



module.exports={
    home_page,
    login_user,
    send_mobileOTP,
    verify_OTP,
    register_user,
    home_user,
    product_view,
    add_cart,
    show_cart,
    update_cart,
    delete_cart,
    check_out,
    user_account,
    new_address,
    place_order,
    order_details,
    signout_user,
    loginpage_user,
    otp_page,
    signup_page,
    confirm_payment,
    payment_success,
    edit_address,
    delete_address,
    user_update,
    wish_list,
    add_wishList,
    delete_wishList,
    wishAdd_cart,
    coupon_check,
    about_page,
    contact_page,
    product_list,
    privacy_policy,
    page_terms,
    page_search,
    payment_fail
    
}
