const quotes = [
  { text: "Life is not merely being alive, but being well.", author: "Marcus Valerius Martial" },
  { text: "The purpose of life is to live it.", author: "Eleanor Roosevelt" },
  { text: "Life is short, and it's up to you to make it sweet.", author: "Sarah Louise Delany" },
  { text: "Every moment is a fresh beginning.", author: "T.S. Eliot" },
  { text: "Life is what happens while you're busy making other plans.", author: "John Lennon" },
  { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
  { text: "To live is the rarest thing in the world. Most people exist, that is all.", author: "Oscar Wilde" },
  { text: "Life is either a daring adventure or nothing at all.", author: "Helen Keller" }
];

const lifePhases = {
  childhood: { name: "Childhood", range: [0, 12], color: "#FFB6C1", message: "A time of wonder and discovery." },
  teen: { name: "Teen/Young Adult", range: [13, 25], color: "#FF7F50", message: "A period of growth, exploration and finding yourself." },
  prime: { name: "Prime", range: [26, 40], color: "#4682B4", message: "Your peak energy years - create, build, and achieve." },
  midlife: { name: "Midlife", range: [41, 60], color: "#6B8E23", message: "Balance and reflection - deepen what matters most." },
  senior: { name: "Senior", range: [61, 120], color: "#8A2BE2", message: "Wisdom and legacy - share what you've learned." }
};

function getRandomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function calculateWeeks(birthdate) {
  const birth = new Date(birthdate);
  const today = new Date();
  const totalWeeks = Math.floor((today - birth) / (1000 * 60 * 60 * 24 * 7));
  return totalWeeks;
}

function formatWeeksLived(weeks) {
  const years = Math.floor(weeks / 52);
  const remainingWeeks = weeks % 52;
  return `${years} years, ${remainingWeeks} weeks lived`;
}

function getLifePhase(ageInYears) {
  for (const phase in lifePhases) {
    const [min, max] = lifePhases[phase].range;
    if (ageInYears >= min && ageInYears <= max) {
      return lifePhases[phase];
    }
  }
  return lifePhases.senior; // Default
}

function getWeekDateRange(birthdate, weekIndex) {
  const birth = new Date(birthdate);
  const weekStart = new Date(birth);
  weekStart.setDate(birth.getDate() + weekIndex * 7);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  return {
    start: weekStart.toLocaleDateString(),
    end: weekEnd.toLocaleDateString()
  };
}

function isFirstWeekOfMonth(birthdate, weekIndex) {
  const birth = new Date(birthdate);
  const lastWeek = new Date(birth);
  lastWeek.setDate(birth.getDate() + (weekIndex - 1) * 7);
  
  const thisWeek = new Date(birth);
  thisWeek.setDate(birth.getDate() + weekIndex * 7);
  
  return lastWeek.getMonth() !== thisWeek.getMonth() || weekIndex === 0;
}

function isFirstWeekOfYear(birthdate, weekIndex) {
  const birth = new Date(birthdate);
  const lastWeek = new Date(birth);
  lastWeek.setDate(birth.getDate() + (weekIndex - 1) * 7);
  
  const thisWeek = new Date(birth);
  thisWeek.setDate(birth.getDate() + weekIndex * 7);
  
  return lastWeek.getFullYear() !== thisWeek.getFullYear() || weekIndex === 0;
}

function getMonthAndYear(birthdate, weekIndex) {
  const birth = new Date(birthdate);
  const date = new Date(birth);
  date.setDate(birth.getDate() + weekIndex * 7);
  
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  
  return { month, year };
}

function renderLifeCalendar() {
  chrome.storage.local.get(['birthdate', 'lifespan', 'milestones', 'phaseColors'], (data) => {
    const calendar = document.getElementById('life-calendar');
    const weeksLivedElement = document.getElementById('weeks-lived');
    const insightElement = document.getElementById('life-insight');
    calendar.innerHTML = '';
    
    const totalWeeks = data.lifespan * 52;
    const currentWeeks = calculateWeeks(data.birthdate);
    const percentLived = Math.round((currentWeeks / totalWeeks) * 100);

    weeksLivedElement.textContent = formatWeeksLived(currentWeeks);
    
    // Create the grid container
    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid-container';
    calendar.appendChild(gridContainer);
    
    // Add month headers row
    const monthRow = document.createElement('div');
    monthRow.className = 'month-row';
    gridContainer.appendChild(monthRow);
    
    // Add placeholders for year labels column
    // const yearPlaceholder = document.createElement('div');
    // yearPlaceholder.className = 'year-label';
    // monthRow.appendChild(yearPlaceholder);
    
    // Generate month labels for first year as a template
    const birthDate = new Date(data.birthdate);
    let currentDate = new Date(birthDate);
    let lastMonth = -1;
    
    // Create month labels for approximately one year
    for (let week = 0; week < 52; week++) {
      const month = currentDate.getMonth();
      
      // If this is a new month or first week
      if (month !== lastMonth) {
        const monthLabel = document.createElement('div');
        monthLabel.className = 'month-label';
        monthLabel.textContent = currentDate.toLocaleString('default', { month: 'short' });
        
        // Calculate how many weeks this month spans
        let weeksInMonth = 0;
        let tempDate = new Date(currentDate);
        const currentMonth = tempDate.getMonth();
        
        while (tempDate.getMonth() === currentMonth && weeksInMonth < 6) {
          tempDate.setDate(tempDate.getDate() + 7);
          weeksInMonth++;
        }
        
        // Set width based on weeks in this month
        monthLabel.style.width = `${weeksInMonth * 8 - 2}px`; // 8px per week minus 2px for spacing
        
        monthRow.appendChild(monthLabel);
        lastMonth = month;
      }
      
      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
    }
    
    // Life insight message
    const yearsLived = Math.floor(calculateWeeks(data.birthdate) / 52);
    const phase = getLifePhase(yearsLived);
    insightElement.innerHTML = `You are in your <strong>${phase.name}</strong> phase. ${phase.message}<br>You've lived <strong>${percentLived}%</strong> of your expected life journey.`;
      
    // Custom phase colors if available
    const phaseColors = data.phaseColors || {};
    const now = new Date();
    
    // Replace "Create rows for each year of life" section with fixed start date per year
    for (let year = 0; year < data.lifespan; year++) {
      const yearRow = document.createElement('div');
      yearRow.className = 'week-row';
      gridContainer.appendChild(yearRow);
      
      // Add year label
      const yearLabel = document.createElement('div');
      yearLabel.className = 'year-label';
      yearLabel.textContent = `Year ${year + 1}`;
      yearRow.appendChild(yearLabel);
      
      // Calculate the start date for this year (anchored to the original birth month/day)
      const yearStart = new Date(birthDate);
      yearStart.setFullYear(birthDate.getFullYear() + year);
      
      let currentMonth = -1;
      let isAlternateMonth = false;
      
      // Create 52 weeks for each year
      for (let week = 0; week < 52; week++) {
        const cell = document.createElement('div');
        cell.className = 'week-cell';
        const cellDate = new Date(yearStart);
        cellDate.setDate(yearStart.getDate() + week * 7);
        
        // Determine phase color as before
        const currentPhase = getLifePhase(year);
        const phaseColor = phaseColors[Object.keys(lifePhases).find(key =>
          lifePhases[key].name === currentPhase.name)] || currentPhase.color;
        
        // Check if month changed
        const weekMonth = cellDate.getMonth();
        if (weekMonth !== currentMonth) {
          currentMonth = weekMonth;
          isAlternateMonth = !isAlternateMonth;
          cell.classList.add('month-start');
        }
        if (isAlternateMonth) {
          cell.classList.add('alternate-month');
        }
        
        // Determine cell state by comparing its date range with now
        const cellEnd = new Date(cellDate);
        cellEnd.setDate(cellDate.getDate() + 6);
        if (now > cellEnd) {
          cell.classList.add('past');
          cell.style.backgroundColor = phaseColor;
          cell.style.borderWidth = '1px';
          cell.style.borderStyle = 'solid';
          cell.style.opacity = '0.7';
        } else if (now >= cellDate && now <= cellEnd) {
          cell.classList.add('current');
          cell.style.backgroundColor = phaseColor;
          cell.style.borderWidth = '1px';
          cell.style.borderStyle = 'solid';
          cell.style.opacity = '1';
        } else {
          cell.classList.add('future');
          cell.style.borderColor = phaseColor;
          cell.style.borderWidth = '1px';
          cell.style.borderStyle = 'solid';
          cell.style.opacity = '0.3';
        }
        
        // ...existing code for milestones...
        if (data.milestones && data.milestones.length > 0) {
          const weekDates = getWeekDateRange(data.birthdate, week); // placeholder if needed
          const weekMilestones = data.milestones.filter(m => {
            const milestoneDate = new Date(m.date);
            const weekStart = new Date(weekDates.start);
            const weekEnd = new Date(weekDates.end);
            return milestoneDate >= weekStart && milestoneDate <= weekEnd;
          });
          
          if (weekMilestones.length > 0) {
            cell.classList.add('milestone');
            const milestoneInfo = weekMilestones.map(m => m.title).join(', ');
            cell.setAttribute('data-milestone', milestoneInfo);
          }
        }
        
        // Enhanced tooltip with new cellDate info
        const monthName = cellDate.toLocaleString('default', { month: 'long' });
        const tooltipContent = `Year ${year + 1}, Week ${week + 1}<br>` +
          `${monthName} ${cellDate.getFullYear()}<br>` +
          `${cellDate.toLocaleDateString()} - ${new Date(cellDate.getTime() + 6 * 24 * 3600 * 1000).toLocaleDateString()}<br>` +
          `Life Phase: ${currentPhase.name}` +
          (cell.hasAttribute('data-milestone') ?
            `<br><strong>Milestone:</strong> ${cell.getAttribute('data-milestone')}` : '');
        cell.setAttribute('data-tooltip', tooltipContent);
        
        yearRow.appendChild(cell);
      }
    }
    
    initializeTooltips();
  });
}

function initializeTooltips() {
  const cells = document.querySelectorAll('.week-cell');
  
  cells.forEach(cell => {
    cell.addEventListener('mouseenter', (e) => {
      const tooltipText = cell.getAttribute('data-tooltip');
      if (!tooltipText) return;
      
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.innerHTML = tooltipText;
      
      document.body.appendChild(tooltip);
      
      const cellRect = cell.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      
      let top = cellRect.top - tooltipRect.height - 10;
      if (top < 0) {
        top = cellRect.bottom + 10;
      }
      
      tooltip.style.left = cellRect.left + (cellRect.width / 2) - (tooltipRect.width / 2) + 'px';
      tooltip.style.top = top + 'px';
      
      cell.addEventListener('mouseleave', () => {
        document.body.removeChild(tooltip);
      }, { once: true });
    });
  });
}

function updateQuote() {
  const quote = getRandomQuote();
  document.getElementById('life-message').textContent = "Remember, life is precious. Make today count.";
  document.getElementById('quote').textContent = `"${quote.text}"`;
  document.getElementById('author').textContent = `- ${quote.author}`;
  
  chrome.storage.local.get(['birthdate'], (data) => {
    if (data.birthdate) {
      const currentWeeks = calculateWeeks(data.birthdate);
      const yearsLived = Math.floor(currentWeeks / 52);
      const phase = getLifePhase(yearsLived);
      
      // Add phase-specific quote or message
      const phaseMessage = document.createElement('p');
      phaseMessage.className = 'phase-message';
      phaseMessage.innerHTML = `<strong>${phase.name} Phase:</strong> ${phase.message}`;
      
      // Insert after the author
      const authorElement = document.getElementById('author');
      if (authorElement.nextSibling) {
        authorElement.parentNode.insertBefore(phaseMessage, authorElement.nextSibling);
      } else {
        authorElement.parentNode.appendChild(phaseMessage);
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateQuote();
  renderLifeCalendar();
  
  // Add settings button functionality
  document.getElementById('settings-btn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  // Zoom functionality for the life calendar
  const calendarContainer = document.getElementById('calendar-container');
  const calendar = document.getElementById('life-calendar');
  
  // Setup container for zooming
  calendarContainer.style.overflow = 'auto';
  calendar.style.transformOrigin = 'center';
  
  let currentScale = 1;
  let pinchInitialDistance = 0;
  let pinchInitialScale = 1;

  // Mouse wheel zoom
  calendarContainer.addEventListener('wheel', (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newScale = Math.min(Math.max(currentScale + delta, 0.5), 3);
      
      if (newScale !== currentScale) {
        currentScale = newScale;
        calendar.style.transform = `scale(${currentScale})`;
      }
    }
  }, { passive: false });

  // Touch-based zoom
  calendarContainer.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      pinchInitialDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      pinchInitialScale = currentScale;
    }
  }, { passive: false });

  calendarContainer.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const currentDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      if (pinchInitialDistance > 0) {
        const scale = pinchInitialScale * (currentDistance / pinchInitialDistance);
        currentScale = Math.min(Math.max(scale, 0.5), 3);
        calendar.style.transform = `scale(${currentScale})`;
      }
    }
  }, { passive: false });

  // Reset handlers
  const resetPinch = () => {
    pinchInitialDistance = 0;
  };
  
  calendarContainer.addEventListener('touchend', resetPinch);
  calendarContainer.addEventListener('touchcancel', resetPinch);
});