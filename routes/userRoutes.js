const express=require('express');
//const Routes = require('twilio/lib/rest/Routes');
const router=express.Router();
const user=require('../models/user')
const userController=require('../controllers/userController');
const { response } = require('express');



//middleware


const verifyLogin=(request,response,next)=>{
    if(request.session.loggedIn==true){
        next();
    }else{
        response.redirect("/page-login-register.html")
    }
}


//--------------------- Home Page -------------------------------

// home page re route 
router.get("/",userController.home_page)

// home page
router.get("/index.html",userController.home_user)


// PRODUCT LIST 
router.get("/shop-grid-left.html",userController.product_list)






//----------------------- user login/ register ---------------------

// signout user
router.get("/sign_out",userController.signout_user)


// loging page 
router.get("/page-login-register.html",userController.loginpage_user)


//login user post 
router.post("/page-login-register.html",userController.login_user)


// OTP loging page load 
router.get("/page-login-register.html-1",userController.otp_page)


//send mobile otp post 
router.post("/page-login-register.html-1",userController.send_mobileOTP)


//verify OTP
router.post("/page-login-register1.html-2",userController.verify_OTP)


//signup page loading 
router.get("/page-login-register1.html",userController.signup_page)


// signup page post
router.post("/page-login-register1.html",userController.register_user)




//------------------ shopping of products------------------------------


//product view page 
router.get("/shop-product-right.html/:productId",userController.product_view)


//product add to cart
router.get("/addToCart/:productId",userController.add_cart)


//cart product update
router.patch("/addToCart/update",userController.update_cart)


//cart product delete
router.get("/shop-cart.html/delete/:productId",userController.delete_cart)


//cart page show 
router.get("/shop-cart.html",verifyLogin,userController.show_cart)

//check-out
router.get("/shop-checkout.html",verifyLogin,userController.check_out)


// place order 
router.post("/place-order",userController.place_order)

router.patch("/place-order",userController.confirm_payment)

router.get("/payment_success",userController.payment_success)

router.get("/payment_fail",userController.payment_fail)




//---------------------- apply coupons--------
router.post("/coupon_check",userController.coupon_check)




// ---------------------- wish list ----------------


//show wish list
router.get("/shop-wishlist.html",verifyLogin,userController.wish_list)

//product add to wishlist 
router.get("/addToWishList/:productId",userController.add_wishList)

//wishlist product delete
router.get("/shop-wishlist.html/delete/:productId",userController.delete_wishList)

//product add to cart from wishlist 
router.get("/wishList-addToCart/:productId",userController.wishAdd_cart)







//----------------user account section-------------------------


//user Account page 
router.get("/page-account.html",verifyLogin,userController.user_account)

//user detail edit 


router.post("/page-account.html/userUpdate",userController.user_update)

//new addresss posting 
router.post("/page-account.html/new_address",userController.new_address)

//edit address 
router.patch("/page-account.html/new_address",userController.edit_address)

//delete Address
router.delete("/page-account.html/new_address",userController.delete_address)

//user order detail view page 
router.get("/page-account.html/order-details/:orderId",verifyLogin,userController.order_details)



//about page 
router.get("/page-about.html",userController.about_page)


//contact us page 
router.get("/page-contact.html",userController.contact_page)

//privacy policy
router.get("/page-privacy-policy.html",userController.privacy_policy)

//privacy policy
router.get("/page-terms.html",userController.page_terms)

//search items 
router.post("/page-search",userController.page_search)




module.exports=router;

