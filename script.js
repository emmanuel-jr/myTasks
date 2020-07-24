var selPriority;

class Task {
  constructor(id, title, p) {
    this.id = id;
    this.title = title;
    this.priority = {
      id: p.id,
      name: p.name,
      color: p.color
    };
  }
}

class TaskListPage {
  constructor() {
    this.tasks = [];
    this.priorities = [];
    this.taskInput = document.getElementById("task");

    db.ref('priorities/').once('value', (pSnapshot) => {
      Object.keys(pSnapshot.val()).forEach(pId => {
        const priority = {
          id: pId,
          name: pSnapshot.val()[pId].name,
          color: pSnapshot.val()[pId].color
        };

        this.priorities.push(priority);
      })

      db.ref('tasks/').once('value', (snapshot) => {
        let task;
        Object.keys(snapshot.val()).forEach(key => {
          if (snapshot.val()[key].priority.id) {
            const priority = this.priorities.find(p => p.id == snapshot.val()[key].priority.id)
            task = new Task(key, snapshot.val()[key].title, priority);
          }
          this.tasks.push(task);
          this.rendering(snapshot.val()[key], task.priority.color);
        })
      });
    })

  }


  taskSubmit(e) {
    e.preventDefault();
    const errorMsg = document.querySelector('.error');
    const pError = document.querySelector('.pError');
    const title = document.getElementById("task").value;
    const taskId = document.getElementById("task").getAttribute("data-task-id");

    if (title === '') {
      errorMsg.style.removeProperty("display");
      setTimeout(() => {
        errorMsg.style.display = 'none';
      }, 2500);
    }

    if (selPriority == undefined) {
      pError.style.removeProperty("display");
      setTimeout(() => {
        pError.style.display = 'none';
      }, 2500);
    }

    else {
      if (taskId) {
        this.updateTask(taskId, title);
      }
      else {
        this.addTask(title);
      }
    }
  }


  taskListClick(e) {
    e.preventDefault();

    const taskId = e.target.parentElement.parentElement.parentElement.getAttribute("data-task-id");
    const priorityId = e.target.parentElement.parentElement.parentElement.getAttribute("priority-id");
    
    if (!taskId) return;

    if (e.target.classList[2] == "edit")
      this.editTask(taskId);

    else if (e.target.classList[2] == "delete")
      this.deleteTask(taskId, priorityId);
  }


  addTask(title) {
    const taskId = db.ref().child('tasks').push().key;
    const prId = db.ref().child('priorities').push().key;
    const currPriority = {
      id: prId,
      name: selPriority.name,
      color: selPriority.color
    };

    db.ref(`priorities/${prId}`).set({
      id: prId,
      name: currPriority.name,
      color: currPriority.color
    });

    db.ref(`tasks/${taskId}`).set({
      title: title,
      id: taskId,
      priority: currPriority
    });

    const task = new Task(taskId, title, currPriority);
    this.tasks.push(task);
    this.rendering(task, currPriority.color);
    this.clearTaskInput();
  }


  rendering(task, pColor) {
    var current = buttonColor(pColor);

    const row = document.createElement("tr");
    row.setAttribute("data-task-id", task.id);
    row.setAttribute("priority-id", task.priority.id);
    row.innerHTML = `
        <td class="alert alert-${current}" role="alert">${task.title}</td>
        <td>
          <span>
            <i data-action="edit-task" class="fa fa-pencil-square-o edit" style="cursor: pointer;"></i>
            <i class="fa fa-trash delete" aria-hidden="false" style="cursor: pointer;"></i>
          </span>
        </td>
      `;

    document.getElementById("task-list").appendChild(row);
  }


  clearTaskInput() {
    this.taskInput.value = "";
    this.taskInput.removeAttribute("data-task-id");
  }


  deleteTask(id, idP) {
    db.ref(`tasks/${id}`).remove();
    db.ref(`priorities/${idP}`).remove();
    document.querySelector(`tr[data-task-id="${id}"]`).remove();

  }


  editTask(taskId) {
    const task = this.tasks.find((task) => task.id == taskId);

    if (!task) throw new Error("Task does not exist.");

    this.taskInput.value = task.title;
    this.taskInput.setAttribute("data-task-id", task.id);
    document.getElementById("button-addon2").innerText = "Save";
  }


  updateTask(taskId, title) {
    let task = this.tasks.find((task) => task.id == taskId);
    task.title = title;
  
    task.priority = {
      id: task.priority.id,
      name: selPriority.name,
      color: selPriority.color
    }

    db.ref(`priorities/${task.priority.id}`).set({
      id: task.priority.id,
      name: selPriority.name,
      color: selPriority.color
    });

    db.ref(`tasks/${taskId}`).set({
      title: task.title,
      id: task.id,
      priority: task.priority
    });

    let existingTask = document.querySelector(`tr[data-task-id="${task.id}"]`);
    existingTask.children[0].removeAttribute('class');
    existingTask.children[0].setAttribute('class', `alert-${buttonColor(task.priority.color)}`)
    existingTask.children[0].innerHTML = task.title;

    this.clearTaskInput();
    document.getElementById("button-addon2").innerHTML = `
      <i class="fa fa-plus"></i>
      `;
  }

}

buttonColor = (Color) => {
  if (Color === 'red') {
    return 'danger'
  }

  if (Color === 'yellow') {
    return 'warning'
  }

  if (Color === 'green') {
    return 'success'
  }
}


colorChange = (myButton) => {
  if (myButton.value === 'high') {
    selPriority = {
      color: "red", name: myButton.value
    };
  }

  else if (myButton.value === 'medium') {
    selPriority = {
      color: "yellow", name: myButton.value
    };
  }

  else if (myButton.value === 'low') {
    selPriority = {
      color: "green", name: myButton.value
    };
  }
}


const taskListPage = new TaskListPage();
document.getElementById("task-form").addEventListener("submit", (e) => {
  taskListPage.taskSubmit(e);
});

document.getElementById("task-list").addEventListener("click", taskListPage.taskListClick.bind(taskListPage));