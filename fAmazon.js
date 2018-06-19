
const mysql = require(`mysql`);
const inquirer = require(`inquirer`);
const chalk = require("chalk");
let invdata = [];
let available;
let quantity;
let itemindex;
let onlist;
let newchange;
let connection = mysql.createConnection({
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
      console.clear();
    };
  });
}; //end choice()

adminEnter = () => {
  inquirer.prompt([{
    type: `password`,
    name: `pw`,
    message: `You Have 1 try to enter a password`
  }]).then(function (ans) {
    if (ans.pw !== `admin1`) {
      console.log(chalk.red(`Incorrect Password... Please try again`)); 
      console.clear();
      choice();
    } else {
      admin();
      
    };
  });
}; //end adminEnter()

admin = () => {
  inquirer.prompt([{
    type: `list`,
    name: `admin`,
    message: `What would you like to do`,
    choices: [`Add New Item`, `Remove Item`, `Edit Inventory`, `Enter the Store (to quit)`]
  }]).then(function (ans) {
    if (ans.admin === `Add New Item`) {
      adminadd();
    } else if (ans.admin === `Remove Item`) {
      displayitems(admindelete);
      console.log(`remove an item`);
    } else if (ans.admin === `Edit Inventory`) {
      displayitems(adminedit);  
      updateadmin();
      console.clear()
      console.log(`update inventory`);
      adminEnter();
    } else{
      choice();
  };
  });
} //end admin()

adminedit = () =>{
  inquirer.prompt([{
    type: `list`,
      name : `selectedit`,
      message : `What do you want to edit?`,
      choices : [`price`, 'stock', `product_name`, `product_mfg`, `department_name`]
  },
  {
    type: `input`,
    name : `itemedit`,
    message : `Select item to edit by id number.`
  },
  {
    type: `input`,
    name : `newchange`,
    message : `Enter the new value`
  }
        ]).then(function (ans) {
    console.clear();
    if (ans.selectedit === `price`) {
      newchange = (parseFloat(ans.newchange).toFixed(2));
      console.log(newchange);
    }
    else if (ans.selectedit === `stock`) {
      newchange = parseInt(ans.newchange)
    }
    else {
       newchange = ans.newchange;
    };
    updatedb(ans.itemedit, ans.selectedit, newchange)
    console.log(chalk.blue(`Your changes have been made.`))
    adminEnter();
  })//end Edit inventory

}
adminadd = () => {
   inquirer.prompt([{
       type: `input`,
       name: `product_name`,
       message: `enter a new product by name.`,
     },
     {
       type: `input`,
       name: `stock`,
       message: `Please enter the stock quantity.`
     },
     {
       type : `input`,
       name : `department_name`,
       message : `Please enter the department.` 
     },
     {
      typer : `input`,
      name : `product_mfg`,
      message : `Please enter the manufacturer of the item.`
     },
     {
       type : `input`,
       name : `price`,
       message : `Please enter a price for the item.`
     }
   ]).then(function (ans) {
    connection.query("INSERT INTO products SET ?", 
      {
          product_name : ans.product_name,
          product_mfg : ans.product_mfg,
          department_name : ans.department_name,
          price : parseInt(ans.price),
          stock : parseInt(ans.stock)
      },
        function(err,res){
          if (err) throw err;
          console.clear();
          console.log(chalk.blue(`Item Inserted into database.`));  
          admin();
      })
     //add item function
   })
};//end adminadd()

admindelete = () => {
  
  inquirer.prompt([
  {
    type : `input`,
    name : `delete`,
    message : `Select which item you want to delete by item#.`
  }
]).then(function(ans){
        
      connection.query(`DELETE FROM products WHERE item_id = ${parseInt(ans.delete)}`,
      function (err, res) {
        console.clear();
        console.log(chalk.blue("item has been deleted."));
        admin();
    });     
    });
};//end admindelete()

customerEnter = () => {
  inquirer.prompt([{
    type: `confirm`,
    name: `continue`,
    message: `Welcome to fAmazon!\nwould you like to purchase something?`
  }]).then(function (ans) {
    if (!ans.continue) {
      console.log(chalk.yellow(`Thank You for visiting fAmazon, come again soon.`));
      console.clear();
      choice();
    } else {
      displayitems(store);
    } //end else
  }); //end outter inquirer.prompt
}; //end customerEnter()

store = () => { 
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
    console.clear();
    finditemindex(ans);
    if (!onlist){
      console.clear();
      console.log(chalk.red("Your selection is not on the list, please try again."));
      displayitems(store);
    }else{
      if (available < parseInt(ans.quant)) {
        console.log(chalk.red(`You have ordered more than stocked, Please return and order ${available} or less.`));
        customerEnter()
      } else if (ans.buy === `admin1` && ans.quant === `admin1`) {
        adminEnter();
      } else {
        inquirer.prompt([{
          type: `confirm`,
          name: `confirm`,
          message: `\nYour total is:$${invdata[itemindex].price * ans.quant} 
              \nYou orderd: ${ans.quant} ${invdata[itemindex].product_name}
              \nWould you like to proceed`
        }]).then(function (ans) {
          if (ans.confirm) {
            updatedb(invdata[itemindex].item_id, `stock`, (invdata[itemindex].stock - parseInt(quantity)));
            console.log(chalk.green(`Your order has been successfully placed!
                      \nThank for shopping at fAmazon.`));
          } else {
            console.log(chalk.red(`Your Order has been canceled.`));
            customerEnter();
          }; //end inner else
        }); //end.then
      }; //end outter else
    };
    
}); //end .then
};//end store()

displayitems = (pfunc) => {
  connection.query(`Select * FROM products`, function (err, res) {
    if (err) throw err;
    invdata = res;
    for (i = 0; i < res.length; i++) {
      console.log(chalk.blue(`Item#: ${res[i].item_id} || Item: ${res[i].product_name} || Price: $${res[i].price}`));
      console.log(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`)
    }; //end for loop
    //customer();
   if(pfunc !== "undefined"){
     pfunc();
   }
  }); //end .query
}; //end display()

finditemindex = (ans) => {
  onlist = false;
  for (j = 0; j < invdata.length; j++) {
    if (invdata[j].item_id === parseInt(ans.buy)) {
      itemindex = j;
      available = invdata[j].stock;
      quantity = ans.quant;
      onlist = true;
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
   
  });
}; //end updatedb()


//this starts the app in node
connection.connect(function (err) {
 
 
  choice();


});