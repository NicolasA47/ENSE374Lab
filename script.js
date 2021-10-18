$(document).ready( () => { 
    let addBtn = document.getElementById("add-btn");
    let sortBtn = document.getElementById("sort-btn");
    let inputField =  document.getElementById("input-text");
    let list = document.getElementById("dyn-list");
    let inputArray = [];
    let counter = 0;
    
    function generateListElement()
    {
        let div = document.createElement("div");
        div.setAttribute('class', 'input-group mx-auto mb-2 w-50 list-element');
        div.setAttribute('id', `list-item-${counter}`);
        
        let input = document.createElement("input");
        input.setAttribute('type', 'text');
        input.setAttribute('value', inputField.value);
        input.setAttribute('readonly', 'true');
        input.setAttribute('class', 'form-control list-element');
        input.setAttribute('style', 'box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2); margin-top:5px;');
        div.appendChild(input);
        list.appendChild(div);
       
        
      
        let sortObject = {
            id : `list-item-${counter}`,
            value : inputField.value
        }   
        inputArray.push(sortObject);
        inputField.value = "";
        counter++;
        
    }
    function sortList(){
        function compare( a, b ) {
            if ( a.value < b.value ){
              return -1;
            }
            if ( a.value > b.value ){
              return 1;
            }
            return 0;
        }
        inputArray.sort(compare);//
        console.log(inputArray); //
        inputArray.forEach(input => {
            list.appendChild(document.getElementById(input.id));
        });
    }
    
    addBtn.addEventListener('click', generateListElement);
    sortBtn.addEventListener('click', sortList);
   });
   
