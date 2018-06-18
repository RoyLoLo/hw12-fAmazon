
var mysql = require(`mysql`);
var inquirer = require(`inquirer`)
var invdata = [];
var available;
var quantity;
var itemindex;
var connection = mysql.createConnection({
  host: `localhost`,
  port: 3306,
  user: `root`,
  password: ``,
  database: `famazon_db`
});

choice = () => {
  inquirer.prompt([{
    type: `list`,
    name: `choice`,
    message: `who are you?`,
    choices: [`Customer`,`Quitter`,``]
  }]).then(function (ans) {
    if (ans.choice === ``) {
      adminEnter();
    } else if (ans.choice === `Customer`) {
      customerEnter();
    } else {
      console.log(`Goodbye`);
      connection.end();
    };
  });
}; //end choice()

adminEnter = () => {
  inquirer.prompt([{
    type: `password`,
    name: `pw`,
    message: `You Have 1 try to enter a password`
  }]).then(function (ans) {
    if (ans.pw === `admin1`) {
      admin();
    } else {
      console.log(`Incorrect Password... Please try again`);
      connection.end();
    };
  });
}; //end adminEnter()

admin = () => {
  inquirer.prompt([{
    type: `list`,
    name: `admin`,
    message: `What would you like to do`,
    choices: [`Add New Item`, `Remove Item`, `Edit Inventory`, `Enter the Store`]
  }]).then(function (ans) {
    if (ans.admin === `Add New Item`) {
      adminadd();
      console.log(`New item added.`);
    } else if (ans.admin === `Remove Item`) {
      displayitems();
      admindelete();
      console.log(`remove an item`);
      adminEnter();
    } else if (ans.admin === `Edit Inventory`) {
      displayitems();  
      inquirer.prompt([
          {
            type : `list`,
            name : `selectedit`,
            message : `What do you want to edit?`,
            choices :[`price`,'stock',`product_name`,`product_mfg`,`department_name`]
          },
          {
            type : `input`,
            name : `itemedit`,
            message : `Select item to edit by id number.`
          },
          {
            type : `input`,
            name : `newchange`,
            message : `Enter the new value`
          }
        ]).then(function(ans){
          if (ans.selectedit === `price` || ans.selectedit === `stock`){
              let newchange = parseInt(ans.newchange);
          }
          else{
              let newchange = ans.newchange;
          };
          updatedb(ans.itemedit,ans.selectedit,newchange)
        })//end Edit inventory
      console.log(`update inventory`);
      adminEnter();
    } else {
      customerEnter();
    };
  });
} //end admin()

adminadd = () => {
   inquirer.prompt([{
       type: `input`,
       name: `item`,
       message: `enter a new product.`,
     },
     {
       type: `input`,
       name: `stock`,
       message: `Please enter the stock quantity.`
     },
     {
       type : `input`,
       name : `dept`,
       message : `Please enter the department.` 
     },
     {
      typer : `input`,
      name : `mfg`,
      message : `Please enter the manufacturer of the item.`
     },
     {
       type : `input`,
       name : `price`,
       message : `Please enter a price for the item.`
     }
   ]).then(function (ans) {
      connection.query(`INSERT INTO prodcuts SET ?`,
      {
          product_name : ans.item,
          product_mfg : ans.mfg,
          department_name :ans.dept,
          price : ans.price,
          stock : ans.stock
      },
        function(err,res){
        console.log(`Item Inserted into database.`)
          dispalyitem();
          adminEnter();
      })
     //add item function
   })
};//end adminadd()

admindelete = () => {

  inquirer.prompt([
  {
    type : `input`,
    name : `delete`,
    message : `Select which item you want to delete`
  }
]).then(function(ans){
  let itemtodelete = ans.delete;
        inquirer.prompt([
          {
            input : `confirm`,
            name : `confirmdelete`,
            message : `Are You sure you want to Delete`
          }
        ]).then(function(ans){
          if (ans.confirmdelete){
            connection.query(`DELETE FROM products WHERE ?`,
              {
                item_id: itemtodelete
              },
              function (err, res) {

              })
          }
          else{
            admin();
          };
        });
});
};//end admindelete()

customerEnter = () => {
  inquirer.prompt([{
    type: `confirm`,
    name: `continue`,
    message: `would you like to purchase something?`
  }]).then(function (ans) {
    if (!ans.continue) {
      console.log(`Thank You for visiting fAmazon, come again soon.`)
      connection.end();
    } else {
      displayitems();
      customer();
    } //end else
  }); //end outter inquirer.prompt
}; //end customerEnter()

customer = () => { 
  inquirer.prompt([{
      type: `input`,
      name: `buy`,
      message: `Please enter the Item Number of what you would like to purchase.`
    },
    {
      type: `input`,
      name: `quant`,
      message: `How many would you like`,
    }
  ]).then(function (ans) {
    finditemindex(ans);
    if (available < parseInt(ans.quant)) {
      console.log(`You have ordered more than stocked, Please return and order ${available} or less.`)
      customerEnter()
    }else if(ans.buy === `admin1` && ans.quant === `admin1`){
      adminEnter();
    } else {  
      inquirer.prompt([{
        type: `confirm`,
        name: `confirm`,
        message: `\nYour total is: ${invdata[itemindex].price * ans.quant} 
                  \nYou orderd: ${ans.quant} ${invdata[itemindex].product_name}
                  \nWould you like to proceed`
      }]).then(function (ans) {
        if (ans.confirm) {
          updatedb(invdata[itemindex].item_id, `stock`, (invdata[itemindex].stock - parseInt(quantity)));
          console.log(`Your order has been successfully placed!
                      \nThank for shopping at fAmazon.`);
        } else {
          console.log(`Your Order has been canceled.`);
          customerEnter();
        }; //end else
      }) // .then
    } //end outter else
  }); //end of inner inquirer.promt
}; //end customer()

displayitems = () => {
  connection.query(`Select * FROM products`, function (err, res) {
    if (err) throw err;
    invdata = res;
    for (i = 0; i < res.length; i++) {
      console.log(`Item#: ${res[i].item_id} || Item: ${res[i].product_name} || Price: $${res[i].price}`);
      console.log(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`)
    }; //end for loop
    //customer();
  }); //end .query
}; //end display()

finditemindex = (ans) => {
  for (j = 0; j < invdata.length; j++) {
    if (invdata[j].item_id === parseInt(ans.buy)) {
      itemindex = j;
      available = invdata[j].stock;
      quantity = ans.quant;
    } //end if 
  } //end for loop j
}; //end finditemindex();

updatedb = (whatid, tochange, newchange) => {
  connection.query(`UPDATE products SET ? WHERE ?`, 
  [
    {
      [tochange]: newchange
    },
    {
      item_id: whatid
    }
  ], 
  function(err, res) {
    console.log(res);
    console.log(whatid,tochange,newchange);
    customerEnter();
  
  });
} //end updatedb()


//this starts the app in node
connection.connect(function (err) {
  if (err) throw err;
  choice();
});

