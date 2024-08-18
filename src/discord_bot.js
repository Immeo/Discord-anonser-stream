import { Client, GatewayIntentBits } from 'discord.js';
import { CHANNEL_ID, DISC_TOKEN } from './config.js';
import { channelName, checkStreamStatus } from './twitch_fetch.js';

let isStreaming = false; // Переменная состояния стрима

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', async () => {
	console.log(`Logged in as ${client.user.tag}!`);

	// Первоначальная проверка статуса стрима
	await checkStreamAndNotify();

	// Установка интервала для проверки статуса стрима каждые 5 минут
	setInterval(async () => {
		if (!isStreaming) {
			// Проверяем только если стрим не идет
			await checkStreamAndNotify();
		} else {
			console.log('Ждем окончания стрима...');
		}
	}, 300000); // 5 минут в миллисекундах
});

// Функция для проверки статуса стрима и уведомления
const checkStreamAndNotify = async () => {
	try {
		const ckSt = await checkStreamStatus();
		console.log(ckSt);

		if (ckSt) {
			if (!isStreaming) {
				// Если стрим только что начался
				console.log('Стрим в эфире!');
				const channel = client.channels.cache.get(CHANNEL_ID);
				if (channel) {
					await channel.send(
						`https://www.twitch.tv/${channelName} сейчас в эфире! Всё на стрим!`
					);
					isStreaming = true; // Устанавливаем состояние, что стрим идет
				} else {
					console.error('Канал не найден!');
				}
			}
		} else {
			if (isStreaming) {
				// Если стрим закончился
				console.log('Стрим завершился.');
				isStreaming = false; // Сбрасываем состояние на "не идет"
			}
		}
	} catch (error) {
		console.error('Ошибка при проверке статуса стрима:', error);
	}
};

export const runningBot = async () => {
	try {
		await client.login(DISC_TOKEN);
	} catch (error) {
		console.error('Ошибка при входе в Discord:', error);
	}
};
