document.addEventListener('DOMContentLoaded', () => {
  // Tab navigation
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked tab and its content
      tab.classList.add('active');
      const tabId = tab.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });

  // Load saved settings
  chrome.storage.local.get([
    'birthdate', 
    'lifespan', 
    'showReminder', 
    'theme',
    'milestones',
    'phaseColors'
  ], (data) => {
    // Basic settings
    if (data.birthdate) {
      document.getElementById('birthdate').value = data.birthdate;
    }
    if (data.lifespan) {
      document.getElementById('lifespan').value = data.lifespan;
    }
    document.getElementById('showReminder').checked = data.showReminder !== false;
    
    // Theme settings
    const currentTheme = data.theme || 'default';
    document.querySelectorAll('.theme-option').forEach(option => {
      if (option.getAttribute('data-theme') === currentTheme) {
        option.classList.add('selected');
      }
    });
    
    // Phase colors
    const phaseColors = data.phaseColors || {
      childhood: '#FFB6C1',
      teen: '#FF7F50',
      prime: '#4682B4',
      midlife: '#6B8E23',
      senior: '#8A2BE2'
    };
    
    document.getElementById('childColor').value = phaseColors.childhood;
    document.getElementById('teenColor').value = phaseColors.teen;
    document.getElementById('primeColor').value = phaseColors.prime;
    document.getElementById('midlifeColor').value = phaseColors.midlife;
    document.getElementById('seniorColor').value = phaseColors.senior;
    
    // Load milestones
    loadMilestones(data.milestones || []);
  });

  // Save basic settings
  document.getElementById('saveBasic').addEventListener('click', () => {
    const birthdate = document.getElementById('birthdate').value;
    const lifespan = document.getElementById('lifespan').value;
    const showReminder = document.getElementById('showReminder').checked;

    chrome.storage.local.set({
      birthdate,
      lifespan: parseInt(lifespan),
      showReminder
    }, () => {
      const status = document.getElementById('basicStatus');
      status.style.display = 'block';
      setTimeout(() => {
        status.style.display = 'none';
      }, 2000);
    });
  });
  
  // Save appearance settings
  document.getElementById('saveAppearance').addEventListener('click', () => {
    const selectedTheme = document.querySelector('.theme-option.selected')?.getAttribute('data-theme') || 'default';
    
    const phaseColors = {
      childhood: document.getElementById('childColor').value,
      teen: document.getElementById('teenColor').value,
      prime: document.getElementById('primeColor').value,
      midlife: document.getElementById('midlifeColor').value,
      senior: document.getElementById('seniorColor').value
    };
    
    chrome.storage.local.set({
      theme: selectedTheme,
      phaseColors
    }, () => {
      const status = document.getElementById('appearanceStatus');
      status.style.display = 'block';
      setTimeout(() => {
        status.style.display = 'none';
      }, 2000);
    });
  });
  
  // Theme selection
  document.querySelectorAll('.theme-option').forEach(option => {
    option.addEventListener('click', () => {
      document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('selected'));
      option.classList.add('selected');
    });
  });
  
  // Milestones functionality
  document.getElementById('addMilestone').addEventListener('click', addMilestone);
  
  function addMilestone() {
    const titleInput = document.getElementById('milestoneTitle');
    const dateInput = document.getElementById('milestoneDate');
    
    const title = titleInput.value.trim();
    const date = dateInput.value;
    
    if (!title || !date) {
      alert('Please enter both a title and date for your milestone.');
      return;
    }
    
    chrome.storage.local.get(['milestones'], (data) => {
      const milestones = data.milestones || [];
      const newMilestone = { id: Date.now(), title, date };
      
      milestones.push(newMilestone);
      milestones.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      chrome.storage.local.set({ milestones }, () => {
        // Clear inputs
        titleInput.value = '';
        dateInput.value = '';
        
        // Show success message
        const status = document.getElementById('milestoneStatus');
        status.style.display = 'block';
        setTimeout(() => {
          status.style.display = 'none';
        }, 2000);
        
        // Reload milestones list
        loadMilestones(milestones);
      });
    });
  }
  
  function loadMilestones(milestones) {
    const milestoneList = document.getElementById('milestoneList');
    milestoneList.innerHTML = '';
    
    if (milestones.length === 0) {
      milestoneList.innerHTML = '<p>No milestones added yet. Add your first milestone above!</p>';
      return;
    }
    
    milestones.forEach(milestone => {
      const milestoneElement = document.createElement('div');
      milestoneElement.className = 'milestone';
      milestoneElement.dataset.id = milestone.id;
      
      const formattedDate = new Date(milestone.date).toLocaleDateString();
      
      milestoneElement.innerHTML = `
        <div class="milestone-details">
          <div class="milestone-title">${milestone.title}</div>
          <div class="milestone-date">${formattedDate}</div>
        </div>
        <div class="milestone-actions">
          <button class="delete-milestone" data-id="${milestone.id}">Delete</button>
        </div>
      `;
      
      milestoneList.appendChild(milestoneElement);
    });
    
    // Add event listeners for delete buttons
    document.querySelectorAll('.delete-milestone').forEach(button => {
      button.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        deleteMilestone(id);
      });
    });
  }
  
  function deleteMilestone(id) {
    chrome.storage.local.get(['milestones'], (data) => {
      const milestones = data.milestones || [];
      const updatedMilestones = milestones.filter(m => m.id !== id);
      
      chrome.storage.local.set({ milestones: updatedMilestones }, () => {
        loadMilestones(updatedMilestones);
      });
    });
  }
});