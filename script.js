// =====================
// CLOCK & GREETING
// =====================
let userName = localStorage.getItem('userName') || '';

const nameInput   = document.getElementById('name-input');
const btnSaveName = document.getElementById('btn-save-name');

btnSaveName.addEventListener('click', function () {
  const inputVal = nameInput.value.trim();
  if (inputVal === '') {
    alert('Nama tidak boleh kosong!');
    return;
  }
  userName = inputVal;
  localStorage.setItem('userName', userName);
  nameInput.value = '';
  updateClock();
});

function updateClock() {
  const now = new Date();

  const hours   = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('clock-time').textContent = `${hours}:${minutes}:${seconds}`;

  const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  document.getElementById('clock-date').textContent =
    `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;

  const hour = now.getHours();
  let greet = '';
  if      (hour >= 5  && hour < 12) greet = 'Good Morning';
  else if (hour >= 12 && hour < 15) greet = 'Good Afternoon';
  else if (hour >= 15 && hour < 18) greet = 'Good Evening';
  else                               greet = 'Good Night';

  document.getElementById('clock-greeting').textContent = userName
    ? `${greet}, ${userName}`
    : `${greet}!`;
}

updateClock();
setInterval(updateClock, 1000);

// =====================
// FOCUS TIMER
// =====================
let timerDuration = 25 * 60;
let timeLeft      = timerDuration;
let timerInterval = null;
let isRunning     = false;

const timerDisplay   = document.getElementById('timer-display');
const btnStart       = document.getElementById('btn-start');
const btnStop        = document.getElementById('btn-stop');
const btnReset       = document.getElementById('btn-reset');
const btnSetDuration = document.getElementById('btn-set-duration');
const durationInput  = document.getElementById('timer-duration-input');

function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function renderTimer() {
  timerDisplay.textContent = formatTime(timeLeft);
}

btnSetDuration.addEventListener('click', function () {
  if (isRunning) {
    alert('Hentikan timer dulu sebelum mengubah durasi!');
    return;
  }
  const val = parseInt(durationInput.value);
  if (isNaN(val) || val < 1 || val > 120) {
    alert('Masukkan durasi antara 1 - 120 menit!');
    return;
  }
  timerDuration = val * 60;
  timeLeft      = timerDuration;
  renderTimer();
});

btnStart.addEventListener('click', function () {
  if (isRunning) return;
  isRunning = true;
  timerInterval = setInterval(function () {
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      isRunning = false;
      timerDisplay.textContent = '00:00';
      alert('⏰ Waktu habis! Istirahat dulu ya.');
      return;
    }
    timeLeft--;
    renderTimer();
  }, 1000);
});

btnStop.addEventListener('click', function () {
  if (!isRunning) return;
  clearInterval(timerInterval);
  isRunning = false;
});

btnReset.addEventListener('click', function () {
  clearInterval(timerInterval);
  isRunning = false;
  timeLeft  = timerDuration;
  renderTimer();
});

renderTimer();

// =====================
// TASKS
// =====================
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

const taskInput  = document.getElementById('task-input');
const btnAddTask = document.getElementById('btn-add-task');
const taskList   = document.getElementById('task-list');
const taskSort   = document.getElementById('task-sort');

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function getSortedTasks() {
  const sorted = tasks.map(function (task, index) {
    return { ...task, originalIndex: index };
  });
  const val = taskSort.value;
  if (val === 'az') {
    sorted.sort((a, b) => a.text.toLowerCase().localeCompare(b.text.toLowerCase()));
  } else if (val === 'za') {
    sorted.sort((a, b) => b.text.toLowerCase().localeCompare(a.text.toLowerCase()));
  } else if (val === 'done') {
    sorted.sort((a, b) => b.done - a.done);
  } else if (val === 'undone') {
    sorted.sort((a, b) => a.done - b.done);
  }
  return sorted;
}

function renderTasks() {
  taskList.innerHTML = '';

  getSortedTasks().forEach(function (task) {
    const index = task.originalIndex;

    const li       = document.createElement('li');
    li.className   = 'task-item';

    // CHECKBOX
    const checkbox     = document.createElement('input');
    checkbox.type      = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked   = task.done;
    checkbox.addEventListener('change', function () {
      tasks[index].done = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    // LABEL
    const label       = document.createElement('label');
    label.className   = 'task-label';
    label.textContent = task.text;
    if (task.done) {
      label.style.textDecoration = 'line-through';
      label.style.color          = '#9ca3af';
    }

    // TOMBOL EDIT
    const btnEdit       = document.createElement('button');
    btnEdit.className   = 'btn-edit';
    btnEdit.textContent = 'Edit';
    btnEdit.addEventListener('click', function () {
      const editInput         = document.createElement('input');
      editInput.type          = 'text';
      editInput.className     = 'task-edit-input';
      editInput.value         = task.text;
      editInput.autocomplete  = 'off';

      const btnSaveEdit       = document.createElement('button');
      btnSaveEdit.className   = 'btn-save-edit';
      btnSaveEdit.textContent = 'Simpan';

      function saveEdit() {
        const newText = editInput.value.trim();
        if (newText === '') {
          alert('Task tidak boleh kosong!');
          return;
        }
        tasks[index].text = newText;
        saveTasks();
        renderTasks();
      }

      btnSaveEdit.addEventListener('click', saveEdit);
      editInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter')  saveEdit();
        if (e.key === 'Escape') renderTasks();
      });

      li.replaceChild(editInput, label);
      li.replaceChild(btnSaveEdit, btnEdit);
      editInput.focus();
    });

    // TOMBOL DELETE
    const btnDelete       = document.createElement('button');
    btnDelete.className   = 'btn-danger';
    btnDelete.textContent = 'Delete';
    btnDelete.addEventListener('click', function () {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });

    li.appendChild(checkbox);
    li.appendChild(label);
    li.appendChild(btnEdit);
    li.appendChild(btnDelete);
    taskList.appendChild(li);
  });
}

taskSort.addEventListener('change', renderTasks);

btnAddTask.addEventListener('click', function () {
  const text = taskInput.value.trim();
  if (text === '') {
    alert('Task tidak boleh kosong!');
    return;
  }
  const isDuplicate = tasks.some(function (task) {
    return task.text.toLowerCase() === text.toLowerCase();
  });
  if (isDuplicate) {
    alert(`"${text}" sudah ada di daftar tasks!`);
    taskInput.focus();
    return;
  }
  tasks.push({ text: text, done: false });
  saveTasks();
  renderTasks();
  taskInput.value = '';
});

taskInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') btnAddTask.click();
});

renderTasks();

// =====================
// QUICK LINKS
// =====================
let links = JSON.parse(localStorage.getItem('links')) || [];

const quicklinkName = document.getElementById('quicklink-name');
const quicklinkUrl  = document.getElementById('quicklink-url');
const btnAddLink    = document.getElementById('btn-add-link');
const quicklinkList = document.getElementById('quicklink-list');

function saveLinks() {
  localStorage.setItem('links', JSON.stringify(links));
}

function renderLinks() {
  quicklinkList.innerHTML = '';

  links.forEach(function (link, index) {
    const item       = document.createElement('div');
    item.className   = 'quicklink-item';

    const anchor      = document.createElement('a');
    anchor.className  = 'quicklink-anchor';
    anchor.href       = link.url;
    anchor.target     = '_blank';
    anchor.textContent = link.name;

    const btnRemove       = document.createElement('button');
    btnRemove.className   = 'btn-remove-link';
    btnRemove.textContent = '×';
    btnRemove.setAttribute('aria-label', 'Remove');
    btnRemove.addEventListener('click', function () {
      links.splice(index, 1);
      saveLinks();
      renderLinks();
    });

    item.appendChild(anchor);
    item.appendChild(btnRemove);
    quicklinkList.appendChild(item);
  });
}

btnAddLink.addEventListener('click', function () {
  const name = quicklinkName.value.trim();
  const url  = quicklinkUrl.value.trim();

  // Validasi kosong
  if (name === '' || url === '') {
    alert('Nama dan URL tidak boleh kosong!');
    return;
  }

  // Validasi format URL
  try {
    new URL(url);
  } catch {
    alert('Format URL tidak valid! Contoh: https://google.com');
    return;
  }

  // Cek duplikat nama
  const isDuplicate = links.some(function (link) {
    return link.name.toLowerCase() === name.toLowerCase();
  });
  if (isDuplicate) {
    alert(`"${name}" sudah ada di Quick Links!`);
    quicklinkName.focus();
    return;
  }

  links.push({ name: name, url: url });
  saveLinks();
  renderLinks();

  // Kosongkan input
  quicklinkName.value = '';
  quicklinkUrl.value  = '';
});

// Bisa tambah link dengan Enter di input URL
quicklinkUrl.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') btnAddLink.click();
});

renderLinks();

