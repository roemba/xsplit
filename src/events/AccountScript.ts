import { deriveAddress } from 'ripple-keypairs';
import { User } from "../models/User";

async function getUserInfo(): Promise<User> {

	const response = await fetch("/api/users");

	return await response.json();
}

function onAccountPageLoad(): void {
	jQuery(($) => {

		$(document).ready(function() {
			getUserInfo().then((data: User) => {
				$("#userName").html(data.username);
				$("#publicKey").html(deriveAddress(data.publickey));
				$("#emailAddress").val(data.private.email);
				$("#fullName").val(data.private.fullName);
				$("#notificationsCheck").prop("checked",data.private.notifications);
			}).catch(reason => { 
				console.log(reason.message);
			});
		});

		$(document).on("focus click", "input", function() {
			$("#success-save").hide().empty();
			$("#error-save").hide().empty();
		});

		$(document).on("click", "#submitDetailsButton", async function(event: Event) {
			event.preventDefault();

			const emailaddress = $("#emailAddress").val();
			const fullname = $("#fullName").val();
			const notifications = $("#notificationsCheck").prop("checked");

			const resp = await fetch("/api/users", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					email: emailaddress,
					fullName: fullname,
					notifications: notifications
				})
			});
			if (resp.status !== 200) {
				$("#success-save").hide().empty();
				$("#error-save").fadeIn();
				$("#error-save").html('An error occurred, please try again.');
				return;
			}

			$("#error-save").hide().empty();
			$("#success-save").fadeIn().html('Account details are successfully saved!');

		});
	});
}

document.addEventListener("DOMContentLoaded", onAccountPageLoad);