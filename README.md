
# Jimmy John's - The Unofficial API

```
npm install Jimmy-Johns
```

## Get Food:

```js
var jj = require('Jimmy-Johns');

var menu = jj.get_menu();
var order_items = (menu.sandwiches[0]).data;

var user_data = {}; //eek! see below for the long story.

jj.order(user_data, order_items, function(success, error) {
  if (!error) {
    console.log("SANDWICH EN ROUTE");
  }
});
```

## That "user_data" Object
Basically, make an object that looks like this:
```js
var user_data = {
  email:"your@email.com", //your Jimmy John's account email
  password:"password",    //your Jimmy John's account password
  first_name:"NAME",
  last_name:"NAME",
  phone:"444-444-4444",
  tip_amount:"2",         //Tip amount (in dollars)
  location_id:1106,       //More on this below
  is_test:true,
  verbose:true,
  address: {
    line1: "123 W Apple Street",
    line2: "",
    city: "Little Rock",
    state: "NY",
    zipcode:"90501",
    longitude:-100.1692740, //These should be YOUR lat/long
    latitude:60.0719220
  },
  payment_info: {
    exp_month:"01",
    exp_year:2001,
    cvv:123
  }
}
```

#### A bit more explanation
You'll notice the credit card information is absent. Currently, you'll have to save a credit card on your JJ account in order for this to work :/

| Parameter       | Explanation                                                        |
| -------------   |--------------------------------------                             |
| *location_id*   | This is a unique identifier given to each Physical JJ store. Basically, it's the ID of the closest JJ to you. [Find yours.](#Getting Your Location ID) |
| *is_test*       | If ```true```, the final request will abort before being confirmed. Good for just testing :)    |
| *verbose *      | If ```true```, you'll get a deeper look into the steps/progress. Good for debugging :D           |


## What Can I Order?
**Get The Menu:**  
I don't have access to the official JJ database, but I do have a pretty solid list of what they offer. You can see the menu by doing this:
```js
var menu = jj.get_menu();
//returns:
//  menu.sandwiches
//  menu.drinks
//  menu.sides
```
Why am I telling you this? Because you'll need to pass one or more of these objects in as the *"order_items"* parameter!  
**Note:** You'll notice each menu item has been given a name. Don't pass this into the order function. Only use the data object like so:
```js
var menu = jj.get_menu();

var sandwich = menu.sandwiches[0]; // get a specific sandwich
var data = sandwich.data; // get the JJ-item data

var order_items = [];
order_items.push(data);

//now, you can pass your "order_items" to the order function
```




## Getting Your Location ID
```js
var location = {latitude: 60.0719220, longitude: -100.1692740};
var location_ids = get_store_ids: function(location, function(success, error, store_ids){
  if (!error) {
    console.log(store_ids);
  }
});
```
