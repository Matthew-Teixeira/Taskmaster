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

  auditTask(taskLi);

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
$(".list-group").on("click", "span", function () {
  let date = $(this).text().trim();

  //create new input element
  let dateInput = $("<input>").attr("type", "text").addClass("form-control").val(date);

  $(this).replaceWith(dateInput);

  dateInput.datepicker({
    minDate: 0,
    onClose: function(){
      // when calendar is closed, force a "change" event on the `dateInput`
      $(this).trigger("change");
    }
  });

  dateInput.trigger("focus");
});

//when user clicks outside of data, edited date is saved
$(".list-group").on("change", "input[type='text']", function () {
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

  // Pass task's <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));
})

//Sortable list
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone", //create a copy of the dragged element and move the copy instead of the original
  activate: function (event) {
    $(this).addClass("dropover");
    $(".bottom-trash").addClass("bottom-trash-drag");
  },
  deactivate: function (event) {
    $(this).removeClass("dropover");
    $(".bottom-trash").removeClass("bottom-trash-drag");
  },
  over: function (event) {
    $(event.target).addClass("dropover-active");
  },
  out: function (event) {
    $(event.target).removeClass("dropover-active");
  },
  update: function (event) {
    let tempArr = [];

    // loop over current set of children in sortable list (ul)
    $(this).children().each(function () {
      //this refers to child (li)
      let text = $(this).find("p").text().trim();
      let date = $(this).find("span").text().trim();

      //use the tempArr array to overwrite what's currently saved in the tasks obj
      tempArr.push({
        text: text,
        date: date
      });
    });
    // trim down list's ID to match object property
    let arrName = $(this).attr("id").replace("list-", "");

    // update array on tasks object and save
    tasks[arrName] = tempArr; //places our tempArr object into the appropriate array
    saveTasks();
  }
});

//DELETE
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolarance: "touch",
  drop: function (event, ui) {
    ui.draggable.remove(); //ui is an object that contains a property called draggable. According to the documentation, draggable is "a jQuery object representing the draggable element.
    $(".bottom-trash").removeClass(".bottom-trash-active");
    //Removing a task from any of the lists triggers a sortable update(), meaning the sortable calls saveTasks() for us
  },
  over: function (event, ui) {
    $(".bottom-trash").addClass(".bottom-trash-active");
  },
  out: function (event, ui) {
    $(".bottom-trash").removeClass(".bottom-trash-active");
  }
})

//Date picker

$("#modalDueDate").datepicker({
  minDate: 0
});

//Due Dates - Audit

const auditTask = function(taskEl){
  // get the date from span
  let date = $(taskEl).find("span").text().trim();
  
  let time = moment(date, "L").set("hour", 17);

  // remove any old classes from element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");
  
  if(moment().isAfter(time)){
    $(taskEl).addClass("list-group-item-danger");
  }
  else if(Math.abs(moment().diff(time, "days")) <= 2){
    $(taskEl).addClass("list-group-item-warning");
  }
};


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
$("#task-form-modal .btn-save").click(function () {
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

//Auto update task audit 
setInterval(function(){
  $(".card .list-group-item").each(function(index, el){
    auditTask(el);
  });
}, (1000 * 60) * 30);
