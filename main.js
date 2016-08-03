var request = require('request');request.jar();
request = request.defaults({jar: true});


var JJ = {

  

  order: function(user_info, order_items, callback){


    if (user_info == null || user_info.address == null || user_info.payment_info == null) {
      callback(false, {msg:"You are missing some user information!"});
      return;
    }
    if (order_items == null) {
      callback(false, {msg:"You need to pass in some food items!"});
      return;
    }

    if (user_info.address.latitude == null || user_info.address.longitude == null) {
      //we need to get the lat/long from the address
    }

    //try to automatically get the lat/long of the user's address...
    //if the store_id doesn't exist, try to find the closest one... otherwise return error!


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


    //This should be relatively up to date.
    //Last updated: 5/13/2016

    var sides = [
      {
        name:"Thinny Chips",
        data:{"Index":"28","MenuItemId":"3715","MenuItemText":"Real Potato Chips","Quantity":1,"SelectedSize":"Regular","BasePrice":0,"ExtendedPrice":2,"Label":"","Requests":"","DisplayText":"1 x Real Potato Chips Thinny Jimmy Chips\r\n","DisplayPrice":"2.00","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3966","SelectedAnswerId":"23636","SelectedAnswerText":"Thinny Jimmy Chips","EditItem":false,"Quantity":0}]}
      },
      {
        name:"Regular Jimmy Chips",
        data:{"Index":"29","MenuItemId":"3715","MenuItemText":"Real Potato Chips","Quantity":1,"SelectedSize":"Regular","BasePrice":0,"ExtendedPrice":2,"Label":"","Requests":"","DisplayText":"1 x Real Potato Chips Regular Jimmy Chips\r\n","DisplayPrice":"2.00","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3966","SelectedAnswerId":"23356","SelectedAnswerText":"Regular Jimmy Chips","EditItem":false,"Quantity":0}]}
      },
      {
        name:"Salt & Vinegar Chips",
        data:{"Index":"7","MenuItemId":"3715","MenuItemText":"Real Potato Chips","Quantity":1,"SelectedSize":"Regular","BasePrice":0,"ExtendedPrice":2,"Label":"","Requests":"","DisplayText":"1 x Real Potato Chips Salt & Vinegar Jimmy Chips\r\n","DisplayPrice":"2.00","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3966","SelectedAnswerId":"23359","SelectedAnswerText":"Salt & Vinegar Jimmy Chips","EditItem":false,"Quantity":0}]}
      },
      {
        name:"Jalepeno Chips",
        data:{"Index":"2","MenuItemId":"3715","MenuItemText":"Real Potato Chips","Quantity":1,"SelectedSize":"Regular","BasePrice":0,"ExtendedPrice":2,"Label":"","Requests":"","DisplayText":"1 x Real Potato Chips JalapeÃ±o Jimmy Chips\r\n","DisplayPrice":"2.00","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3966","SelectedAnswerId":"23358","SelectedAnswerText":"JalapeÃ±o Jimmy Chips","EditItem":false,"Quantity":0}]}
      },
      {
        name:"BBQ Chips",
        data:{"Index":"6","MenuItemId":"3715","MenuItemText":"Real Potato Chips","Quantity":1,"SelectedSize":"Regular","BasePrice":0,"ExtendedPrice":2,"Label":"","Requests":"","DisplayText":"1 x Real Potato Chips BBQ Jimmy Chips\r\n","DisplayPrice":"2.00","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3966","SelectedAnswerId":"23357","SelectedAnswerText":"BBQ Jimmy Chips","EditItem":false,"Quantity":0}]}
      },
      {
        name:"Chocolate Chunk Cookie",
        data:{"Index":"39","MenuItemId":"3884","MenuItemText":"Cookies","Quantity":1,"SelectedSize":"Regular","BasePrice":0,"ExtendedPrice":2.25,"Label":"","Requests":"","DisplayText":"1 x Cookies Chocolate Chunk Cookie\r\n","DisplayPrice":"2.25","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3992","SelectedAnswerId":"23550","SelectedAnswerText":"Chocolate Chunk Cookie","EditItem":false,"Quantity":0}]}
      }
    ];

    var drinks = [
      {
        name:"Root Beer",
        data:{"Index":"38","MenuItemId":"3848","MenuItemText":"Drinks","Quantity":1,"SelectedSize":"Regular","BasePrice":0,"ExtendedPrice":2.25,"Label":"","Requests":"","DisplayText":"1 x Drinks Root Beer (Regular Fountain)\r\n","DisplayPrice":"2.25","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3963","SelectedAnswerId":"23416","SelectedAnswerText":"Root Beer (Regular Fountain)","EditItem":false,"Quantity":0}]}
      },
      {
        name:"Cherry Coke",
        data:{"Index":"37","MenuItemId":"3848","MenuItemText":"Drinks","Quantity":1,"SelectedSize":"Regular","BasePrice":0,"ExtendedPrice":2.25,"Label":"","Requests":"","DisplayText":"1 x Drinks Cherry Coke (Regular Fountain)\r\n","DisplayPrice":"2.25","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3963","SelectedAnswerId":"23415","SelectedAnswerText":"Cherry Coke (Regular Fountain)","EditItem":false,"Quantity":0}]}
      },
      {
        name:"Sweet Tea",
        data:{"Index":"36","MenuItemId":"3848","MenuItemText":"Drinks","Quantity":1,"SelectedSize":"Regular","BasePrice":0,"ExtendedPrice":2.25,"Label":"","Requests":"","DisplayText":"1 x Drinks Iced Tea - Sweet (Regular Fountain)\r\n","DisplayPrice":"2.25","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3963","SelectedAnswerId":"23642","SelectedAnswerText":"Iced Tea - Sweet (Regular Fountain)","EditItem":false,"Quantity":0}]}
      },
      {
        name:"Unsweet Tea",
        data:{"Index":"35","MenuItemId":"3848","MenuItemText":"Drinks","Quantity":1,"SelectedSize":"Regular","BasePrice":0,"ExtendedPrice":2.25,"Label":"","Requests":"","DisplayText":"1 x Drinks Iced Tea - Unsweet (Regular Fountain)\r\n","DisplayPrice":"2.25","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3963","SelectedAnswerId":"23375","SelectedAnswerText":"Iced Tea - Unsweet (Regular Fountain)","EditItem":false,"Quantity":0}]}
      },
      {
        name:"Lemonade",
        data:{"Index":"34","MenuItemId":"3848","MenuItemText":"Drinks","Quantity":1,"SelectedSize":"Regular","BasePrice":0,"ExtendedPrice":2.25,"Label":"","Requests":"","DisplayText":"1 x Drinks Lemonade (Regular Fountain)\r\n","DisplayPrice":"2.25","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3963","SelectedAnswerId":"23377","SelectedAnswerText":"Lemonade (Regular Fountain)","EditItem":false,"Quantity":0}]}
      },
      {
        name:"Dr. Pepper",
        data:{"Index":"33","MenuItemId":"3848","MenuItemText":"Drinks","Quantity":1,"SelectedSize":"Regular","BasePrice":0,"ExtendedPrice":2.25,"Label":"","Requests":"","DisplayText":"1 x Drinks Dr Pepper (Regular Fountain)\r\n","DisplayPrice":"2.25","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3963","SelectedAnswerId":"23590","SelectedAnswerText":"Dr Pepper (Regular Fountain)","EditItem":false,"Quantity":0}]}
      },
      {
        name:"Sprite",
        data:{"Index":"32","MenuItemId":"3848","MenuItemText":"Drinks","Quantity":1,"SelectedSize":"Regular","BasePrice":0,"ExtendedPrice":2.25,"Label":"","Requests":"","DisplayText":"1 x Drinks Sprite (Regular Fountain)\r\n","DisplayPrice":"2.25","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3963","SelectedAnswerId":"23379","SelectedAnswerText":"Sprite (Regular Fountain)","EditItem":false,"Quantity":0}]}
      },
      {
        name:"Diet Coke",
        data:{"Index":"31","MenuItemId":"3848","MenuItemText":"Drinks","Quantity":1,"SelectedSize":"Regular","BasePrice":0,"ExtendedPrice":2.25,"Label":"","Requests":"","DisplayText":"1 x Drinks Diet Coke (Regular Fountain)\r\n","DisplayPrice":"2.25","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3963","SelectedAnswerId":"23373","SelectedAnswerText":"Diet Coke (Regular Fountain)","EditItem":false,"Quantity":0}]}
      },
      {
        name:"Coke",
        data:{"Index":"30","MenuItemId":"3848","MenuItemText":"Drinks","Quantity":1,"SelectedSize":"Regular","BasePrice":0,"ExtendedPrice":2.25,"Label":"","Requests":"","DisplayText":"1 x Drinks Coke (Regular Fountain)\r\n","DisplayPrice":"2.25","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3963","SelectedAnswerId":"23371","SelectedAnswerText":"Coke (Regular Fountain)","EditItem":false,"Quantity":0}]}
      }
    ];

    var sammies = [
      {
        name:"SLIM 1",
        data:{"Index":"3","MenuItemId":"3695","MenuItemText":"SLIM 1","Quantity":1,"SelectedSize":"Regular","BasePrice":5.75,"ExtendedPrice":5.75,"Label":"","Requests":"","DisplayText":"1 x SLIM 1","DisplayPrice":"5.75","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3888","SelectedAnswerId":"23216","SelectedAnswerText":"French Bread","EditItem":false,"Quantity":0}]}
      },
      {
        name:"SLIM 2",
        data:{"Index":"4","MenuItemId":"3696","MenuItemText":"SLIM 2","Quantity":1,"SelectedSize":"Regular","BasePrice":5.75,"ExtendedPrice":5.75,"Label":"","Requests":"","DisplayText":"1 x SLIM 2","DisplayPrice":"5.75","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3888","SelectedAnswerId":"23216","SelectedAnswerText":"French Bread","EditItem":false,"Quantity":0}]}
      },
      {
        name:"SLIM 3",
        data:{"Index":"5","MenuItemId":"3697","MenuItemText":"SLIM 3","Quantity":1,"SelectedSize":"Regular","BasePrice":5.75,"ExtendedPrice":5.75,"Label":"","Requests":"","DisplayText":"1 x SLIM 3","DisplayPrice":"5.75","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3888","SelectedAnswerId":"23216","SelectedAnswerText":"French Bread","EditItem":false,"Quantity":0}]}
      },
      {
        name:"SLIM 4",
        data:{"Index":"6","MenuItemId":"3698","MenuItemText":"SLIM 4","Quantity":1,"SelectedSize":"Regular","BasePrice":5.75,"ExtendedPrice":5.75,"Label":"","Requests":"","DisplayText":"1 x SLIM 4","DisplayPrice":"5.75","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3888","SelectedAnswerId":"23216","SelectedAnswerText":"French Bread","EditItem":false,"Quantity":0}]}
      },
      {
        name:"SLIM 5",
        data:{"Index":"7","MenuItemId":"3699","MenuItemText":"SLIM 5","Quantity":1,"SelectedSize":"Regular","BasePrice":5.75,"ExtendedPrice":5.75,"Label":"","Requests":"","DisplayText":"1 x SLIM 5","DisplayPrice":"5.75","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3888","SelectedAnswerId":"23216","SelectedAnswerText":"French Bread","EditItem":false,"Quantity":0}]}
      },
      {
        name:"SLIM 6",
        data:{"Index":"8","MenuItemId":"3700","MenuItemText":"SLIM 6","Quantity":1,"SelectedSize":"Regular","BasePrice":5.75,"ExtendedPrice":5.75,"Label":"","Requests":"","DisplayText":"1 x SLIM 6","DisplayPrice":"5.75","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3888","SelectedAnswerId":"23216","SelectedAnswerText":"French Bread","EditItem":false,"Quantity":0}]}
      },
      {
        name:"#1 PEPE",
        data:{"Index":"9","MenuItemId":"3688","MenuItemText":"#1 PEPE®","Quantity":1,"SelectedSize":"Regular","BasePrice":6.75,"ExtendedPrice":6.75,"Label":"","Requests":"","DisplayText":"1 x #1 PEPE®","DisplayPrice":"6.75","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3888","SelectedAnswerId":"23216","SelectedAnswerText":"French Bread","EditItem":false,"Quantity":0}]}
      },
      {
        name:"#2 BIG JOHN",
        data:{"Index":"10","MenuItemId":"3689","MenuItemText":"#2 BIG JOHN®","Quantity":1,"SelectedSize":"Regular","BasePrice":6.75,"ExtendedPrice":6.75,"Label":"","Requests":"","DisplayText":"1 x #2 BIG JOHN®","DisplayPrice":"6.75","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3888","SelectedAnswerId":"23216","SelectedAnswerText":"French Bread","EditItem":false,"Quantity":0}]}
      },
      {
        name:"#3 TOTALLY TUNA",
        data:{"Index":"11","MenuItemId":"3690","MenuItemText":"#3 TOTALLY TUNA®","Quantity":1,"SelectedSize":"Regular","BasePrice":6.75,"ExtendedPrice":6.75,"Label":"","Requests":"","DisplayText":"1 x #3 TOTALLY TUNA®","DisplayPrice":"6.75","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3888","SelectedAnswerId":"23216","SelectedAnswerText":"French Bread","EditItem":false,"Quantity":0}]}
      },
      {
        name:"#4 TURKEY TOM",
        data:{"Index":"12","MenuItemId":"3691","MenuItemText":"#4 TURKEY TOM®","Quantity":1,"SelectedSize":"Regular","BasePrice":6.75,"ExtendedPrice":6.75,"Label":"","Requests":"","DisplayText":"1 x #4 TURKEY TOM®","DisplayPrice":"6.75","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3888","SelectedAnswerId":"23216","SelectedAnswerText":"French Bread","EditItem":false,"Quantity":0}]}
      },
      {
        name:"#5 VITO",
        data:{"Index":"13","MenuItemId":"3692","MenuItemText":"#5 VITO®","Quantity":1,"SelectedSize":"Regular","BasePrice":6.75,"ExtendedPrice":6.75,"Label":"","Requests":"","DisplayText":"1 x #5 VITO®","DisplayPrice":"6.75","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3888","SelectedAnswerId":"23216","SelectedAnswerText":"French Bread","EditItem":false,"Quantity":0}]}
      },
      {
        name:"#6 VEGETARIAN",
        data:{"Index":"14","MenuItemId":"3693","MenuItemText":"#6 VEGETARIAN","Quantity":1,"SelectedSize":"Regular","BasePrice":6.75,"ExtendedPrice":6.75,"Label":"","Requests":"","DisplayText":"1 x #6 VEGETARIAN","DisplayPrice":"6.75","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3888","SelectedAnswerId":"23216","SelectedAnswerText":"French Bread","EditItem":false,"Quantity":0}]}
      },
      {
        name:"J.J.B.L.T.",
        data:{"Index":"15","MenuItemId":"3694","MenuItemText":"J.J.B.L.T®","Quantity":1,"SelectedSize":"Regular","BasePrice":6.75,"ExtendedPrice":6.75,"Label":"","Requests":"","DisplayText":"1 x J.J.B.L.T®","DisplayPrice":"6.75","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3888","SelectedAnswerId":"23216","SelectedAnswerText":"French Bread","EditItem":false,"Quantity":0}]}
      },
      {
        name:"#7 GOURMET SMOKED HAM CLUB",
        data:{"Index":"16","MenuItemId":"3701","MenuItemText":"#7 GOURMET SMOKED HAM CLUB","Quantity":1,"SelectedSize":"Regular","BasePrice":7.75,"ExtendedPrice":7.75,"Label":"","Requests":"","DisplayText":"1 x #7 GOURMET SMOKED HAM CLUB French Bread\r\n","DisplayPrice":"7.75","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"2944","SelectedAnswerId":"23216","SelectedAnswerText":"French Bread","EditItem":false,"Quantity":0}]}
      },
      {
        name:"#8 BILLY CLUB",
        data:{"Index":"17","MenuItemId":"3702","MenuItemText":"#8 BILLY CLUB®","Quantity":1,"SelectedSize":"Regular","BasePrice":7.75,"ExtendedPrice":7.75,"Label":"","Requests":"","DisplayText":"1 x #8 BILLY CLUB® French Bread\r\n","DisplayPrice":"7.75","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"2944","SelectedAnswerId":"23216","SelectedAnswerText":"French Bread","EditItem":false,"Quantity":0}]}
      },
      {
        name:"#9 ITALIAN NIGHT CLUB",
        data:{"Index":"18","MenuItemId":"3703","MenuItemText":"#9 ITALIAN NIGHT CLUB®","Quantity":1,"SelectedSize":"Regular","BasePrice":7.75,"ExtendedPrice":7.75,"Label":"","Requests":"","DisplayText":"1 x #9 ITALIAN NIGHT CLUB® French Bread\r\n","DisplayPrice":"7.75","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"2944","SelectedAnswerId":"23216","SelectedAnswerText":"French Bread","EditItem":false,"Quantity":0}]}
      },
      {
        name:"#10 HUNTERS CLUB",
        data:{"Index":"19","MenuItemId":"3704","MenuItemText":"#10 HUNTER'S CLUB®","Quantity":1,"SelectedSize":"Regular","BasePrice":7.75,"ExtendedPrice":7.75,"Label":"","Requests":"","DisplayText":"1 x #10 HUNTER'S CLUB® French Bread\r\n","DisplayPrice":"7.75","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"2944","SelectedAnswerId":"23216","SelectedAnswerText":"French Bread","EditItem":false,"Quantity":0}]}
      },
      {
        name:"#11 COUNTRY CLUB",
        data:{"Index":"20","MenuItemId":"3705","MenuItemText":"#11 COUNTRY CLUB®","Quantity":1,"SelectedSize":"Regular","BasePrice":7.75,"ExtendedPrice":7.75,"Label":"","Requests":"","DisplayText":"1 x #11 COUNTRY CLUB® French Bread\r\n","DisplayPrice":"7.75","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"2944","SelectedAnswerId":"23216","SelectedAnswerText":"French Bread","EditItem":false,"Quantity":0}]}
      },
      {
        name:"#12 BEACH CLUB",
        data:{"Index":"21","MenuItemId":"3706","MenuItemText":"#12 BEACH CLUB®","Quantity":1,"SelectedSize":"Regular","BasePrice":7.75,"ExtendedPrice":7.75,"Label":"","Requests":"","DisplayText":"1 x #12 BEACH CLUB® French Bread\r\n","DisplayPrice":"7.75","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"2944","SelectedAnswerId":"23216","SelectedAnswerText":"French Bread","EditItem":false,"Quantity":0}]}
      },
      {
        name:"#13 VEGGIE CLUB",
        data:{"Index":"22","MenuItemId":"3707","MenuItemText":"#13 GOURMET VEGGIE CLUB®","Quantity":1,"SelectedSize":"Regular","BasePrice":7.75,"ExtendedPrice":7.75,"Label":"","Requests":"","DisplayText":"1 x #13 GOURMET VEGGIE CLUB® French Bread\r\n","DisplayPrice":"7.75","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"2944","SelectedAnswerId":"23216","SelectedAnswerText":"French Bread","EditItem":false,"Quantity":0}]}
      },
      {
        name:"#14 BOOTLEGGERS CLUB",
        data:{"Index":"23","MenuItemId":"3730","MenuItemText":"#14 BOOTLEGGERS CLUB®","Quantity":1,"SelectedSize":"Regular","BasePrice":7.75,"ExtendedPrice":7.75,"Label":"","Requests":"","DisplayText":"1 x #14 BOOTLEGGERS CLUB® French Bread\r\n","DisplayPrice":"7.75","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"2944","SelectedAnswerId":"23216","SelectedAnswerText":"French Bread","EditItem":false,"Quantity":0}]}
      },
      {
        name:"#15 CLUB TUNA",
        data:{"Index":"24","MenuItemId":"3709","MenuItemText":"#15 CLUB TUNA®","Quantity":1,"SelectedSize":"Regular","BasePrice":7.75,"ExtendedPrice":7.75,"Label":"","Requests":"","DisplayText":"1 x #15 CLUB TUNA® French Bread\r\n","DisplayPrice":"7.75","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"2944","SelectedAnswerId":"23216","SelectedAnswerText":"French Bread","EditItem":false,"Quantity":0}]}
      },
      {
        name:"#16 CLUB LULU",
        data:{"Index":"25","MenuItemId":"3710","MenuItemText":"#16 CLUB LULU®","Quantity":1,"SelectedSize":"Regular","BasePrice":7.75,"ExtendedPrice":7.75,"Label":"","Requests":"","DisplayText":"1 x #16 CLUB LULU® French Bread\r\n","DisplayPrice":"7.75","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"2944","SelectedAnswerId":"23216","SelectedAnswerText":"French Bread","EditItem":false,"Quantity":0}]}
      },
      {
        name:"#17 ULTIMATE PORKER",
        data:{"Index":"26","MenuItemId":"3844","MenuItemText":"#17 ULTIMATE PORKER™","Quantity":1,"SelectedSize":"Regular","BasePrice":7.75,"ExtendedPrice":7.75,"Label":"","Requests":"","DisplayText":"1 x #17 ULTIMATE PORKER™ French Bread\r\n","DisplayPrice":"7.75","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"2944","SelectedAnswerId":"23216","SelectedAnswerText":"French Bread","EditItem":false,"Quantity":0}]}
      },
      {
        name:"THE J.J. GARGANTUAN",
        data:{"Index":"27","MenuItemId":"3711","MenuItemText":"The J.J. Gargantuan®","Quantity":1,"SelectedSize":"Regular","BasePrice":9.75,"ExtendedPrice":9.75,"Label":"","Requests":"","DisplayText":"1 x The J.J. Gargantuan®","DisplayPrice":"9.75","FavoriteName":"","ItemCost":0,"MustEdit":false,"IsQuantityFixed":false,"IsSizeFixed":false,"IsPriceFixed":false,"CanDelete":true,"CanEdit":true,"IsMainCouponItem":false,"CouponReference":"","RewardNotes":"","IsSubOrder":false,"SubOrderId":0,"NoMayo":false,"ConfirmedSprouts":false,"Modifiers":[{"GroupId":"3991","SelectedAnswerId":"23216","SelectedAnswerText":"French Bread","EditItem":false,"Quantity":0}]}
      }
    ];


    var menu = {};
    menu.sides = sides;
    menu.drinks = drinks;
    menu.sandwiches = sammies;

    return menu;
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
  },


  get_lat_long: function(address, callback) {

  }
};
module.exports = JJ;
