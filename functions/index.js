const functions = require('firebase-functions');
const admin  = require('firebase-admin');
admin.initializeApp();
const date = new Date();
const restaurantId = "restauranta";
const runTimeOpts = {
    timeoutSeconds: 300,
    memory: '1GB'
}
 exports.calculateSettlementForRestauranta = 
    functions
        .runWith(runTimeOpts)
        .pubsub
        .schedule('00 23 * * *')
        .timeZone('Asia/Kolkata')
        .onRun((context) =>{
        var settlementAmount = 0;
        var totalOrders = 0;
        var orders;
        const settlementDate = date.getTime();
        const settlementStatus = "Generated";

    //Calculate amount first
     var ref = admin.app().database('https://eatitv2-75508-settlementprocessing.firebaseio.com/').ref();
      ref.child('Orders').child(restaurantId).once('value',(snapshot) =>{
        totalOrders = snapshot.numChildren();
        orders = snapshot.val();
         snapshot.forEach((orderSnapshot) =>{
             settlementAmount += orderSnapshot.child('payToRestaurantAfterCommissionAmount').val();
         })
     }).then(()=>{
         var ref1 = admin.app().database('https://eatitv2-75508-settlements.firebaseio.com/').ref();
         ref1.child('settlements').child(restaurantId).push({
            amount:settlementAmount,
            totalOrders:totalOrders,
            orders:orders,
            settlementDate:settlementDate,
            settlementStatus:settlementStatus
        }).then(() =>{
            //Delete data
            ref.child('Orders').child(restaurantId).remove().then(()=>{
                return console.log('Settlement Created and orders deleted for restauranta');

            }).catch((error) =>{
                return console.log('Error deleting',error);
            })
            
        }).catch((error) =>{
            return console.log('Error Updating',error);
        })

     }).catch((error) =>{
          console.log('Error ',error)
     });

     return null;
     
 });