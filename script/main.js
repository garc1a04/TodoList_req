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
deleteTasksButton.addEventListener("click",ModalRemoveAllTask);

let taskNumber = 1;
var tasks = [];

if(localStorage.getItem("tasks") != undefined){
    tasks = JSON.parse(localStorage.getItem("tasks"));
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attFromStorage);
} else {
    attFromStorage();
}

function attFromStorage(){
   const saved = localStorage.getItem("tasks");
   if (saved) {
     tasks = JSON.parse(saved);
     taskList.innerHTML = "";
     loadInFront()
     taskNumber = tasks.length + 1;
     UpdateRemainingTasks();
   }
}

function loadInFront() {
    taskList.innerHTML = "";

    // cria cópia com índice atual
    const tasksWithIndex = tasks.map((tarefa, index) => ({ ...tarefa, originalIndex: index }));

    // não-checados primeiro
    const tasksSorted = tasksWithIndex.slice().sort((a, b) => {
        if (a.checked === b.checked) return 0;
        return a.checked ? 1 : -1;
    });

    tasksSorted.forEach((tarefa) => {
        const novaTarefa = document.createElement("li");
        // armazena o índice atual do array para mapear a action de volta ao tasks
        novaTarefa.id = `task_${tarefa.originalIndex}`;
        novaTarefa.className = "main_list__task";
        novaTarefa.dataset.index = tarefa.originalIndex;

        const checkboxId = `checkbox_${tarefa.originalIndex}`;

        novaTarefa.innerHTML = `
            <label class="main_list_task__label" for="${checkboxId}">
                <input id="${checkboxId}" class="label__do" type="checkbox" data-js-checkbox ${tarefa.checked ? "checked" : ""}>
                <span class="label__text_task">${tarefa.texto}</span>
            </label>
            <button id="edit_${tarefa.originalIndex}" class="edit_task" aria-label="edit task" data-js-edit-task-button>
                <img src="assets/edit-text.png" alt="edit">
            </button>
            <button id="delete_${tarefa.originalIndex}" class="delete_task" aria-label="Delete task" data-js-delete-task-button>
                <img src="assets/cancel.png" alt="delete">
            </button>
        `;

        const checkbox = novaTarefa.querySelector("[data-js-checkbox]");

        checkbox.addEventListener("change", (e) => {
            const checkedNow = e.target.checked;
            const idx = Number(novaTarefa.dataset.index); // índice seguro
            if (!Number.isNaN(idx) && tasks[idx]) {
                tasks[idx].checked = checkedNow;
                addInLocalStorage(tasks);
                // se quiser que a tarefa mude de posição quando marcada, re-renderizamos
                loadInFront();
                UpdateRemainingTasks();
            }
        });

        const deleteTaskButton = novaTarefa.querySelector("[data-js-delete-task-button]");
        const editTaskButton = novaTarefa.querySelector("[data-js-edit-task-button]");

        deleteTaskButton.addEventListener("click", () => {
            if (!document.querySelector(".modal")) {
                ModalRemoveTask(novaTarefa);
            }
        });

        editTaskButton.addEventListener("click", () => {
            if (!document.querySelector(".modal")) {
                ModalEditTask(novaTarefa);
            }
        });

        taskList.appendChild(novaTarefa);
    });
}

function count_caracter(string) {
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
    count_caracter("");

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
    
    tasks.push({
        texto: taskText,
        checked: false
    });

    addInLocalStorage(tasks);
    UpdateRemainingTasks()
    taskNumber++;
    taskList.innerHTML = "";
    loadInFront()
}

function ModalRemoveTask(task) {
    let main = document.querySelector(".main");

    let modal_delete = 
    `
    <div id="modal_remove" class="modal">
        <div class="modal-content">
            <h2>Confirmar exclusão</h2>

            <p>Tem certeza que deseja apagar esta tarefa?<br>Essa ação não poderá ser desfeita.</p>

            <div>
                <button class="btn btn-cancelar">Cancelar</button>
                <button href="#" class="btn btn-apagar">Apagar</button>
            </div>
        </div>
    </div>
    `
    main.insertAdjacentHTML("beforeend", modal_delete);

    let modal = document.querySelector(`.modal`);
    let btnCancelar = modal.querySelector(".btn-cancelar");
    let btnApagar = modal.querySelector(".btn-apagar");

    modal.addEventListener("click", function (e) {
        if (e.target === modal) {
            modal.remove();
        }
    });

    btnCancelar.addEventListener("click", () => {
        modal.remove();
    });

    btnApagar.addEventListener("click", () => {
        // usar dataset.index diretamente (mais confiável que procurar pelo id no DOM)
        const idx = Number(task.dataset.index);
        if (!Number.isNaN(idx) && idx > -1 && idx < tasks.length) {
            tasks.splice(idx, 1);
            addInLocalStorage(tasks);
        }

        modal.remove();
        loadInFront();
    });
}

function count_caracterGener(input){
    const caracter = document.querySelector("#input_counter__edit");

    let maxChar = 100;
    let valor = maxChar - input.value.length
    caracter.textContent = valor

    if(valor == 0) {
        caracter.classList.add("end");
        return;
    }

    caracter.classList.remove("end");
}

