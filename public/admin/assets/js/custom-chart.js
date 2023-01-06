(function ($) {
    let labels=[];
    let data=[];
    for(let i=1;i<32;i++){
       labels.push(i.toString())
       data.push(0)
    }
       
    $.ajax({
        type:"GET",
        url:"/admin/dailySell_graph",
        success: function (response) {
            //response=JSON.parse(response)
            console.log(response.graphData.length)
            console.log(response.graphData[0]._id.day)
            console.log(response.graphData[0].orderNo)  
            console.log(this.labels) 
            graphPlot(response)
        },
        error: function (data) {
            alert('An error occurred.');
            console.log(data);
        },
    });
   
    "use strict";
    function graphPlot(response){
    /*Sale statistics Chart*/
    if ($('#myChart').length) {
        for(let j=0;j<response.graphData.length;j++){
            data[response.graphData[j]._id.day-1]=response.graphData[j].orderNo
        }


        var ctx = document.getElementById('myChart').getContext('2d');
        var chart = new Chart(ctx, {
            // The type of chart we want to create
            type: 'line',
            
            // The data for our dataset
            data: {
                labels:labels,
                datasets: [{
                        label: 'Sales Per Day',
                        tension: 0.3,
                        fill: true,
                        backgroundColor: 'rgba(44, 120, 220, 0.2)',
                        borderColor: 'rgba(44, 120, 220)',
                        data: data
                    },
                    // {
                    //     label: 'Visitors',
                    //     tension: 0.3,
                    //     fill: true,
                    //     backgroundColor: 'rgba(4, 209, 130, 0.2)',
                    //     borderColor: 'rgb(4, 209, 130)',
                    //     data: [40, 20, 17, 9, 23, 35, 39, 30, 34, 25, 27, 17]
                    // },
                    // {
                    //     label: 'Products',
                    //     tension: 0.3,
                    //     fill: true,
                    //     backgroundColor: 'rgba(380, 200, 230, 0.2)',
                    //     borderColor: 'rgb(380, 200, 230)',
                    //     data: [30, 10, 27, 19, 33, 15, 19, 20, 24, 15, 37, 6]
                    // }
                    

                ]
            },
            options: {
                plugins: {
                legend: {
                    labels: {
                    usePointStyle: true,
                    },
                }
                }
            }
        });
    } //End if

}

    /*Sale statistics Chart*/
    if ($('#myChart2').length) {
        var ctx = document.getElementById("myChart2");
        var myChart = new Chart(ctx, {
            type: 'bar',
            data: {
            labels: ["900", "1200", "1400", "1600"],
            datasets: [
                {
                    label: "US",
                    backgroundColor: "#5897fb",
                    barThickness:10,
                    data: [233,321,783,900]
                }, 
                {
                    label: "Europe",
                    backgroundColor: "#7bcf86",
                    barThickness:10,
                    data: [408,547,675,734]
                },
                {
                    label: "Asian",
                    backgroundColor: "#ff9076",
                    barThickness:10,
                    data: [208,447,575,634]
                },
                {
                    label: "Africa",
                    backgroundColor: "#d595e5",
                    barThickness:10,
                    data: [123,345,122,302]
                },
            ]
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                        usePointStyle: true,
                        },
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } //end if
    
})(jQuery);