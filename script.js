document.addEventListener('DOMContentLoaded', function () {
    const textTaskInput = document.getElementById('textTaskInput');
    const addButton = document.getElementById('addButton');
    const currentSelect = document.getElementById('currentSelect');
    const clearCompletedButton = document.getElementById('clearCompletedButton');
    const goCompleteButton = document.getElementById('goCompleteButton');
    const completedSelect = document.getElementById('completedSelect');
    const taskCount = document.getElementById('taskCount');
    let count = 0;

    function addTask() {
        if (textTaskInput.value.trim()) {
            const newOption = document.createElement('option');
            newOption.textContent = textTaskInput.value;

            currentSelect.appendChild(newOption);

            textTaskInput.value = '';

            count++
            updateTextCount();
        }
    }

    function performTask() {
        if (currentSelect.selectedIndex >= 0) {
            const newOption = document.createElement('option');
            newOption.textContent = currentSelect.options[currentSelect.selectedIndex].textContent;

            completedSelect.appendChild(newOption);

            currentSelect.remove(currentSelect.selectedIndex);
			
			count--;
			updateTextCount();
        }
    }

    function removeCompletedTask() {
        if (completedSelect.selectedIndex >= 0) {
            completedSelect.remove(completedSelect.selectedIndex);
        }
    }

    function updateTextCount() {
        taskCount.textContent = `оставшиеся задачи: ${count}`;
    }

    addButton.addEventListener("click", addTask);
    goCompleteButton.addEventListener("click", performTask);
    clearCompletedButton.addEventListener("click", removeCompletedTask);
});