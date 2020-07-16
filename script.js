class Task {
    constructor(id, title) {
      this.id = id;
      this.title = title;
    }
}
  
class TaskListPage {
    constructor() {
      this.tasks = [];
      this.taskInput = document.getElementById("task");

      db.ref('tasks/').once('value', (snapshot) => {
        Object.keys(snapshot.val()).forEach(key => {
          const task = new Task(key, snapshot.val()[key].title);
          this.tasks.push(task);
          this.rendering(snapshot.val()[key]);
        })
      });
 
    }
  

    taskSubmit(e) {
      e.preventDefault();
      const title = document.getElementById("task").value;
      const taskId = document.getElementById("task").getAttribute("data-task-id");
      
      if (taskId) {
        this.updateTask(taskId, title);
      } 
      else {
        this.addTask(title);
      }
    }
  

    taskListClick(e) {
      e.preventDefault();
  
      const taskId = e.target.parentElement.parentElement.parentElement.getAttribute("data-task-id");
      
      if (!taskId) return;
  
      if (e.target.classList[2] == "edit")
      this.editTask(taskId);

      else if (e.target.classList[2] == "delete")
      this.deleteTask(taskId);
    }
  

    addTask(title) {
      const taskId = db.ref().child('tasks').push().key;
      const task = new Task(taskId, title);
      this.tasks.push(task);

      db.ref(`tasks/${taskId}`).set({
        title: title,
        id: taskId
      });

      this.rendering(task);
      this.clearTaskInput();
    }


    rendering(task) {
      const row = document.createElement("tr");
      row.setAttribute("data-task-id", task.id);
      row.innerHTML = `
        <td>${task.title}</td>
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


    deleteTask(id) {
      db.ref(`tasks/${id}`).remove();
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
      const task = this.tasks.find((task) => task.id == taskId);
      task.title = title;
      db.ref(`tasks/${taskId}`).set({
        title: task.title,
        id: task.id
      });
  
      const existingTask = document.querySelector(`tr[data-task-id="${taskId}"]`);
      existingTask.children[0].innerHTML = task.title;

      this.clearTaskInput();
      document.getElementById("button-addon2").innerHTML = `
      <i class="fa fa-plus"></i>
      `;
    }

}
  
  
const taskListPage = new TaskListPage();
document.getElementById("task-form").addEventListener("submit", (e) => {
    taskListPage.taskSubmit(e);
});

document.getElementById("task-list").addEventListener("click", taskListPage.taskListClick.bind(taskListPage));