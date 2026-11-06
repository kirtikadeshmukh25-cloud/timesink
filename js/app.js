lucide.createIcons();

// Data Structure: Array of objects { start: 9, end: 12, category: 'work' }
let schedule = [];

// Load from Local Storage when page opens
function loadData() {
  const saved = localStorage.getItem('timesink_data');
  if (saved) {
    schedule = JSON.parse(saved);
  }
  renderTimelineGrid(); // from drag.js
  renderScheduleBlocks();
  updateInsights();
}

// Save to Local Storage
function saveData() {
  localStorage.setItem('timesink_data', JSON.stringify(schedule));
}

// Create a block visually
function renderScheduleBlocks() {
  // Remove old blocks
  document.querySelectorAll('.time-block').forEach(el => el.remove());
  
  const container = document.getElementById('timelineBlocks');

  schedule.forEach((block, index) => {
    const el = document.createElement('div');
    el.className = 'time-block ' + block.category;
    el.style.top = (block.start * 60) + 'px';
    el.style.height = ((block.end - block.start) * 60) + 'px';
    
    // Format text: "Work (09:00 - 12:00)"
    const formatTime = (h) => h.toString().padStart(2, '0') + ':00';
    el.textContent = `${block.category.toUpperCase()} (${formatTime(block.start)} - ${formatTime(block.end)})`;
    
    // Click to delete
    el.title = "Click to delete this block";
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if(confirm('Delete this block?')) {
        schedule.splice(index, 1);
        saveData();
        renderScheduleBlocks();
        updateInsights();
      }
    });

    container.appendChild(el);
  });
}

// Called from drag.js when mouse is released
function addTimeBlock(start, end, category) {
  // Check for overlap
  const overlap = schedule.find(b => 
    (start < b.end && end > b.start)
  );

  if (overlap) {
    alert("This overlaps with an existing block!");
    return;
  }

  schedule.push({ start, end, category });
  saveData();
  renderScheduleBlocks();
  updateInsights();
}

// Calculate total hours and warnings
function updateInsights() {
  let totals = { work: 0, sleep: 0, break: 0, personal: 0 };

  schedule.forEach(block => {
    const duration = block.end - block.start;
    totals[block.category] += duration;
  });

  // Update text numbers
  document.getElementById('countWork').textContent = totals.work + 'h';
  document.getElementById('countSleep').textContent = totals.sleep + 'h';
  document.getElementById('countBreak').textContent = totals.break + 'h';
  document.getElementById('countPersonal').textContent = totals.personal + 'h';

  const totalHours = totals.work + totals.sleep + totals.break + totals.personal;
  document.getElementById('totalHours').textContent = totalHours + '.0 hours';

  // Generate Alerts
  const alertsContainer = document.getElementById('alerts');
  alertsContainer.innerHTML = '';

  if (totals.work > 8) {
    alertsContainer.innerHTML += `<div class="alert-item"><i data-lucide="alert-triangle"></i> You scheduled over 8 hours of work. Risk of burnout!</div>`;
  }
  if (totals.break === 0 && totalHours > 0) {
    alertsContainer.innerHTML += `<div class="alert-item"><i data-lucide="alert-triangle"></i> You haven't scheduled any breaks today.</div>`;
  }
  if (totals.sleep < 7 && totals.sleep > 0) {
    alertsContainer.innerHTML += `<div class="alert-item"><i data-lucide="alert-triangle"></i> Less than 7 hours of sleep scheduled.</div>`;
  }
  if (totalHours > 24) {
    alertsContainer.innerHTML = `<div class="alert-item"><i data-lucide="alert-triangle"></i> You scheduled more than 24 hours!</div>`;
  }

  lucide.createIcons(); // Update alert icons
}

// Clear everything
document.getElementById('clearBtn').addEventListener('click', () => {
  if (confirm("Are you sure you want to clear your entire day?")) {
    schedule = [];
    saveData();
    renderScheduleBlocks();
    updateInsights();
  }
});

// Start the app
loadData();