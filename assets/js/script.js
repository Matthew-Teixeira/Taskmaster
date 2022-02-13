var tasks = {};

var createTask = function (taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function () {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function (list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function (task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function () {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

//When click, p tag turns into textarea for editing
$(".list-group").on("click", "p", function () {
  //grab text data of p tag when it is clicked
  let text = $(this)
    .text()
    .trim();
    
  // create a textarea element and add class and value of text
  let textInput = $("<textarea>").addClass("form-control").val(text);

  //replace this(<p>) with the new text area with the <p> text value
  $(this).replaceWith(textInput);
  textInput.trigger("focus");
});

//when user clicks on anything but textarea, edited data is saved
$(".list-group").on("blur", "textarea", function () {
  //save text within text area (we are able o edit at this point)
  var text = $(this)
    .val()
    .trim();

  // get the parent ul's id attribute aka: list-toDo then cut out list- so now it's just toDo. Fits our arrays
  var status = $(this) //(this refers to the text area)
    .closest(".list-group") //closest .list-group class is the ul
    .attr("id") //Get ul id
    .replace("list-", ""); // cut id down to toDo from list-toDo

  // get the task's position in the list of other li elements
  var index = $(this) //(this refers to the text area)
    .closest(".list-group-item")  //gives us the li "this" is in
    .index(); //numbered index value

  //save the new data to tasks obj ex: toDo: [{text: "Run to moon base Alpha", date: "08/04/2055"}]
  tasks[status][index].text = text;
  saveTasks();

  //replace p element
  let taskP = $("<p>").addClass("m-1").text(text);

  // replace textarea with p element
  $(this).replaceWith(taskP);
});

//When clicking on due date to edit
$(".list-group").on("click", "span", function(){
  let date = $(this).text().trim();

  //create new input element
  let dateInput = $("<input>").attr("type", "text").addClass("form-control").val(date);

  $(this).replaceWith(dateInput);

  dateInput.trigger("focus");
});

//when user clicks outside of data, edited date is saved
$(".list-group").on("blur", "input", function(){
  let date = $(this).val().trim();

  //get ul's id
  let status = $(this).closest(".list-group").attr("id").replace("list-", "");

  //get the task position in the list of other li elements
  let index = $(this).closest(".list-group-item").index();

  tasks[status][index].date = date;
  saveTasks();

  //replace text input with the previously used span
  let taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(date);

  $(this).replaceWith(taskSpan);
})


// modal was triggered
$("#task-form-modal").on("show.bs.modal", function () {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function () {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function () {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function () {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


