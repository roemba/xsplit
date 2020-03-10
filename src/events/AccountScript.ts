import {deriveAddress} from 'ripple-keypairs';

async function getUserInfo(): Promise<any> {

	const response = await fetch("/api/users/me");

	return await response.json()
}

async function genQR(username: string): Promise<any> {

	const response = await fetch("/api/users/qr/"+username)

	return await response.json()

}

getUserInfo().then(data => {

	$(".userName").html(data[0].username);
	$(".publicKey").html(deriveAddress(data[0].publickey));
	$(".email").html(data[0].email);

	genQR(data[0].username).then(img => {
		$(".account-qr").attr("src",img.qr)
	}).catch(reason => {
		console.log(reason.message)
	})
}).catch(reason => { 
	console.log(reason.message)
})

