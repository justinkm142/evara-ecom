const express=require('express');
//const Routes = require('twilio/lib/rest/Routes');
const adminRouter=express.Router();
const { user } = require("../models/user");
const { Admin } = require("../models/user");
const adminController=require('../controllers/adminController')
const admin_graph=require('../controllers/admin_graph')




//middleware


const verifyLogin=(request,response,next)=>{
    if(request.session.loggedIn == true && request.session.user == "Admin"){
        next();
    }else{
        response.redirect("/admin/login")
    }
}







//--------------------------------------------User Login and home--------------------------------------

//loding admin page
adminRouter.get("/admin/login",adminController.admin_page)


//verify admin in login page 
adminRouter.post("/admin/login",adminController.login_admin)


//admin page loading dashbord 
adminRouter.get("/admin/index.html",verifyLogin,adminController.admin_home)








//--------------------------------------------Product List--------------------------------------


// product list view page
adminRouter.get("/admin/page-products-list.html",adminController.view_product)


// add product GET
adminRouter.get("/admin/page-form-product-2.html",adminController.new_product)


// add product post 
adminRouter.post("/admin/page-form-product-2.html",adminController.add_image,adminController.add_product)


// delete product GET
adminRouter.get("/admin/page-form-product-2.html/delete/:productID",adminController.delete_product)


// update product GET
adminRouter.get("/admin/page-form-product-2.html/update/:updateId",adminController.update_product)

//update product post 

adminRouter.post("/admin/page-form-product-2.html/update/:updateId",adminController.add_image,adminController.update_productData)

// update product delete photo

adminRouter.delete("/admin/page-form-product-2.html/update/",adminController.delete_photo)






//------------------------------order page--------------------------

// order page GET
adminRouter.get("/admin/page-orders-1.html",adminController.order_page)

// // order page GET each page
// adminRouter.get("/admin/page-orders-1.html/?page=1",adminController.order_page)


// order details page GET
adminRouter.get("/admin/page-orders-detail.html/:orderId",adminController.order_details)


// order details update patch
adminRouter.patch("/admin/page-orders-detail.html",adminController.order_update)






//--------------------------------------------User Management Section---------------------------------------------

//user list 
adminRouter.get("/admin/page-account-login.html",adminController.user_list)


//block user 
adminRouter.get("/admin/page-account-login.html/block/:userid",adminController.block_user)


//un block user 
adminRouter.get("/admin/page-account-login.html/un_block/:userid",adminController.unblock_user)





//---------------------------------------------------Category Section---------------------------------------

// categories details page 
adminRouter.get("/admin/page-categories.html",adminController.category_list)


//categories add new 
adminRouter.post("/admin/page-categories.html",adminController.add_category)


// categories update loading 
adminRouter.get("/admin/page-categories.update/:updateId",adminController.viewUpdate_category)


// categories update post
adminRouter.post("/admin/page-categories.update/:updateId",adminController.update_category)


// categories delete 
adminRouter.get("/admin/page-categories.html/delete/:deleteId",adminController.delete_category)




//---------------------------------------------------graph Section---------------------------------------




adminRouter.get("/admin/dailySell_graph",admin_graph.daily_order)

adminRouter.get("/admin/total_revenue",admin_graph.total_revenue)




//-------------------------------------------------coupans section ----------------------------



adminRouter.get("/admin/page-coupons-list.html",adminController.coupon_list)

adminRouter.post("/admin/page-coupons-list.html",adminController.add_coupon)




//----------------------------------------------- Banner Section -----------------------------

adminRouter.get("/admin/page-banner.html",adminController.banner_page)

adminRouter.post("/admin/page-banner.html",adminController.add_image,adminController.add_banner)


























module.exports=adminRouter;
