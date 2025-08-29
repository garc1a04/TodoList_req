const taskInput = document.querySelector("[data-js-task-input]");
const taskButton = document.querySelector("[data-js-task-button]");
const taskList = document.querySelector("[data-js-task-list]");
const deleteTasksButton = document.querySelector("[data-js-delete-tasks-button]");
const remainingTasks = document.querySelector("[data-js-remaining-tasks]");

taskButton.addEventListener("click",AddTask);
taskButton.addEventListener("keydown", (event) => {if (event.key === 'Enter' || event.key === ' '){AddTask()}});
taskInput.addEventListener("keydown", (event) => {if (event.key === 'Enter') {AddTask()}});
taskInput.addEventListener("input", count_caracter);
taskInput.addEventListener("input", clearErr);
deleteTasksButton.addEventListener("click",RemoveAllTasks);

let taskNumber = 1;
var tasks = [];

//localStorage.removeItem("tasks"); CASO SEJA NECESSÁRIO APAGAR AS TAREFAS, APENAS COLE ESSE COMANDO!

if(localStorage.getItem("tasks") != undefined){
    tasks = JSON.parse(localStorage.getItem("tasks"));
}

function count_caracter() {
    const caracter = document.querySelector("#input_counter");
    let maxChar = 100;
    let valor = maxChar - taskInput.value.length
    caracter.textContent = valor

    if(valor == 0) {
        caracter.classList.add("end");
        return;
    }

    caracter.classList.remove("end");
}

function clearInput(){
    taskInput.value = ""
}

function AddTask() {
    const taskText = taskInput.value.trim();
    clearInput();
    count_caracter();

    if(taskText == ""){
        errorTask("Não pode adicionar tarefas vazias");
        return;
    }

    if(taskNumber == 11){
        taskInput.disabled = true;
        errorTask("Não pode adicionar mais que 10 tarefas!");
        return;
    }

    clearErr();

    let novaTarefa = document.createElement("li");
    novaTarefa.id = `${taskNumber}`;
    novaTarefa.className = "main_list__task";
    novaTarefa.innerHTML =  `
                            <label class="main_list_task__label">
                                <input class="label__do" type="checkbox" data-js-checkbox>
                                <span class="label__text_task">
                                 ${taskText[0].toUpperCase() + taskText.substring(1,taskText.length)}
                                </span>
                            </label>
    
                            <button id="edit_${taskNumber}" class="edit_task" aria-label="edit task" data-js-edit-task-button>
                                <img src="assets/edit-text.png" alt="edit">
                            </button>

                            <button id="${taskNumber}" class="delete_task" aria-label="Delete task" data-js-delete-task-button>
                                <img src="assets/cancel.png" alt="delete">
                            </button>
                            `

    const checkbox = novaTarefa.querySelector("[data-js-checkbox]")
    checkbox.addEventListener("click",UpdateRemainingTasks)
    taskList.appendChild(novaTarefa);

    const deleteTaskButton = novaTarefa.querySelector("[data-js-delete-task-button]");
    deleteTaskButton.addEventListener("click", () =>
        RemoveTask(novaTarefa)
    );

    remainingTasks.textContent = `Tarefas restantes: ${taskList.childElementCount}`
    
    tasks.push({
        texto: taskText,
        checked: false
    });

    //addInLocalStorage(tasks);

    UpdateRemainingTasks()
    taskNumber++;
}

function RemoveTask(task) {
    task.remove();
    tasks.slice(task.id, task.id)
    //addInLocalStorage(tasks);

    taskNumber--;
    UpdateRemainingTasks()
}

function RemoveAllTasks() {
    if(!taskList.hasChildNodes()) {
        errorTask("Não há tarefas");
        return;
    }

    taskNumber = 1;
    tasks = [];
    //addInLocalStorage(tasks);
    
    while(taskList.lastChild){
        taskList.lastChild.remove()
    }

    UpdateRemainingTasks()
}

function UpdateRemainingTasks(){
    const checkboxes = taskList.getElementsByClassName("label__do");
    let checkedTasks = 0;

    for(i = 0; i < checkboxes.length; i++){

        if(checkboxes[i].checked){
            tasks[i].checked = true;
            checkedTasks++;
            continue;
        }

        tasks[i].checked = false;
    }

    if(checkedTasks <= 10) {
        taskInput.disabled = false;
        clearErr();
    }

    //addInLocalStorage(tasks);
    remainingTasks.textContent = `Tarefas restantes: ${taskList.childElementCount - checkedTasks}`
}

function errorTask(err) {
    const error = document.querySelector("#err");
    error.classList.remove("hidden");
    error.textContent = err;
}

function clearErr() {
    const error = document.querySelector("#err");
    error.classList.add("hidden");
}

function addInLocalStorage(tasks){
    localStorage.setItem("tasks", JSON.stringify(tasks));
}
