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

function onAccountPageLoad(): void {
	jQuery(($) => {

		$(document).ready(function() {
			getUserInfo().then((data: User) => {

				$("#userName").html(data.username);
				$("#publicKey").html(deriveAddress(data.publickey));
				$("#emailAddress").val(data.email);
				$("#fullname").val(data.fullName);

				// genQR(data.username).then((qr) => {
				// 	$(".account-qr").attr("src", qr);
				// }).catch(reason => {
				// 	console.log(reason.message);
				// });
			}).catch(reason => { 
				console.log(reason.message);
			});
		});

		$(document).on("click", "#submitDetailsButton", async function(event: Event): Promise<void> {
			event.preventDefault();

			const emailaddress = $("#emailAddress").val();
			const fullname = $("#fullName").val();

			// console.log(username + " " + publickey + " " + emailaddress + " " + fullname);

			const resp = await fetch("/api/users", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					email: emailaddress,
					fullName: fullname
				})
			});
			if (resp.status !== 200) {
				return;
			}

			console.log("Save succesfull, please reload");

			// location.reload();

		});
	});
}

document.addEventListener("DOMContentLoaded", onAccountPageLoad);