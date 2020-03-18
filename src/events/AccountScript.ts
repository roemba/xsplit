import {deriveAddress} from 'ripple-keypairs';
import {User} from "../models/User";

async function getUserInfo(): Promise<User> {

	const response = await fetch("/api/users");

	return await response.json();
}

async function genQR(username: string): Promise<string> {

	const response = await fetch("/api/users/qr/"+username);

	return (await response.json())['qr'];

}

getUserInfo().then((data: User) => {

	$(".userName").html(data.username);
	$(".publicKey").html(deriveAddress(data.publickey));
	$(".email").html(data.email);
	$(".fname").html(data.fullName);

	genQR(data.username).then((qr) => {
		$(".account-qr").attr("src", qr);
	}).catch(reason => {
		console.log(reason.message);
	});
}).catch(reason => { 
	console.log(reason.message);
});

