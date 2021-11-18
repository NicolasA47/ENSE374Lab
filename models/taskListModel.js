const mongoose = require( "mongoose" );

const taskItemSchema = new mongoose.Schema ({
    _id : Number,
    taskText: String,
    taskState: String,
    taskCreator: String,
    isTaskClaimed: Boolean,
    claimingUser:  String,
    isTaskDone: Boolean,
    isTaskCleared: Boolean
});
const taskItem = mongoose.model ( "taskItem", taskItemSchema ); 

module.exports = taskItem;