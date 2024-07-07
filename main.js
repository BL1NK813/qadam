document.addEventListener('DOMContentLoaded', function() {
    let energyTap = 500;
    let isMouseDown = false;
    let isClickHandled = false; // Флаг для предотвращения двойного нажатия
    const energyTapMax = 500;
    const energyTapDecrement = 9;
    const coinsIncrement = 3;
    const coinsInSecond = 100;

    const tg = window.Telegram.WebApp;

    // Убедитесь, что SDK загружен
    if (tg) {
        // Получаем информацию о пользователе
        const user = tg.initDataUnsafe.user;

        if (user && user.username) {
            // Вставляем username в элемент с id 'tg_name_id'
            document.getElementById("tg_name_id").textContent =  user.first_name;

            const userId = user.id;
            saveUserIdToDatabase(userId); // Функция для отправки на сервер
        } else {
            // Если username не найден, показываем что-то другое
            document.getElementById("tg_name_id").textContent = "Неизвестный";
        }
    } else {
        console.error("Telegram Web Apps SDK не найден.");
    }

    function saveUserIdToDatabase(userId) {
        // URL вашего локального сервера или временный адрес через ngrok
        const url = 'https://41a7-84-54-92-163.ngrok-free.app'; // Пример ngrok адреса

        // Данные для отправки на сервер (user_id)
        const data = {
            user_id: userId
        };

        // Опции запроса
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };

        // Отправка запроса
        fetch(url, options)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Данные успешно сохранены на сервере:', data);
            })
            .catch(error => {
                console.error('Ошибка при сохранении данных на сервере:', error);
            });
    }

    // Устанавливаем интервал для восстановления энергии каждую секунду
    setInterval(restoreEnergy, 1030);

    // Устанавливаем интервал для пассивного увеличения монет каждую секунду
    setInterval(increaseFarmCoinsPassively, 36000);


    const button = document.querySelector('.coin_button');
    button.addEventListener('mousedown', function(event) {
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;

        button.style.transition = 'transform 0.2s ease';
    });

    button.addEventListener('mouseup', function() {
        button.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)';
        requestAnimationFrame(() => {
            button.style.transform = 'rotateX(0deg) rotateY(0deg)';
        });
    });

    button.addEventListener('mouseout', function() {
        button.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)';
        requestAnimationFrame(() => {
            button.style.transform = 'rotateX(0deg) rotateY(0deg)';
        });
    });

    // Обработка нажатия мыши
    button.addEventListener('mousedown', handleMouseDown);
    button.addEventListener('touchstart', handleMouseDown); // Для сенсорных экранов

    // Обработка отпускания мыши
    button.addEventListener('mouseup', handleMouseUp);
    button.addEventListener('touchend', handleMouseUp); // Для сенсорных экранов

    function handleMouseDown(event) {
        isMouseDown = true;
        button.style.transform = 'scale(0.9)';
        button.style.webkitTransform = 'scale(0.9)';
        handleClick(event);
    }

    function handleMouseUp() {
        isMouseDown = false;
        button.style.transform = 'scale(1)';
        button.style.webkitTransform = 'scale(1)';
    }

    async function handleClick(event) {
        if (isMouseDown && !isClickHandled && energyTap >= energyTapDecrement) {
            isClickHandled = true; // Устанавливаем флаг обработки клика
            energyTap -= energyTapDecrement;
            coinsProgress += coinsIncrement;
            updateEnergyDisplay();
            updateCoinsProgressDisplay();
            updateFarmCoinsDisplay();
            showCoinNotification(`+${coinsIncrement}`, event.clientX, event.clientY);
            increaseProgress();
            // Сбрасываем флаг обработки клика через короткое время, чтобы позволить новым кликам обрабатываться
            setTimeout(() => {
                isClickHandled = false;
            }, 190);
        }
    }

    function restoreEnergy() {
        if (energyTap < energyTapMax) {
            energyTap += Math.ceil(((coinsInSecond/60)/60)); // Скорость восстановления энергии
            if (energyTap > energyTapMax) {
                energyTap = energyTapMax; // Предотвращаем превышение максимума
            }
            updateEnergyDisplay();
        }
    }

    function increaseFarmCoinsPassively() {
        const farmCoinsElement = document.querySelector('.farm_coins');
        const currentFarmCoins = parseInt(farmCoinsElement.textContent) || 0;
        const energyTapElement = document.querySelector('.farm_coins');
        const imgElement = energyTapElement.querySelector('img');
        const imgUrl = imgElement.getAttribute('src');
        farmCoinsElement.innerHTML = `<img src="${imgUrl}" alt="coin">${currentFarmCoins + 1}`;
    }

    function updateEnergyDisplay() {
        const energyDisplay = document.querySelector('.energy_tap');
        const energyTapElement = document.querySelector('.energy_tap');
        const imgElement = energyTapElement.querySelector('img');
        const imgUrl = imgElement.getAttribute('src');
        energyDisplay.innerHTML = `<img src="${imgUrl}" alt="energy">${energyTap}/${energyTapMax}`;
    }

    function updateCoinsProgressDisplay() {
        const coinsProgressDisplay = document.querySelector('.farm_coins');
        const energyTapElement = document.querySelector('.farm_coins');
        const imgElement = energyTapElement.querySelector('img');
        const imgUrl = imgElement.getAttribute('src');
        coinsProgressDisplay.innerHTML = `<img src="${imgUrl}" alt="coin">${coinsProgress}`;
    }

    function updateFarmCoinsDisplay() {
        const farmCoinsElement = document.querySelector('.farm_coins');
        const energyTapElement = document.querySelector('.farm_coins');
        const imgElement = energyTapElement.querySelector('img');
        const imgUrl = imgElement.getAttribute('src');
        farmCoinsElement.innerHTML = `<img src="${imgUrl}" alt="coin">${parseInt(farmCoinsElement.textContent) || 0}`;
    }
});
