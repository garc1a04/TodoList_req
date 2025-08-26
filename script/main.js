const taskInput = document.querySelector("[data-js-task-input]");
const taskButton = document.querySelector("[data-js-task-button]");
const taskList = document.querySelector("[data-js-task-list]");
const deleteTasksButton = document.querySelector("[data-js-delete-tasks-button]");
const remainingTasks = document.querySelector("[data-js-remaining-tasks]");

let taskNumber = 1;

taskButton.addEventListener("click",AddTask);
taskButton.addEventListener("keydown", (event) => {if (event.key === 'Enter' || event.key === ' '){AddTask()}});
taskInput.addEventListener("keydown", (event) => {if (event.key === 'Enter') {AddTask()}});
deleteTasksButton.addEventListener("click",RemoveAllTasks);

function clearInput(){
    taskInput.value = ""
}

function AddTask() {
    const taskText = taskInput.value.trim();

    if(taskText == "" || taskNumber == 11) return;
    clearInput();

    let novaTarefa = document.createElement("li");
    novaTarefa.id = `task_${taskNumber}`;
    novaTarefa.className = "main_list__task";
    novaTarefa.innerHTML =  `
                            <label class="main_list_task__label">
                                <input class="label__do" type="checkbox" data-js-checkbox>
                                <span class="label__text_task">${taskText}</span>
                            </label>

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

    remainingTasks.textContent = `Your remaining todos: ${taskList.childElementCount}`

    UpdateRemainingTasks()

    taskNumber++;
}

function RemoveTask(task) {
    task.remove();
    UpdateRemainingTasks()
}

function RemoveAllTasks(){
    if(taskList.hasChildNodes()){
        while(taskList.lastChild){
            taskList.lastChild.remove()
        }

        UpdateRemainingTasks()
    }
}

function UpdateRemainingTasks(){
    const checkboxes = taskList.getElementsByClassName("label__do");
    let checkedTasks = 0;

    for(i = 0; i < checkboxes.length; i++){
        if(checkboxes[i].checked){
            checkedTasks++;
        }
    }
    remainingTasks.textContent = `Your remaining todos: ${taskList.childElementCount - checkedTasks}`
}
