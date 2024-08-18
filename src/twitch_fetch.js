import puppeteer from 'puppeteer';
// Ввидите название канала
export const channelName = '';
export let streamStatusDetected = false;

// Функция для ожидания успешной проверки элемента
const waitForElement = async (page, selector, timeout = 5000) => {
	const startTime = Date.now();
	while (Date.now() - startTime < timeout) {
		const elem = await page.$(selector);
		if (elem) {
			return true; // Элемент найден
		}
		await new Promise(resolve => setTimeout(resolve, 900)); // Ждем 900 мс перед следующей попыткой
	}
	return false; // Элемент не найден в течение времени ожидания
};

export const checkStreamStatus = async () => {
	let statusNow = false;
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	try {
		// Переходим на страницу канала
		await page.goto(`https://www.twitch.tv/${channelName}`, {
			waitUntil: 'networkidle2'
		});

		// Ожидаем появления элемента, который указывает на эфир
		const elementFound = await waitForElement(page, '.live-time');
		if (!elementFound) {
			console.log(`${channelName} не в эфире.`);
			return false;
		}

		const streamDuration = await page.evaluate(() => {
			const elem = document.querySelector('.live-time');
			return elem ? elem.textContent.trim() : '0';
		});

		const durationInSeconds = parseDuration(streamDuration);

		if (durationInSeconds > 5) {
			statusNow = true;
		} else {
			statusNow = false;
		}
	} catch (err) {
		console.error(err);
	} finally {
		await browser.close(); // Закрытие браузера всегда
	}

	return statusNow;
};

// Функция для парсинга продолжительности стрима
const parseDuration = duration => {
	const timeParts = duration.split(':');
	let totalSeconds = 0;

	if (timeParts.length === 2) {
		totalSeconds = parseInt(timeParts[0]) * 60 + parseInt(timeParts[1]); // ЧЧ:ММ
	} else if (timeParts.length === 3) {
		totalSeconds =
			parseInt(timeParts[0]) * 3600 +
			parseInt(timeParts[1]) * 60 +
			parseInt(timeParts[2]); // ЧЧ:ММ:СС
	}

	return totalSeconds;
};

// Начальная проверка
checkStreamStatus();
