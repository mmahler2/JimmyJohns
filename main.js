var request = require('request');request.jar();
request = request.defaults({jar: true});


var JJ = {

  order: function(user_info, order_items, callback){
    /*
    user_info:
        email
        password
        first_name
        last_name
        phone
        tip_amount
        location_id
        is_test
        verbose

        address:
            line1
            line2
            city
            state
            zipcode
            longitude
            latitude

        payment_info:
            exp_month
            exp_year
            cvv
    */

    if (user_info == null || user_info.address == null || user_info.payment_info == null) {
      callback(false, {msg:"You are missing some user information!"});
      return;
    }

    log("Attempting Order from Jimmy John's");

    var requests = [
      {
        "name": "Login",
        "method": "POST",
        "url": "https://online.jimmyjohns.com/api/Customer/LogIn/",
        "body": {"Email":user_info.email,"Password":user_info.password,"RememberMe":false},
        "headers" : {
          'Content-Type':'application/json;charset=UTF-8',
          'api-key':'A6750DD1-2F04-463E-8D64-6828AFB6143D'
        }
      },
      {
        "name": "Clear Past Orders",
        "method": "DELETE",
        "url":"https://online.jimmyjohns.com/api/Order/",
        "body":"",
        "headers" : {
          'Content-Type':'application/json;charset=UTF-8',
          'api-key':'A6750DD1-2F04-463E-8D64-6828AFB6143D'
        }
      },
      {
        "name": "Set Up Delivery",
        "method": "POST",
        "url":"https://online.jimmyjohns.com/api/Order/",
        "body":{"LocationId":user_info.location_id,"OrderType":"Delivery","ScheduleTime":"ASAP"},
        "headers": {
          'Content-Type':'application/json;charset=UTF-8',
          'api-key':'A6750DD1-2F04-463E-8D64-6828AFB6143D'
        }
      },
      {
        "name" : "Put Delivery Address",
        "method" : "PUT",
        "url": "https://online.jimmyjohns.com/api/Order/DeliveryAddress/",
        "body": {"FriendlyName":"","Company":"","GateCode":"","DeliveryInstructions":"","SaveInstructions":false,"CacheAddress":false,"Index":null,"AddressLine1":user_info.address.line1,"AddressLine2":user_info.address.line2,"City":user_info.address.city,"State":user_info.address.state,"Zipcode":user_info.address.zipcode,"Country":null,"DisplayText":null,"Longitude":user_info.address.longitude,"Latitude":user_info.address.latitude},
        "headers": {
          'Content-Type':'application/json;charset=UTF-8',
          'api-key':'A6750DD1-2F04-463E-8D64-6828AFB6143D'
        }
      },
      {
        "name":"Post Order Items",
        "method":"POST",
        "url":"https://online.jimmyjohns.com/api/Order/Items/",
        "body":order_items,
        "headers": {
          'Content-Type':'application/json;charset=UTF-8',
          'api-key':'A6750DD1-2F04-463E-8D64-6828AFB6143D'
        }
      },
      {
        "name":"Put Contact Info",
        "method":"PUT",
        "url":"https://online.jimmyjohns.com/api/Order/ContactInfo/",
        "body":{"ContactFirstName":user_info.first_name,"ContactLastName":user_info.last_name,"ContactEmail":user_info.email,"ContactPhone":user_info.phone,"OptInNews":false,"OptInPromos":false,"AcceptedTermsAndConditions":true,"IsAnonymousUser":false},
        "headers": {
          'Content-Type':'application/json;charset=UTF-8',
          'api-key':'A6750DD1-2F04-463E-8D64-6828AFB6143D'
        }
      },
      {
        "name":"Put Tip Amount",
        "method":"PUT",
        "url":"https://online.jimmyjohns.com/api/Payment/Tip/",
        "body":{"TipAmount":user_info.tip_ammount,"TipType":"AMOUNT"},
        "headers": {
          'Content-Type':'application/json;charset=UTF-8',
          'api-key':'A6750DD1-2F04-463E-8D64-6828AFB6143D'
        }
      },
      {
        "name":"Submit Payment Info",
        "method":"POST",
        "url":"https://online.jimmyjohns.com/api/Payment",
        "body":{"PaymentCode":"mycc_1","Amount":0.01,"CardHolderName":"","CardType":"","CreditCardNumber":"","ExpirationMonth":user_info.payment_info.exp_month,"ExpirationYear":user_info.payment_info.exp_year,"CvvNumber":user_info.payment_info.cvv,"BillingAddress1":"","BillingAddress2":"","BillingCity":"","BillingState":"","BillingCountry":"","BillingZipcode":"","SaveCreditCardInformation":false,"GiftCardNumber":"","GiftCardPinNumber":"","SaveGiftCardInformation":false},
        "headers": {
          'Content-Type':'application/json;charset=UTF-8',
          'api-key':'A6750DD1-2F04-463E-8D64-6828AFB6143D'
        }
      },
      {
        "name":"Verify For Submit",
        "method":"GET",
        "url":"https://online.jimmyjohns.com/api/Order/VerifyForSubmit/",
        "body":"",
        "headers": {
          'Content-Type':'application/json;charset=UTF-8',
          'api-key':'A6750DD1-2F04-463E-8D64-6828AFB6143D'
        }
      },
      {
        "name":"Final Submit",
        "method":"GET",
        "url":"https://online.jimmyjohns.com/api/Order/Submit/",
        "body":"",
        "headers": {
          'Content-Type':'application/json;charset=UTF-8',
          'api-key':'A6750DD1-2F04-463E-8D64-6828AFB6143D'
        }
      }
    ];

    //loop over the requests and make them in order.
    var i = 0;
    var make_request = function(){

      //which request are we on?
      var deets = requests[i];

      //if this is a test, just signal and abort.
      if (deets.name == "Final Submit" && user_info.is_test == true){
        console.log("It was a test. Not submitting.");
        return;
      }

      //make the request
      request({
        method: deets.method,
        uri: deets.url,
        json: true,
        body: deets.body,
        headers: deets.headers
      },
      function (error, response, body) {

        //something went wrong. either a network or API error.
        if (error || response.statusCode != 200) {
          if (error) {
            log("A network request failed, status code: " + response.statusCode + ", error: " + JSON.stringify(error));
            callback(false, {message:"A network request failed :(", more:error});
          }
          else {
            log("JJ API call failed ("+deets.name+"), status code: " + response.statusCode + ", error: " + JSON.stringify(body));
            callback(false, {message:"'" + deets.name + "' Failure. Error code " + response.statusCode, more:body});
          }
          return;
        }

        //if we make it to here, nothing went wrong and we may continue.
        i++;
        if (i == requests.length) {
          log("The last request went through! This usually means a sandwich is on its way.");
          callback(true, null);
        }
        else {
          log("Done: " + i + "/" + requests.length + " (" + deets.name + ")");
          make_request();
        }

      });
    }
    make_request();


    //for easy reading.
    function log(message){
      if (user_info.verbose) {
        console.log(message);
      }
    }

  },


  get_menu: function(){
    //idk, some method to return all our options?
    var items = [
      {
        "name":"#16 With Mustard",
        "data":{"Index":"0","MenuItemId":"3706","MenuItemText":"#12 BEACH CLUBÂ®","Quantity":1,"SelectedSize":"Regular","BasePrice":7.75,"ExtendedPrice":7.75,"Label":"","Requests":"","DisplayText":"1 x #12 BEACH CLUBÂ® Grey Poupon Dijon Mustard (Extra) French Bread Mayo (EZ)\r\n","DisplayPrice":"7.75","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3017","SelectedAnswerId":"23305","SelectedAnswerText":"Grey Poupon Dijon Mustard (Extra)","EditItem":false,"Quantity":0},{"GroupId":"2944","SelectedAnswerId":"23216","SelectedAnswerText":"French Bread","EditItem":false,"Quantity":0},{"GroupId":"2996","SelectedAnswerId":"23250","SelectedAnswerText":"Mayo (EZ)","EditItem":false,"Quantity":0}]}
      },
      {
        "name":"Vito",
        "data":{"Index":"0","MenuItemId":"3692","MenuItemText":"#5 VITO®","Quantity":1,"SelectedSize":"Regular","BasePrice":6.75,"ExtendedPrice":6.75,"Label":"","Requests":"","DisplayText":"1 x #5 VITO®","DisplayPrice":"6.75","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3888","SelectedAnswerId":"23216","SelectedAnswerText":"French Bread","EditItem":false,"Quantity":0}]}
      },
      {
        "name":"Veggie Club",
        "data":{"Index":"4","MenuItemId":"3707","MenuItemText":"#13 GOURMET VEGGIE CLUB®","Quantity":1,"SelectedSize":"Regular","BasePrice":7.75,"ExtendedPrice":7.75,"Label":"","Requests":"","DisplayText":"1 x #13 GOURMET VEGGIE CLUB® Add Grey Poupon Dijon Mustard French Bread No Tomato Avocado Spread (EZ) Mayo (EZ)\r\n","DisplayPrice":"7.75","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3017","SelectedAnswerId":"23302","SelectedAnswerText":"Add Grey Poupon Dijon Mustard","EditItem":false,"Quantity":0},{"GroupId":"2944","SelectedAnswerId":"23216","SelectedAnswerText":"French Bread","EditItem":false,"Quantity":0},{"GroupId":"2998","SelectedAnswerId":"23256","SelectedAnswerText":"No Tomato","EditItem":false,"Quantity":0},{"GroupId":"3002","SelectedAnswerId":"23397","SelectedAnswerText":"Avocado Spread (EZ)","EditItem":false,"Quantity":0},{"GroupId":"2996","SelectedAnswerId":"23250","SelectedAnswerText":"Mayo (EZ)","EditItem":false,"Quantity":0}]}
      },
      {
        "name":"Billy Club",
        "data":{"Index":"11","MenuItemId":"3702","MenuItemText":"#8 BILLY CLUB®","Quantity":1,"SelectedSize":"Regular","BasePrice":7.75,"ExtendedPrice":7.75,"Label":"","Requests":"","DisplayText":"1 x #8 BILLY CLUB® French Bread\r\n","DisplayPrice":"7.75","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"2944","SelectedAnswerId":"23216","SelectedAnswerText":"French Bread","EditItem":false,"Quantity":0}]}
      },
      {
        "name":"Salt & Vinegar Chips",
        "data":{"Index":"7","MenuItemId":"3715","MenuItemText":"Real Potato Chips","Quantity":1,"SelectedSize":"Regular","BasePrice":0,"ExtendedPrice":2,"Label":"","Requests":"","DisplayText":"1 x Real Potato Chips Salt & Vinegar Jimmy Chips\r\n","DisplayPrice":"2.00","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3966","SelectedAnswerId":"23359","SelectedAnswerText":"Salt & Vinegar Jimmy Chips","EditItem":false,"Quantity":0}]}
      },
      {
        "name":"Jalepeno Chips",
        "data":{"Index":"2","MenuItemId":"3715","MenuItemText":"Real Potato Chips","Quantity":1,"SelectedSize":"Regular","BasePrice":0,"ExtendedPrice":2,"Label":"","Requests":"","DisplayText":"1 x Real Potato Chips JalapeÃ±o Jimmy Chips\r\n","DisplayPrice":"2.00","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3966","SelectedAnswerId":"23358","SelectedAnswerText":"JalapeÃ±o Jimmy Chips","EditItem":false,"Quantity":0}]}
      },
      {
        "name":"BBQ Chips",
        "data":{"Index":"6","MenuItemId":"3715","MenuItemText":"Real Potato Chips","Quantity":1,"SelectedSize":"Regular","BasePrice":0,"ExtendedPrice":2,"Label":"","Requests":"","DisplayText":"1 x Real Potato Chips BBQ Jimmy Chips\r\n","DisplayPrice":"2.00","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3966","SelectedAnswerId":"23357","SelectedAnswerText":"BBQ Jimmy Chips","EditItem":false,"Quantity":0}]}
      }
    ];

    return items;
  },

  get_store_ids: function(location, callback) {
    if (location == null) {
      callback(false, {msg:"you need to provide a lat/long!"});
      return;
    }


    var params = {"Longitude":location.longitude,"Latitude":location.latitude};

    request({
      method: "POST",
      uri: "https://online.jimmyjohns.com/API/Location/ForDeliveryAddress/",
      json: true,
      body: params,
      headers: {
        'Content-Type':'application/json;charset=UTF-8',
        'api-key':'A6750DD1-2F04-463E-8D64-6828AFB6143D'
      }
    },
    function (error, response, body) {
      if (!error) {
        callback(false, true, {message:"There was a network error :("});
      }
      else {
        console.log(JSON.stringify(body));
        callback(true, false, body);
      }
    });
  }

};
module.exports = JJ;
