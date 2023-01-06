const { user } = require("../models/user");
const { Admin } = require("../models/user");
const { Category } = require("../models/product");
const { Product } = require("../models/product");
const { Order } = require("../models/order");
const session = require("express-session");
const { Payment } = require("../models/payment");
var mongoose = require('mongoose');




// daily order graph 

const daily_order = async function (request, response) {

    try {
        let graphData = await Order.aggregate([
            {
                '$project': {
                    'date': 1, '_id': 0,
                    'year': { '$substrBytes': ['$date', 11, 4] },
                    'month': { '$substrBytes': ['$date', 4, 3] },
                    'day': { '$substrBytes': ['$date', 8, 2] },
                    'ddmmyy': { '$substrBytes': ['$date', 4, 11] }
                }
            },
            {
                '$group': {
                    '_id': {
                        'ddmmyy': '$ddmmyy',
                        'year': '$year',
                        'month': '$month',
                        'day': '$day'
                    },
                    'orderNo': { '$sum': 1 }
                }
            }
        ])

        console.log(graphData)
        response.json({graphData })
    } catch (err) {
        console.log(err)
    }

}

// total revenue




const total_revenue=async function (request, response) {

    try {

        let totalRevenue = await Order.aggregate( [
            {
              '$project': {
                'totalAmount': 1, 
                '_id': 0
              }
            }, {
              '$group': {
                '_id': null, 
                'totalRevenue': {
                  '$sum': '$totalAmount'
                }, 
                'count': {
                  '$sum': 1
                }
              }
            }
          ])

          totalRevenue=totalRevenue[0];
        response.json(totalRevenue)

    } catch (err) {
        console.log(err)
    }

}


module.exports = {
    daily_order,
    total_revenue
}