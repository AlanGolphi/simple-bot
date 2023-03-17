import { WechatyBuilder, ScanStatus, log, Contact } from 'wechaty';
import * as qrTerm from 'qrcode-terminal';
import { writeToLocal, getOpenAiReply, processMsg } from './helpers';
import * as QRCode from 'qrcode';
import md5 from 'md5';
import axios from 'axios';

const bot = WechatyBuilder.build({
	name: 'YingChat',
	puppet: 'wechaty-puppet-wechat',
	puppetOptions: {
		uos: true
	}
});

// async function onReady() {
// 	const contactList = await bot.Contact.findAll();

// 	log.info('Bot', '#######################');
// 	log.info('Bot', 'Contact number: %d\n', contactList.length);
// 	log.info('contact type: ', bot.Contact.Type);

// 	const list: any[] = [];

// 	contactList.forEach((contact) => {
// 		if (contact.type() === 1 && contact.payload?.alias !== '') list.push(contact);
// 	});

// 	log.info('friend list: ', list.length);

// 	await writeToLocal('./src/contactList.js', list);
// 	process.env.systemExcuteTime = String(Date.now());
// }

const onReady = () => {
	log.info('Bot ready!', '------------------------->');
};

const onScan = (qrcode: any, status: ScanStatus) => {
	if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
		qrTerm.generate(qrcode, { small: true });
		QRCode.toDataURL(qrcode, (err: any, url: string) => {
			const weComWebHook = process.env.WECOM_WEBHOOK_URL;
			if (!weComWebHook) return;

			const qrCodeBuffer = Buffer.from(url.replace('data:image/png;base64,', ''), 'base64');
			const headers = { 'Content-Type': 'application/json' };
			const data = {
				msgtype: 'image',
				image: {
					base64: url.replace('data:image/png;base64,', ''),
					md5: md5(qrCodeBuffer)
				}
			};
			axios({
				url: weComWebHook,
				method: 'post',
				headers,
				data
			}).then((postCodeResult) =>
				log.info('sended qrcode to weCom: ', postCodeResult?.data?.errmsg)
			);
		});

		const qrcodeImageUrl = ['https://wechaty.js.org/qrcode/', encodeURIComponent(qrcode)].join('');
		log.info('StarterBot', 'onScan: %s(%s) - %s', ScanStatus[status], status, qrcodeImageUrl);
	} else {
		log.info('StarterBot', 'onScan: %s(%s)', ScanStatus[status], status);
	}
};

const onLogin = (user: any) => {
	log.info('StarterBot', '%s login', user);
};

function onLogout(user: any) {
	log.info('StarterBot', '%s logout', user);
}

async function onMessage(msg: any) {
	log.info('StarterBot', msg.toString());

	if (msg.text() === 'ding') msg.say('dong');

	if (msg.type() === bot.Message.Type.Text) {
		processMsg(msg, bot);
	}
}

// Starting the bot
bot
	.on('scan', onScan)
	.on('login', onLogin)
	.on('message', onMessage)
	.on('logout', onLogout)
	.on('ready', onReady)
	.start();
