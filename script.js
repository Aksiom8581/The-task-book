document.addEventListener('DOMContentLoaded', function () {
    const textTaskInput = document.getElementById('textTaskInput');
    const addButton = document.getElementById('addButton');
    const currentSelect = document.getElementById('currentSelect');
    const clearCompletedButton = document.getElementById('clearCompletedButton');
    const goCompleteButton = document.getElementById('goCompleteButton');
    const completedSelect = document.getElementById('completedSelect');
    const taskCount = document.getElementById('taskCount');
    const textCategoryInput = document.getElementById('textCategoryInput');
    const currentCategoryFilter = document.getElementById('currentCategoryFilter');
    const completedCategoryFilter = document.getElementById('completedCategoryFilter');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let categories = JSON.parse(localStorage.getItem('categories')) || { current: [], completed: [] };
    let countCurrent = 1;

    // Инициализатор
    function initTasks() {
        // Для каждой задачи создаем элемент option и добавляем в соответствующий список
        tasks.forEach(task => {
            const option = document.createElement('option');
            option.textContent = task.text;
            option.dataset.id = task.id;

            if (task.completed) {
                completedSelect.appendChild(option);
            }
            else {
                currentSelect.appendChild(option);
                countCurrent++;
            }
        });

        // Вытягиваем текущие задачи из localStorage в фильтр
        categories.current.forEach(category => {
            if (!Array.from(currentCategoryFilter.options).some(opt => opt.value === category.name)) {
                const option = document.createElement('option');
                option.textContent = category.name;
                option.dataset.id = category.id;
                currentCategoryFilter.appendChild(option);
            }
        });

        // Вытягиваем выполненные задачи из localStorage в фильтр
        categories.completed.forEach(category => {
            if (!Array.from(completedCategoryFilter.options).some(opt => opt.value === category.name)) {
                const option = document.createElement('option');
                option.textContent = category.name;
                option.dataset.id = category.id;
                completedCategoryFilter.appendChild(option);
            }
        });

        updateTextCount();
    }

    function saveCategories() {
        const currentCategories = [];
        const completedCategories = [];

        // Собираем текущие категории из фильтра
        for (let i = 0; i < currentCategoryFilter.options.length; i++) {
            if (currentCategoryFilter.options[i].value !== "all") {
                currentCategories.push({
                    id: parseInt(currentCategoryFilter.options[i].dataset.id),
                    name: currentCategoryFilter.options[i].textContent
                });
            }
        }

        // Собираем завершенные категории из фильтра
        for (let i = 0; i < completedCategoryFilter.options.length; i++) {
            if (completedCategoryFilter.options[i].value !== "all") {
                completedCategories.push({
                    id: parseInt(completedCategoryFilter.options[i].dataset.id),
                    name: completedCategoryFilter.options[i].textContent
                });
            }
        }

        // Обновляем объект категорий и сохраняем в localStorage
        categories = {
            current: currentCategories,
            completed: completedCategories
        };

        localStorage.setItem('categories', JSON.stringify(categories));
    }

    initTasks();

    // Фильтрация задач по выбранным категориям
    function filterTasksByCategory() {
        const currentSelectedCategory = currentCategoryFilter.value;
        const completedSelectedCategory = completedCategoryFilter.value;

        // Фильтруем текущие задачи
        for (let i = 0; i < currentSelect.options.length; i++) {
            const option = currentSelect.options[i];
            if (currentSelectedCategory === "all" || !currentSelectedCategory) {
                option.style.display = '';
            } else {
                const task = tasks.find(t => t.id === parseInt(option.dataset.id));
                option.style.display = task.category === currentSelectedCategory ? '' : 'none';
            }
        }

        // Фильтруем завершенные задачи
        for (let i = 0; i < completedSelect.options.length; i++) {
            const option = completedSelect.options[i];
            if (completedSelectedCategory === "all" || !completedSelectedCategory) {
                option.style.display = '';
            } else {
                const task = tasks.find(t => t.id === parseInt(option.dataset.id));
                option.style.display = task.category === completedSelectedCategory ? '' : 'none';
            }
        }
    }

    function addTask() {
        if (textTaskInput.value.trim()) {
            const taskText = textTaskInput.value.trim();
            const categoryName = textCategoryInput.value.trim() || 'Без названия';

            // Создаем новую задачу
            const newTask = {
                id: countCurrent,
                text: taskText,
                category: categoryName,
                completed: false
            };

            // Создаем элемент option для новой задачи
            const newOptionTask = document.createElement('option');
            newOptionTask.textContent = newTask.text;
            newOptionTask.dataset.id = newTask.id;
            newOptionTask.className = 'currentSelect-option';

            // Проверяем, существует ли уже такая категория
            let categoryExists = false;
            const categoryOptions = currentCategoryFilter.querySelectorAll('option');

            for (const option of categoryOptions) {
                if (option.textContent === categoryName) {
                    categoryExists = true;
                    break;
                }
            }

            // Если категория новая, добавляем ее в фильтр
            if (!categoryExists) {
                const newOptionCategory = document.createElement('option');
                newOptionCategory.dataset.id = newTask.id;
                newOptionCategory.textContent = categoryName;
                currentCategoryFilter.appendChild(newOptionCategory);
                saveCategories();
            }

            currentSelect.appendChild(newOptionTask);
            textTaskInput.value = '';
            textCategoryInput.value = '';

            countCurrent++;
            tasks.push(newTask);
            updateTextCount();
            saveTasks();

            // Анимация добавления новой задачи
            setTimeout(() => {
                newOptionTask.style.animation = 'none';
                void newOptionTask.offsetWidth;
                newOptionTask.style.animation = 'fadeInDrop 0.5s ease-out forwards';
            }, 10);
        }
    }

    // Перемещение задачи и категории в "Выполненные задачи"
    function performTask() {
        if (currentSelect.selectedIndex >= 0) {
            const selectedOption = currentSelect.options[currentSelect.selectedIndex];
            const taskId = parseInt(selectedOption.dataset.id);

            const taskIndex = tasks.findIndex(task => task.id === taskId);
            if (taskIndex !== -1) {
                tasks[taskIndex].completed = true;

                selectedOption.className = 'completedSelect-option';
                completedSelect.appendChild(selectedOption);

                const categoryName = tasks[taskIndex].category;

                // Проверяем, остались ли задачи в этой категории
                const hasOtherTasksInCategory = tasks.some(
                    task => !task.completed && task.category === categoryName
                );

                // Если в категории не осталось задач, удаляем категорию из текущих
                if (!hasOtherTasksInCategory) {
                    const currentCategoryOptions = currentCategoryFilter.options;
                    for (let i = 0; i < currentCategoryOptions.length; i++) {
                        if (currentCategoryOptions[i].textContent === categoryName) {
                            currentCategoryFilter.remove(i);
                            break;
                        }
                    }
                }

                // Проверяем, есть ли уже такая категория в завершенных
                let categoryExistsInCompleted = false;
                const completedCategoryOptions = completedCategoryFilter.options;
                for (let i = 0; i < completedCategoryOptions.length; i++) {
                    if (completedCategoryOptions[i].textContent === categoryName) {
                        categoryExistsInCompleted = true;
                        break;
                    }
                }

                // Если категории нет в завершенных, добавляем ее
                if (!categoryExistsInCompleted) {
                    const newOption = document.createElement('option');
                    newOption.dataset.id = taskId;
                    newOption.textContent = categoryName;
                    completedCategoryFilter.appendChild(newOption);
                }

                countCurrent--;
                updateTextCount();
                saveTasks();
                saveCategories();

                // Анимация перемещения задачи
                setTimeout(() => {
                    selectedOption.style.animation = 'none';
                    void selectedOption.offsetWidth;
                    selectedOption.style.animation = 'fadeInDrop 0.5s ease-out forwards';
                }, 10);
            }
        }
    }

    // Удаление выполненной задачи
    function removeCompletedTask() {
        if (completedSelect.selectedIndex >= 0) {
            const selectedOption = completedSelect.options[completedSelect.selectedIndex];
            const taskId = parseInt(selectedOption.dataset.id);

            // Находим задачу, которую удаляем
            const taskToRemove = tasks.find(task => task.id === taskId);
            if (!taskToRemove) return;

            // Удаляем задачу из массива
            tasks = tasks.filter(task => task.id !== taskId);

            // Проверяем, есть ли еще задачи с этой категорией в выполненных
            const hasOtherTasksInCategory = tasks.some(
                task => task.completed && task.category === taskToRemove.category
            );

            // Если это последняя задача в категории, удаляем категорию из фильтра выполненных
            if (!hasOtherTasksInCategory) {
                const completedCategoryOptions = completedCategoryFilter.options;
                for (let i = 0; i < completedCategoryOptions.length; i++) {
                    if (completedCategoryOptions[i].textContent === taskToRemove.category) {
                        completedCategoryFilter.remove(i);
                        break;
                    }
                }
            }

            // Удаляем задачу из интерфейса
            completedSelect.remove(completedSelect.selectedIndex);
            saveTasks();
            saveCategories(); // Не забываем сохранить изменения в категориях
        }
    }

    // Обновление счётчика текущих задач
    function updateTextCount() {
        taskCount.textContent = `оставшиеся задачи: ${countCurrent - 1}`;
    }

    // Сохранение задач в localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    currentCategoryFilter.addEventListener('change', filterTasksByCategory);
    completedCategoryFilter.addEventListener('change', filterTasksByCategory);

    addButton.addEventListener("click", addTask);
    goCompleteButton.addEventListener("click", performTask);
    clearCompletedButton.addEventListener("click", removeCompletedTask);
});
