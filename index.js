const express = require ( "express" );

// this is a canonical alias to make your life easier, like jQuery to $.
const app = express();
const fs = require('fs');

app.set("view engine", "ejs");



// a common localhost test port
const port = 3000; 

// Simple server operation
app.use(express.urlencoded({ extended: true}));
app.use(express.static("public"));
const todoListRaw = fs.readFileSync("taskList.json");

function loadList(){
let todoList = JSON.parse(todoListRaw);

return todoList;
}


app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
    // fs.writeFile(__dirname + "/userList.json", JSON.stringify(userData), function(err){
    //     if(err){
    //         console.log("error");
    //     }
    //     else console.log("pushed User List");
    // });
    // fs.writeFile(__dirname + "/taskList.json", JSON.stringify(tasks), function(err){
    //     if(err){
    //         console.log("error");
    //     }
    //     else console.log("pushed Tasks List");
    // });
});

app.post("/todo", (req, res) => {
    let todoList = loadList();
    fs.readFile(__dirname + "/userList.json", 'utf-8', (err, data) =>{
        valid = false;
        if (err) {
            console.log(`Error reading file from disk: ${err}`);
        } 
        else {
            const userData = JSON.parse(data);
            for(let entry of userData){
                if((entry.username === req.body.Email)&&(entry.password === req.body.Password)){
                    console.log("match");
                    res.render("todo", 
                    {
                        user: entry,
                        taskList: todoList
                    });

                    valid = true;
                    break;
                }
                else {
                    console.log("nope");
                }    
            };      
            if (valid === false){
                res.redirect("/");
            }
        }   
    })
});

app.post("/signup", (req, res) => {
    if(req.body.Authentication == "todo2021")
    {
        addUser(req.body.EmailSu, req.body.PasswordSu);
        console.log("success");
        res.redirect("/");
    }
    else{
        console.log("failure");
    }
});

app.listen (port, () => {
    console.log (`Server is running on http://localhost:${port}`);
});

app.post("/claim", (req, res) => {
    let todoList = loadList();
    let currentUser = req.body.user;
    claimTask(req.body.taskId, currentUser, todoList);
    res.render("todo", {
        user: currentUser,
        taskList: todoList
    });
});

app.post("/abandon", (req, res) => {
    let todoList = loadList();
    let currentUser = req.body.user;
    if(req.body.checkbox){
        completeTask(req.body.taskId, todoList);
    }
    else{
        abandonTask(req.body.taskId, todoList);
    }
    res.render("todo", {
        user: currentUser,
        taskList: todoList
    });
});

app.post("/finished", (req, res) => {
    let todoList = loadList();
    let currentUser = req.body.user;
    completeTask(req.body.taskId, todoList);
    res.render("todo", {
        user: currentUser,
        taskList: todoList
    });
});

app.post("/remove", (req, res) => {
    let todoList = loadList();
    let currentUser = req.body.user;
    removeComplete(todoList);
    res.render("todo", {
        user: currentUser,
        taskList: todoList
    });
});

app.post("/addTask", (req, res) => {
    let todoList = loadList();
    addTask(req.body.inputText, req.body.user, todoList);
    res.render("todo", {
        user: req.body.user,
        taskList: todoList
    });
});


function addUser(username, password){
    //get user list
    fs.readFile(__dirname + "/userList.json", 'utf-8', (err, data) =>{
        if (err) {
            console.log(`Error reading file from disk: ${err}`);
        } 
        else {
            const userData = JSON.parse(data);
    //parse into obj
    //push new user
    userData.push({username, password});
    //stringify and send back to json file
    fs.writeFile(__dirname + "/userList.json", JSON.stringify(userData), function(err){
            if(err){
                console.log("error");
            }
            else console.log("pushed new user to List");
        });
        }
    });
}

function addTask(taskText, taskCreator, todoList){
    let newId = todoList.length;
    todoList.push(
        {
            "_id": newId,
            "taskText": taskText,
            "taskState": "unclaimed",
            "taskCreator": taskCreator,
            "isTaskClaimed": false,
            "claimingUser":  { username: "", password: "" },
            "isTaskDone": false,
            "isTaskCleared": false
        });
    fs.writeFile(__dirname + "/taskList.json", JSON.stringify(todoList), function(err){
        if(err){
            console.log("error");
        }
        else {
            console.log("pushed new task");
        }
    });
}

function claimTask(id, currentUser, todoList){
    todoList[id].taskState = "claimed";
    todoList[id].isTaskClaimed = true;
    todoList[id].claimingUser = currentUser;
    fs.writeFile(__dirname + "/taskList.json", JSON.stringify(todoList), function(err){
        if(err){
            console.log("error");
        }
        else {
            console.log(`${currentUser} claimed new task`);
        }
    });
}

function abandonTask(id, todoList){
    todoList[id].taskState = "unclaimed";
    todoList[id].isTaskClaimed = false;
    todoList[id].claimingUser = { username: "", password: "" };
    fs.writeFile(__dirname + "/taskList.json", JSON.stringify(todoList), function(err){
        if(err){
            console.log("error");
        }
        else {
            console.log(`abandoned a task`);
        }
    });
}
function completeTask(id, todoList){
  
    if(!todoList[id].isTaskDone){
        todoList[id].taskState = "finished";
        todoList[id].isTaskDone = true;
    }
    else{
        todoList[id].taskState = "claimed";
        todoList[id].isTaskDone = false;
    }
    fs.writeFile(__dirname + "/taskList.json", JSON.stringify(todoList), function(err){
        if(err){
            console.log("error");
        }
        else {
            console.log(`finished a task`);
        }
    });
}
function removeComplete(todoList){
    todoList.forEach(function callback(value, index){
        if(value.isTaskDone){
            todoList.splice(index, 1); 
        }
    });
    fs.writeFile(__dirname + "/taskList.json", JSON.stringify(todoList), function(err){
        if(err){
            console.log("error");
        }
        else {
            console.log(`finished a task`);
        }
    });
}



