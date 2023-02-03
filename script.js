// this array will store the case data
let cases = [];

// get references to the form and case list
const form = document.getElementById('new-case-form');
const caseList = document.getElementById('case-list');

// handle form submissions
form.addEventListener('submit', event => {
event.preventDefault();
// get the form data
const status = "not started";
const createdAt = new Date();
const comments = [];

const email = document.getElementById("case-user").value;
const subject = document.getElementById("case-title").value;
const message = document.getElementById("case-description").value;

// create a new case object
// const newCase = { title, description, user, status, createdAt, comments };
const newCase = { email, subject, message, createdAt, status, comments };
// create the request body
const requestBody = JSON.stringify(newCase)

// create the request options
const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: requestBody
}

// send the request
fetch('https://fnd22-shared.azurewebsites.net/api/Cases/', requestOptions)
    .then(response => response.json())
    .then(data => {
    console.log(data);
    // add the new case to the array
    cases.unshift(newCase);
    // update the case list
    displayCases();
    // clear the form inputs
    document.getElementById("case-title").value = "";
    document.getElementById("case-description").value = "";
    document.getElementById("case-user").value = "";
  })
.catch(error => console.log('error', error))
});
  // update the case list
  displayCases();

  function displayCases() {
// clear the case list
caseList.innerHTML = '';
// add each case to the list
for (const aCase of cases) {
    const li = document.createElement('li');
    li.innerHTML = `
        <h2>${aCase.subject}</h2>
        <p>Status: ${aCase.status}</p>
        <p>User: ${aCase.email}</p>
        <p>Created At: ${aCase.createdAt}</p>
        <button class="change-status-button" data-case-index="${cases.indexOf(aCase)}">Change status</button>
        <button class="detail-button" data-case-index="${cases.indexOf(aCase)}">Detail</button>
        <div class="comments">
            <h3>Comments</h3>
            <ul class="comment-list">
            <!-- comments will be added here -->
            </ul>
            <form class="new-comment-form">
            <textarea class="new-comment-input"></textarea>
            <button type="submit" class="add-comment-button" data-case-index="${cases.indexOf(aCase)}">Add comment</button>
            </form>
        </div>
    `;
    caseList.appendChild(li);

    // Add a click event listener to the detail button
    li.querySelector('.detail-button').addEventListener('click', event => {
        const caseIndex = event.target.dataset.caseIndex;
        updateCommentList(caseIndex, li);
    });
}}


function updateCommentList(caseIndex, li) {
    const commentList = li.querySelector(".comment-list");
    if (!commentList) {
      console.error("Comment list not found.");
      return;
    }
    commentList.innerHTML = '';
    for (const comment of cases[caseIndex].comments) {
      const commentItem = document.createElement("li");
      commentItem.innerHTML = comment;
      commentList.appendChild(commentItem);
    }
  }
  
  
  

caseList.addEventListener('click', event => {
// check if the clicked element is a detail button
if (event.target.classList.contains('detail-button')) {
    // get the case index from the button's data attribute
    const caseIndex = event.target.dataset.caseIndex;
    // get the case from the array
    const selectedCase = cases[caseIndex];
    // display the case details
    displayCaseDetails(selectedCase);
}
});


function createDetailPage(selectedCase) {
// clear the case list
caseList.innerHTML = '';

// fetch the comments from the API
fetch(`https://fnd22-shared.azurewebsites.net/api/Comments/${selectedCase.id}`)
    .then(response => response.json())
    .then(data => {
        // create the detail page with the comments
        const detailPage = document.createElement('div');
        detailPage.innerHTML = `
            <h1>Case Detail</h1>
            <h2>Title: ${selectedCase.title}</h2>
            <p>Status: ${selectedCase.status}</p>
            <p>User: ${selectedCase.user}</p>
            <p>Created At: ${selectedCase.createdAt}</p>
            <h3>Comments:</h3>
            <ul class="comments-list">
            ${data.map(comment => `<li>${comment.text}</li>`).join('')}
            </ul>
            <button class="back-button">Back</button>
        `;
        caseList.appendChild(detailPage);
    })
    .catch(error => console.log('error', error))
}


caseList.addEventListener('click', event => {
// check if the clicked element is a back button
if (event.target.classList.contains('back-button')) {
    // go back to the case list page
    displayCases();
}
});

function addComment(event, caseIndex) {
  event.preventDefault();
  const commentText = document.querySelectorAll(".new-comment-input")[caseIndex].value;
  cases[caseIndex].comments.unshift(commentText);
  updateCommentList(caseIndex);
  saveCaseToAPI(cases[caseIndex]);
}

function saveCaseToAPI(aCase) {
  const requestBody = JSON.stringify(aCase);
  const requestOptions = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: requestBody
  };
  fetch(`https://fnd22-shared.azurewebsites.net/api/Cases/${aCase.id}`, requestOptions)
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.log("error", error));
}

caseList.addEventListener("submit", function(event) {
  if (event.target && event.target.className === "new-comment-form") {
    const caseIndex = event.target.querySelector(".add-comment-button").dataset.caseIndex;
    addComment(event, caseIndex);
  }
});

// Listen on "Change status" button click event
caseList.addEventListener("click", function(event) {
  if (event.target && event.target.className === "change-status-button") {
    const caseIndex = event.target.dataset.caseIndex;
    const currentCase = cases[caseIndex];
    currentCase.status = prompt("Enter new status:");
    displayCases();
  }
});
