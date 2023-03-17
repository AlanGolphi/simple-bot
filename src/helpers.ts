const fs = require('fs');
import axios from 'axios';
const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);
const botName = 'YingChat';
import { Message } from 'wechaty';
import { WechatyInterface } from 'wechaty/impls';

// export async function getOpenAiReply(prompt: string) {
// 	console.log('🚀🚀🚀 / prompt', prompt);
// 	const models = await openai.listModels();
// 	console.log('all models: ', models);
// 	const response = await openai.createCompletion({
// 		model: 'text-davinci-003',
// 		prompt: prompt,
// 		temperature: 0.9,
// 		max_tokens: 4000,
// 		top_p: 1,
// 		frequency_penalty: 0.0,
// 		presence_penalty: 0.6,
// 		stop: [' Human:', ' AI:']
// 	});

// 	const reply = response.data.choices[0].text;
// 	console.log('🚀🚀🚀 / reply', reply);
// 	return reply;
// }

const getOpenAiReply = async (input: string) => {
	try {
		const data = {
			model: 'gpt-3.5-turbo',
			messages: [{ role: 'user', content: input }]
		};

		const config = {
			method: 'post',
			maxBodyLength: Infinity,
			url: 'https://api.openai.com/v1/chat/completions',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
			},
			data: data,
			proxy: {
				host: '127.0.0.1',
				port: 7890,
				protocol: 'http'
			}
		};
		const completion = await axios(config)
			.then((response) => {
				console.log('response.data:', JSON.stringify(response.data));
				const reply = response.data.choices[0].message.content;
				return reply.replace('\n\n', '');
			})
			.catch((error) => {
				console.log(error);
			});

		return completion;
	} catch (error) {
		console.log(error);
	}
};

export async function processMsg(msg: Message, bot: WechatyInterface) {
	const contact = msg.talker();
	const content = msg.text();
	const room = msg.room();
	const roomName = (await room?.topic()) || null;
	const alias = (await contact.alias()) || (await contact.name());
	const remarkName = await contact.alias();
	const name = await contact.name();
	const isText = msg.type() === bot.Message.Type.Text;
	const isRoom = !!room && content.includes(`${botName}`);
	// const isAlias = aliasWhiteList.includes(remarkName) || aliasWhiteList.includes(name)
	const isBotSelf = botName === remarkName || botName === name;
	const msgDate = new Date(msg.date()).getTime();
	const systemExcuteTime = process.env.systemExcuteTime;

	if (isText && !isBotSelf && systemExcuteTime && msgDate > Number(systemExcuteTime)) {
		try {
			if (isRoom && room) {
				await room.say(await getOpenAiReply(content.replace(`@${botName}`, '')), contact);
				return;
			}
			if (!room) {
				await contact.say(await getOpenAiReply(content));
			}
		} catch (e) {
			console.error(e);
			if (isRoom && room) {
				await room.say('获取失败，请稍后重试😭😭😭', contact);
				return;
			}
			if (!room) {
				await contact.say('获取失败，请稍后重试😭😭😭');
			}
		}
	}
}

export { getOpenAiReply };

export const writeToLocal = async (path: any, data: any) =>
	fs.writeFile(path, `const contactList = ${data}`, () => console.log('write contact list done'));
