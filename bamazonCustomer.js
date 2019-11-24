var mysql = require("mysql");
const cTable = require('console.table');
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Audiogalaxy1!",
  database: "bamazon_DB"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
    // displayAll();
    // buyProduct("Cofee Mug",3);
    inquireFunction();
});

var displayAll = function(){
    console.log("\n");
    var query = connection.query(
        "SELECT item_id AS \"Item Id\", product_name AS \"Product name\", department_name AS \"Department name\", price AS \"Price\", stock_quantity AS \"Stock quantity\" FROM products",
        function(err,res){
            if (err) throw err;
            console.table(res);
            inquireFunction();
        }
    );
}

var buyProduct = function(productName,qtyNeeded){
    console.log("\n");
    connection.query(
        "SELECT stock_quantity, price FROM products WHERE product_name = \"" + productName + "\"",
        function(err,res){
            if (err) throw err;
            if (parseFloat(res[0].stock_quantity) >= qtyNeeded){
                var stockActual = parseFloat(res[0].stock_quantity);
                var stockNuevo = stockActual - qtyNeeded;
                connection.query(
                    "UPDATE products SET stock_quantity = " + stockNuevo + " WHERE product_name = \"" + productName + "\"",
                    function(err, data) {
                      if (err) throw err;
                      console.log("Your order's total is: " + res[0].price * qtyNeeded + "\n \n");
                      inquireFunction();
                    }
                  );
            }
            else{
                console.log("There's not enough stock to fulfill your request!")
                inquireFunction();
            }
        }
    )
};

var inquireFunction = function(){
    inquirer
    .prompt([
        {
            type: "list",
            name: "whatToDo",
            message: "What do you want to do: ",
            choices: [
                "Check the entire list of products",
                "Buy a product",
                "Quit"
            ]
        }
    ]).then(function(data){
        switch(data.whatToDo){
            case "Check the entire list of products":
                displayAll();;
                break;
            case "Buy a product":
                inquirer
                    .prompt([
                        {
                            name: "productChosen",
                            message: "Choose a product by typing it's name"
                        },
                        {
                            name: "quantity",
                            message: "Type the quantity that you would like to purchase: "
                        }
                    ]).then(function(info){
                        buyProduct(info.productChosen,info.quantity);
                    })
                break;
            case "Quit":
                process.exit();
        }
    })
}
