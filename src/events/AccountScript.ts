function onAccountPageLoad(): void {
	jQuery(($) => {

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