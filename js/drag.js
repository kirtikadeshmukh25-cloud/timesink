// Build the 24-hour background
function renderTimelineGrid() {
  const container = document.getElementById('timelineBlocks');
  container.innerHTML = '';

  for (let i = 0; i < 24; i++) {
    const row = document.createElement('div');
    row.className = 'hour-row';
    
    // Format time (e.g., "09:00")
    const timeLabel = i.toString().padStart(2, '0') + ':00';
    
    row.innerHTML = `
      <div class="hour-label">${timeLabel}</div>
      <div class="hour-slot" data-hour="${i}"></div>
    `;
    container.appendChild(row);
  }

  // Re-attach drag logic to the new slots
  setupDragLogic();
}

// Drag logic
let isDragging = false;
let startY = 0;
let startHour = 0;
let currentPreview = null;

function setupDragLogic() {
  const container = document.getElementById('timelineBlocks');
  
  container.addEventListener('mousedown', (e) => {
    // Only drag if clicking on an empty hour slot
    if (!e.target.classList.contains('hour-slot')) return;
    
    isDragging = true;
    startHour = parseInt(e.target.dataset.hour);
    
    // Create a temporary visual block
    currentPreview = document.createElement('div');
    currentPreview.className = 'time-block ' + document.getElementById('categorySelect').value;
    currentPreview.style.top = (startHour * 60) + 'px';
    currentPreview.style.height = '60px';
    currentPreview.style.opacity = '0.5';
    currentPreview.textContent = 'New Block';
    
    container.appendChild(currentPreview);
  });

  // Track mouse moving
  document.addEventListener('mousemove', (e) => {
    if (!isDragging || !currentPreview) return;
    
    // Calculate which hour the mouse is hovering over
    const containerRect = container.getBoundingClientRect();
    const relativeY = e.clientY - containerRect.top + container.parentElement.scrollTop;
    let currentHour = Math.floor(relativeY / 60);
    
    // Keep it within bounds
    if (currentHour < 0) currentHour = 0;
    if (currentHour > 23) currentHour = 23;

    // Calculate start and height
    const minHour = Math.min(startHour, currentHour);
    const maxHour = Math.max(startHour, currentHour);
    const heightInHours = maxHour - minHour + 1;
    
    currentPreview.style.top = (minHour * 60) + 'px';
    currentPreview.style.height = (heightInHours * 60) + 'px';
    currentPreview.dataset.start = minHour;
    currentPreview.dataset.end = maxHour + 1; // +1 because it fills the whole hour
  });

  // Mouse released
  document.addEventListener('mouseup', () => {
    if (!isDragging || !currentPreview) return;
    isDragging = false;
    
    // Remove preview and save the real block
    const start = parseInt(currentPreview.dataset.start);
    const end = parseInt(currentPreview.dataset.end);
    const category = document.getElementById('categorySelect').value;
    
    currentPreview.remove();
    currentPreview = null;

    // Only save if a valid selection was made
    if (!isNaN(start) && !isNaN(end)) {
      addTimeBlock(start, end, category);
    }
  });
}