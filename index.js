const express  = require( "express" );
const mongoose = require( "mongoose" );
const taskListDB = require("./models/taskListModel");
const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")
require("dotenv").config();

const app = express(); 
const port = 3000;

app.use( express.urlencoded( { extended: true} ) ); 

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use (passport.initialize());
app.use (passport.session());



app.set( "view engine", "ejs" );

mongoose.connect( 'mongodb://localhost:27017/todo', 
                 { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema ({
    username: String,
    password: String
})



userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.listen ( port, () => {
    console.log (`Server is running on http://localhost:${port}`);
});

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.post( "/register", (req, res) => {
    console.log( "User " + req.body.username + " is attempting to register" );
    User.register({ username : req.body.username }, 
                    req.body.password, 
                    ( err, user ) => {
        if ( err ) {
        console.log( err );
            res.redirect( "/" );
        } else {
            passport.authenticate( "local" )( req, res, () => {
                res.redirect( "/" );
            });
        }
    });
});
////////////////////////////////////////////////////////////////////
app.post( "/login", ( req, res ) => {
    console.log( "User " + req.body.username + " is attempting to log in" );
    const user = new User ({
        username: req.body.username,
        password: req.body.password
    });
    req.login ( user, ( err ) => {
        if ( err ) {
            console.log( err );
            res.redirect( "/" );
        } else {
            passport.authenticate( "local" )( req, res, () => {
                console.log( "was authorized and found:" );
                
                taskListDB.find()
                .then((results)=>{
                   res.redirect('/todo');
                }); 
            });
        }
    });
});


app.post("/addTask", (req, res) => {
    taskListDB.find()
    .then((todoList) =>{     
        const newTask = new taskListDB(
            {
                "_id": todoList.length,
                "taskText": req.body.inputText,
                "taskState": "unclaimed",
                "taskCreator": req.body.user,
                "isTaskClaimed": false,
                "claimingUser": "",
                "isTaskDone": false,
                "isTaskCleared": false
            });
        newTask.save();
        res.redirect('/todo');
        
    })
    .catch((err)=>{                         //if error is caught then console log the error
        console.log(err);
    });
});


app.get("/todo", (req, res) => {
        console.log(req.body.passUser);
        taskListDB.find()
        .then((todoList) =>{   
            res.render("todo", {
                user: req.body.user,
                taskList: todoList
            });
        })
        .catch((err)=>{                         //if error is caught then console log the error
            console.log(err);
        });

});



app.post("/claim", (req, res) => {
    async function claimTask(id, currentUser){
        try{
            await taskListDB.findOneAndUpdate({_id: id}, {taskState: "claimed", isTaskClaimed: true, claimingUser: currentUser});
        }
        catch(err){
            console.log(err)
        }
    }
    let currentUser = req.body.user;
    claimTask(req.body.taskId, currentUser);
    res.redirect('/todo');
});

app.post("/abandon", (req, res) => {
    async function abandonTask(id){
        try{
            await taskListDB.findOneAndUpdate({_id: id}, {taskState: "unclaimed", isTaskClaimed: false, claimingUser: ""});
        }
        catch(err){
            console.log(err)
        }
    }
    
    async function completeTask(id, todoList){
        try{
            if(!todoList[id].isTaskDone){
                await taskListDB.findOneAndUpdate({_id: id}, {taskState: "finished", isTaskDone : true});
            }
            else{
                await taskListDB.findOneAndUpdate({_id: id}, {taskState: "claimed", isTaskDone : false});
            }
        }
        catch(err){
            console.log(err)
        }
    }
    taskListDB.find()
    .then((todoList) =>{     
        let currentUser = req.body.user;
        if(req.body.checkbox){
            completeTask(req.body.taskId, todoList);
        }
        else{
            abandonTask(req.body.taskId);
        }
        res.redirect('/todo');
    })
    .catch((err)=>{                         //if error is caught then console log the error
        console.log(err);
    });
});

app.post("/finished", (req, res) => {
    async function completeTask(id, todoList){
        try{
            if(!todoList[id].isTaskDone){
                await taskListDB.findOneAndUpdate({_id: id}, {taskState: "finished", isTaskDone : true});
            }
            else{
                await taskListDB.findOneAndUpdate({_id: id}, {taskState: "claimed", isTaskDone : false});
            }
        }
        catch(err){
            console.log(err)
        }
    }
    let todoList;
    taskListDB.find()
    .then((todoList) =>{     
        let currentUser = req.body.user;
        completeTask(req.body.taskId, todoList);
        res.redirect('/todo');
    })
    .catch((err)=>{                         //if error is caught then console log the error
        console.log(err);
    });
});


////////////////////////////////////////////////////////////////////



app.post("/remove", (req, res) => {
    
    async function removeComplete(){
        try{
            await taskListDB.deleteMany({isTaskDone: true});
        }
        catch(err){
            consol.log(err);
        }
    }

    let todoList;
    taskListDB.find()
    .then((todoList) =>{     
        let currentUser = req.body.user;
        removeComplete(todoList);
        res.redirect('/todo');
    })
    .catch((err)=>{                         //if error is caught then console log the error
        console.log(err);
    });
});

app.post( "/logout", ( req, res ) => {
    console.log( "A user is logging out" );
    req.logout();
    res.redirect("/");
});



    

    // const user1 = new userDB({
    //     username:   "Chad",
    //     password:   "abc123"
    // });
    // user1.save();
    // const user2 = new userDB({
    //     username:   "Bob",
    //     password:   "321bcd"
    // });
    // user2.save();
    // const taskItem1 = new taskListDB({
    //     _id: 1,
    //     taskText:   "Do Nothing",
    //     taskState:  "unclaimed",
    //     taskCreator: "Chad",
    //     isTaskClaimed: false,
    //     claimingUser:  "",
    //     isTaskDone: false,
    //     isTaskCleared: false
    // });
    // const taskItem2 = new taskListDB({
    //     _id: 2,
    //     taskText:   "drop out of this lab",
    //     taskState:  "claimed",
    //     taskCreator: "Chad",
    //     isTaskClaimed: true,
    //     claimingUser:  "Bob",
    //     isTaskDone: false,
    //     isTaskCleared: false
    // });
    // const taskItem3 = new taskListDB({
    //     _id: 3,
    //     taskText:   "play league",
    //     taskState:  "claimed",
    //     taskCreator: "Chad",
    //     isTaskClaimed: true,
    //     claimingUser:  "Chad",
    //     isTaskDone: false,
    //     isTaskCleared: false
    // });
    // const taskItem4 = new taskListDB({
    //     _id: 4,
    //     taskText:   "eat shorts",
    //     taskState:  "claimed",
    //     taskCreator: "Chad",
    //     isTaskClaimed: true,
    //     claimingUser:  "Chad",
    //     isTaskDone: false,
    //     isTaskCleared: false
    // });
    // const taskItem5 = new taskListDB({
    //     _id: 5,
    //     taskText:   "stop drop and roll",
    //     taskState:  "finished",
    //     taskCreator: "Chad",
    //     isTaskClaimed: true,
    //     claimingUser:  "Chad",
    //     isTaskDone: true,
    //     isTaskCleared: false
    // });
    // const taskItem6 = new taskListDB({
    //     _id: 6,
    //     taskText:   "slowly descend into madness while doing adams lab",
    //     taskState:  "finished",
    //     taskCreator: "Bob",
    //     isTaskClaimed: true,
    //     claimingUser:  "Bob",
    //     isTaskDone: true,
    //     isTaskCleared: true
    // });

    // taskItem1.save();
    // taskItem2.save();
    // taskItem3.save();
    // taskItem4.save();
    // taskItem5.save();
    // taskItem6.save();




 


