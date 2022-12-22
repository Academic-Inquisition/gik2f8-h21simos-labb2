todoForm.title.addEventListener('keyup', (e) => validateField(e.target));
todoForm.title.addEventListener('blur', (e) => validateField(e.target));
todoForm.description.addEventListener('input', (e) => validateField(e.target));
todoForm.description.addEventListener('blur', (e) => validateField(e.target));
todoForm.dueDate.addEventListener('input', (e) => validateField(e.target));
todoForm.dueDate.addEventListener('blur', (e) => validateField(e.target));

todoForm.addEventListener('submit', onSubmit);

const todoListElement = document.getElementById('todoList');

let titleValid = true;
let descriptionValid = true;
let dueDateValid = true;

const api = new Api('http://localhost:5000/tasks');

function validateField(field) {
  const { name, value } = field;

  let validationMessage = '';

  switch (name) {
    case 'title': {
      if (value.length < 2) {
        titleValid = false;
        validationMessage = "Fältet 'Titel' måste innehålla minst 2 tecken.";
      } else if (value.length > 100) {
        titleValid = false;
        validationMessage = "Fältet 'Titel' får inte innehålla mer än 100 tecken.";
      } else {
        titleValid = true;
      }
      break;
    }
    case 'description': {
      if (value.length > 500) {
        descriptionValid = false;
        validationMessage = "Fältet 'Beskrvining' får inte innehålla mer än 500 tecken.";
      } else {
        descriptionValid = true;
      }
      break;
    }
    case 'dueDate': {
      if (value.length === 0) {
        descriptionValid = false;
        validationMessage = "Fältet 'Slutförd senast' är obligatorisk.";
      } else {
        dueDateValid = true;
      }
      break;
    }
  }

  field.previousElementSibling.innerText = validationMessage;
  field.previousElementSibling.classList.remove('hidden');
}

function onSubmit(e) {
  e.preventDefault();
  if (titleValid && descriptionValid && dueDateValid) {
    console.log('Submit');
    saveTask();
  }
}

function saveTask() {
  const task = {
    title: todoForm.title.value,
    description: todoForm.description.value,
    dueDate: todoForm.dueDate.value,
    completed: false
  };

  api.create(task).then((task) => {
    if (task) {
      renderList();
    }
  });
}

function sortByDate(firstTask, secondTask) {
  // Sort using the dueDate of both tasks, replacing any '-' characters with an empty character.
  // This effectively turns the dueDates into large numbers which we can subtract and either get a value of:
  // - Larger than 0
  // - 0
  // - Less than 0
  return parseInt(firstTask.dueDate.replace(/\-/g, '')) - parseInt(secondTask.dueDate.replace(/\-/g, ''));
}

function arrangeTodoList(tasks) {
  // Split the list into two, one with active tasks and one with completed tasks.
  let list = tasks.filter((task) => !task.completed);     // Active Tasks
  let completed = tasks.filter((task) => task.completed); // Completed Tasks
  list.sort(sortByDate);                                  // Sort Active by Date
  completed.sort(sortByDate);                             // Sort Completed by Date
  list = list.concat(completed);                          // Concat the completed list to the end of the Active list
  return list;                                            // Return the new sorted/"arranged" task-list.
}

function renderList() {
  console.log('rendering');
  api.getAll()
    .then((tasks) => {
      todoListElement.innerHTML = '';
      if (tasks && tasks.length > 0) {
        arrangeTodoList(tasks).forEach((task) => todoListElement.insertAdjacentHTML('beforeend', renderTask(task)));
      }
    });
}

function renderTask({ id, title, description, dueDate, completed }) {
  // If it is completed, then change the background of the task to "slate-500".
  if (completed) {
    let html = `
    <li class="select-none mt-2 py-2 border-b border-amber-300 bg-slate-500 opacity-50 rounded-md">
      <div id="${id}" class="flex items-center">
        <label class="switch ml-1 mr-5">
          <input id="completed" name="completed" type="checkbox" onclick="update(this)" checked>
          <span class="slider round"></span>
        </label>
        <h3 id="${title}" class="mb-3 flex-1 text-xl font-bold text-pink-800 uppercase">${title}</h3>
        <div>
          <span>${dueDate}</span>
          <button onclick="deleteTask(${id})" class="inline-block bg-slate-300 text-xs text-amber-900 border border-white px-3 py-1 rounded-md ml-2">Ta bort</button>
        </div>
      </div>`;
    description && (html += `<p class="ml-8 mt-2 text-xs italic">${description}</p>`);
    html += `</li>`;
    return html;
  } else { // If it isn't completed, then just make it look like normal.
    let html = `
    <li class="select-none mt-2 py-2 border-b border-amber-300">
      <div id="${id}" class="flex items-center">
        <label class="switch ml-1 mr-5">
          <input id="completed" name="completed" type="checkbox" onclick="update(this)">
          <span class="slider round"></span>
        </label>
        <h3 id="${title}" class="mb-3 flex-1 text-xl font-bold text-pink-800 uppercase">${title}</h3>
        <div>
          <span>${dueDate}</span>
          <button onclick="deleteTask(${id})" class="inline-block bg-amber-500 text-xs text-amber-900 border border-white px-3 py-1 rounded-md ml-2">Ta bort</button>
        </div>
      </div>`;
    description && (html += `<p class="ml-8 mt-2 text-xs italic">${description}</p>`);
    html += `</li>`;
    return html;
  }
}


/**
 * Method for updating the task and marking it as completed.
 *
 * @param {clickEvent} e
 */
function update(e) {
  let desc;
  const task = e.parentElement.parentElement;
  const title = task.children[1].id;
  const id = parseInt(task.id);
  const dueDate = task.children[2].children[0].innerText;
  const completed = e.checked

  let descElement = task.parentElement.children[1]
  if (descElement) {
    try { desc = task.parentElement.children[1].innerText; }
    catch (e) {
      desc = ''
      console.log(e)
    }
  }
  let data = {
    id: id,
    title: title,
    description: desc,
    dueDate: dueDate,
    completed: completed
  }

  api.update(data).then(() => renderList())
}

function deleteTask(id) {
  api.remove(id).then((result) => {
    renderList();
  });
}

renderList();
