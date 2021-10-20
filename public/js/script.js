
    $(document).ready( () => { 
        let addBtn = $("#add-btn")
        let removeBtn = $("#remove-btn");
        let inputField =  $("#input-text");
        let list = $("#dyn-list");
        let counter = 0;
        addBtn.click(generateListElement);
        removeBtn.click(removeComplete);
     
        function generateListElement(){
            list.after(`<div class='input-group mx-auto mb-2 w-50 py-2 mb-2' id='list-item-${counter}'><input type='text' class='form-control' value='${inputField.val() }' id="list-input-${counter}" readonly><button class='input-group-text' id='list-btn-${counter}'>Claim</button></div>`);
            $(`#list-btn-${counter}`).click(claimTask);
            inputField.val("");
            counter++;
        }
    
        function claimTask(event){
            let id = event.currentTarget.id.at(-1);
            let btn = $(`#list-btn-${id}`);
            let input = $(`#list-input-${id}`);
            btn.html("Abandon");
            input.parent().removeClass("input-group py-2");
            input.parent().addClass("input-group-text px-0 py-0");
            input.before(`<input class='form-check mx-2' type='checkbox' id='list-checkbox-${id}'>`)    
            btn.click(abandonTask);
            $(`#list-checkbox-${id}`).click(completeTask);
            

        }
        function abandonTask(event){
            let id = event.currentTarget.id.at(-1);
            let btn = $(`#list-btn-${id}`);
            let input = $(`#list-input-${id}`);
            $("input").remove(`#list-checkbox-${id}`);
            btn.html("Claim");
            input.parent().addClass("input-group py-2");
            input.parent().removeClass("input-group-text px-0 py-0");
            btn.click(claimTask);

        }
        });

        function completeTask(event){
            let id = event.currentTarget.id.at(-1);
            let btn = $(`#list-btn-${id}`);
            let input = $(`#list-input-${id}`);
            let checkbox = $(`#list-checkbox-${id}`);
            btn.toggle();
            input.toggleClass("text-decoration-line-through completed");
        }
        function removeComplete(){
            $('.completed').parent().remove();
        }