function ModalEditTask(task) {
    let main = document.querySelector(".main");
    const idx = Number(task.dataset.index);
    const currentText = (!Number.isNaN(idx) && tasks[idx]) ? tasks[idx].texto : "";

    let modal_edit = `
    <div id="modal" class="modal main__input">
        <section id="input_task" class="modal-content__edit main__input">
            <h2>Edite a mensagem</h2>
            
            <div class="main__input_task">
                <input type="text" value="${currentText}" maxlength="100" data-js-task-input-edit>
                <p id="input_counter__edit" class="caracter__modal">100</p>
            </div>

            <button class="btn btn-cancelar">Cancelar</button>
            <button class="btn btn-editar" style="background-color:greenyellow;">Editar</button>
            
            <p id="err" class="error hidden"></p>
        </section>
    </div>
    `;

    main.insertAdjacentHTML("beforeend", modal_edit);

    let modal = document.querySelector(`.modal`);
    let btnCancelar = modal.querySelector(".btn-cancelar");
    let btnEditar = modal.querySelector(".btn-editar");
    let inputEdit = modal.querySelector("[data-js-task-input-edit]");
    count_caracterGener(inputEdit);

    inputEdit.addEventListener("input", () => {
        count_caracterGener(inputEdit);
    });

    inputEdit.addEventListener("input", clearErr);

    modal.addEventListener("click", function (e) {
        if (e.target === modal) {
            modal.remove();
        }
    });

    btnCancelar.addEventListener("click", () => {
        modal.remove();
    });

    btnEditar.addEventListener("click", () => {
        const taskText = inputEdit.value.trim();

        count_caracterGener(inputEdit);

        if (taskText === "") {
            errorTask("Não pode adicionar tarefas vazias");
            return;
        }

        clearErr();

        if (!Number.isNaN(idx) && tasks[idx]) {
            tasks[idx].texto = taskText;
            addInLocalStorage(tasks);
        }

        loadInFront();  
        modal.remove();
    });
}

function ModalRemoveAllTask() {
    let main = document.querySelector(".main");

    let modal_delete = 
    `
    <div id="removeAll" class="modal">
        <div class="modal-content">
            <h2>Confirmar exclusão total!</h2>

            <p>Tem certeza que deseja apagar todas as tarefas?<br>Essa ação não poderá ser desfeita.</p>

            <div>
                <button class="btn btn-cancelar">Cancelar</button>
                <button href="#" class="btn btn-apagar">Apagar</button>
            </div>
        </div>
    </div>
    `
    main.insertAdjacentHTML("beforeend", modal_delete);

    let modal = document.querySelector(`.modal`);
    let btnCancelar = modal.querySelector(".btn-cancelar");
    let btnApagar = modal.querySelector(".btn-apagar");


    modal.addEventListener("click", function (e) {
        if (e.target === modal) {
            modal.remove();
        }
    });

    btnCancelar.addEventListener("click", () => {
        modal.remove();
    });

    btnApagar.addEventListener("click", () => {
        RemoveAllTasks();
        modal.remove();
    });
}

function RemoveAllTasks() {
    if(!taskList.hasChildNodes()) {
        errorTask("Não há tarefas");
        return;
    }

    taskNumber = 1;
    tasks = [];
    addInLocalStorage(tasks);

    while(taskList.lastChild){
        taskList.lastChild.remove()
    }

    UpdateRemainingTasks()
}

function UpdateRemainingTasks(){
    const checkboxes = taskList.getElementsByClassName("label__do");
    let checkedTasks = 0;

    for(let i = 0; i < checkboxes.length; i++){
        const cb = checkboxes[i];
        const li = cb.closest("li");
        if (!li) continue;
        const idx = Number(li.dataset.index);
        if (Number.isNaN(idx) || !tasks[idx]) continue;

        if(cb.checked){
            tasks[idx].checked = true;
            checkedTasks++;
        } else {
            tasks[idx].checked = false;
        }
    }

    if(checkedTasks <= 10) {
        taskInput.disabled = false;
        clearErr();
    }

    addInLocalStorage(tasks);
    remainingTasks.textContent = `Tarefas restantes: ${taskList.childElementCount - checkedTasks}`;
}

function errorTask(err) {
    const error = document.querySelector("#err");
    error.classList.remove("hidden");
    error.textContent = err;
    error.classList.remove("MSGErroAnim");
    void error.offsetWidth;
    error.classList.add("MSGErroAnim");
}

function errorTask2(err) {
    const error = document.querySelector("#err2");
    error.classList.remove("hidden");
    error.textContent = err;
    error.classList.remove("MSGErroAnim");
    void error.offsetWidth;
    error.classList.add("MSGErroAnim");
}

function clearErr() {
    const error = document.querySelector("#err");
    error.classList.add("hidden");
}

function addInLocalStorage(tasks){
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function removeTask(taskElement) {

    const idx = Number(taskElement.dataset.index);
    if (!Number.isNaN(idx) && idx > -1 && idx < tasks.length) {
        tasks.splice(idx, 1);
        addInLocalStorage(tasks);
    }

    loadInFront();
    taskNumber = taskList.childElementCount + 1;
    UpdateRemainingTasks();
}