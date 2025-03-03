/* eslint-disable no-console */
import { faker } from '@faker-js/faker';
import { mailTransporter } from '../src/lib/mailTransport/index';

let fakeEmailsToGenerate = 100;

async function sendFakeEmail() {
	const fakeEmailFrom = `"${faker.internet.displayName()}" <${faker.internet.email()}>`;
	const fakeEmailTo = 'dev.test@local.dev';

	await mailTransporter.sendMail({
		from: fakeEmailFrom,
		to: fakeEmailTo,
		subject: faker.food.dish(),
		html: faker.food.description()
	});
}

while (fakeEmailsToGenerate > 0) {
	await sendFakeEmail();
	fakeEmailsToGenerate = fakeEmailsToGenerate - 1;
}
