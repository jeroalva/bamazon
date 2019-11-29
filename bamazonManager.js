var mysql = require("mysql");
const cTable = require('console.table');
var inquirer = require("inquirer");
var arrayItems = [];
var parsedArrayItems = [];
var arrayDepartments = [];
var parsedArrayDepartments = [];

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
    allItems();
});

var displayAll = function(){
    console.log("\n");
    var query = connection.query(
        "SELECT item_id AS \"Item Id\", product_name AS \"Product name\", price AS \"Price\", stock_quantity AS \"Stock quantity\" FROM products",
        function(err,res){
            if (err) throw err;
            console.table(res);
            allDepartments(parsedArrayItems);
        }
    );
}

var lowInventory = function(){
    connection.query(
        "SELECT item_id AS \"Item Id\", product_name AS \"Product name\", stock_quantity AS \"Stock quantity\" FROM products WHERE stock_quantity < 5",
        function(err,res){
            if (err) throw err;
            console.table(res);
            allDepartments(parsedArrayItems);
        }
    );
}

var allItems = function(){
    connection.query(
        "SELECT product_name FROM products",
        function(err,res){
            if (err) throw err;
            // console.table(res);
            arrayItems = res;
            for (let i=0;i<arrayItems.length;i++){
                parsedArrayItems.push(arrayItems[i].product_name)
            }
            allDepartments(parsedArrayItems);
        }
    );
}

var allDepartments = function(parsedArrayItems){
    connection.query(
        "SELECT DISTINCT department_name FROM products",
        function(err,res){
            if (err) throw err;
            arrayDepartments = res;
            for (let i=0;i<arrayDepartments.length;i++){
                parsedArrayDepartments.push(arrayDepartments[i].department_name)
            }
            inquireFunction(parsedArrayItems,parsedArrayDepartments);
        }
    );
}

function updateProduct(productName,qtyToAdd) {
    connection.query(
        "SELECT item_id, product_name, stock_quantity FROM products WHERE product_name = \"" + productName + "\"",
        function(err,results){
            if (err) throw err;
            var query = connection.query(
                "UPDATE products SET stock_quantity = " + (parseFloat(results[0].stock_quantity) + parseFloat(qtyToAdd)) + "  WHERE product_name = \"" + productName + "\"",
                function(err, res) {
                  if (err) throw err;
                  console.log(res.affectedRows + " products updated!\n");
                }
              );
            allItems();
        }
    );
  }

  function newProduct(name,department,price,stock) {
    console.log("Inserting a new product...\n");
    var query = connection.query(
      "INSERT INTO products SET ?",
      {
        product_name: name,
        department_name: department,
        price: price,
        stock_quantity: stock
      },
      function(err, res) {
        if (err) throw err;
        console.log(res.affectedRows + " product inserted!\n");
        allItems();
      }
    );
  }

var inquireFunction = function(parsedArrayItems,parsedArrayDepartments){
    inquirer
    .prompt([
        {
            type: "list",
            name: "whatToDo",
            message: "What do you want to do: ",
            choices: [
                "View Products for Sale",
                "View Low Inventory",
                "Add to inventory",
                "Add new Product",
                "Quit"
            ]
        }
    ]).then(function(data){
        switch(data.whatToDo){
            case "View Products for Sale":
                displayAll();
                break;
            case "View Low Inventory":
                lowInventory();
                break;
            case "Add to inventory":
                inquirer
                .prompt([
                    {
                        type: "list",
                        name: "productToUpdate",
                        message: "What's the name of the product that you'd like to update: ",
                        choices: parsedArrayItems
                    },
                    {
                        name: "quantityToAdd",
                        message: "How many items to you want to add or substract to the stock: "
                    }
                ]).then(function(data){
                    updateProduct(data.productToUpdate,data.quantityToAdd);
                })
                break;
            case "Add new Product":
                inquirer
                .prompt([
                    {
                        name: "nameOfProduct",
                        message: "What is the name of the product that you want to add?"
                    },
                    {
                        type: "list",
                        name: "departmentOfProduct",
                        message: "What department do you want to add it to?",
                        choices: parsedArrayDepartments
                    },
                    {
                        name: "priceOfProduct",
                        message: "What is the price for the product?"
                    },
                    {
                        name: "initialStock",
                        message: "What's the initial stock for this product?"
                    }
                ]).then(function(data){
                    newProduct(data.nameOfProduct,data.departmentOfProduct,data.priceOfProduct,data.initialStock);
                })
                break;
            case "Quit":
                process.exit();
        }
    })
}
