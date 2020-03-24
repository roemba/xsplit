import { User } from "../models/User";

let participants: User[] = [];

function getUsername(): string {

	const cookie = "; " + document.cookie;
	const bearerStr = cookie.split("; ")[1];
	const bearer = window.atob(bearerStr.replace("bearer=",""));
	const username = bearer.split(":")[0];

	return username;
}

function newUserRow(username: string): string {
	let element = "<div class='form-row user-row mb-2' data-user='"+username+"'>";
		element += "<div class='col-6 col-lg-7 line-height'>"+username+"<img src='/assets/img/remove.svg' class='remove-user ml-2' width='15' height='15' /></div>";
		element += "<div class='col-3 col-lg-3 line-height user-amount text-right'></div>";
		element += "<div class='col-3 col-lg-2'>";
		element += "<select class='form-group form-control selectpicker border-0' data-id='"+username+"'>";
		for (let i = 1; i <= 10; i++) {
			element += "<option value='"+i+"'>"+i+"x</option>";
		}
		element += "</select>";
		element += "</div>";
		element += "</div>";

	return element;
}

async function getUser(username: string): Promise<User | undefined> {

	const response = await fetch("/api/users/"+username);
	if (response.status !== 200) {
		console.error(response.status);
		return;
	}

	const user = await response.json();

	return await user;
}

async function sendBill(subject: string, amount: number, weights: number[]): Promise<void> {

	const response = await fetch("/api/bills", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			description: subject,
			totalXrp: amount,
			participants: participants,
			weights: weights.map(w => {return {weight: w};})
		})
	});
	if (response.status !== 200) {
		console.error(response.status);
		return;
	}

	$("#bill-success").removeClass("d-none");
	$("#request-form").trigger('reset');
	$(".added-users").empty();
	$("#subject").trigger("change");
	participants = [];
}

function onRequestPageLoad(): void {

	jQuery(($) => {

		$(document).on("click", ".remove-user", function() {
			const userRow = $(this).closest(".user-row");

			const currentUsername = getUsername();
			const username = userRow.attr('data-user');

			if(username == currentUsername) {
				$("#includeCheck").prop("checked",false);
			}

			userRow.remove();
			$("#subject").trigger("change");

			participants = participants.filter(u => u.username !== username);
		});

		$(document).on("change", "#includeCheck", async function() {
			
			const username: string = getUsername();

			const user = await getUser(username);

			if(this.checked) {
				$(".added-users").prepend(newUserRow(username));

				participants.push(await user);

				$('select').selectpicker();
			}else{
				$(".user-row[data-user='"+username+"']").remove();

				participants = participants.filter(u => u.username !== username);
			}
			$("#subject").trigger("change");
		});

		$(document).on("change",".selectpicker, #includeCheck, #amount, #subject", function() {

			const selected = [];

			$(".user-row").each(function() {
				const username = $(this).attr('data-user');
				selected.push(username);
			});

			const nFriends = selected.length;
			const nAmount = $("#amount").val();

			if(Number(nAmount) > 0 && Number(nFriends) > 0) {
				$(".summary").removeClass("d-none");
				const amountFriend = Number(nAmount)/Number(nFriends);
				$(".nFriends").html(String(nFriends));
				$(".nAmount").html(String(Number(nAmount).toFixed(2)));
				$(".amountFriend").html(String(Number(amountFriend).toFixed(2)));
				
				if(String($("#subject").val()).length === 0) {
					$(".submit-request").attr("disabled","disabled");
				}else{
					$(".submit-request").removeAttr("disabled");
				}
			}else{
				$(".summary").addClass("d-none");
				$(".submit-request").attr("disabled","disabled");
			}
		});

		$("#user-search").autocomplete({
			minLength: 2,
			// eslint-disable-next-line
			source: function(request: any, response: Function) {
				$.ajax({
					type: "GET",
					url: "/api/users/search/"+request.term,
					success: function(data) {
						response(data);
					}
				});
			},
			// eslint-disable-next-line
			select: async function (event: object, ui: any) {
				const added = $("div.user-row[data-user='"+ui.item.label+"']");

				if(added.length == 0) {
					const username = getUsername();
					
					if(ui.item.label == username) {
						$("#includeCheck").prop("checked",true);
						$(".added-users").prepend(newUserRow(ui.item.label));
					}else{
						$(".added-users").append(newUserRow(ui.item.label));
					}

					const user = await getUser(ui.item.label);

					participants.push(await user);

					$("#user-search").val("");
					$('select').selectpicker();
					$("#amount").trigger("change");
				}
				return false;
			}
		});

		$(document).on("click", ".submit-request", async function(e) {
			e.preventDefault();

			const weights: number[] = [];

			$(".user-row").each(function() {
				const weight = $(this).find("select").val();
				weights.push(Number(weight));
			});

			const nAmount = Number($("#amount").val());
			const subject = String($("#subject").val());

			sendBill(subject, nAmount, weights);

		});
	});
}

document.addEventListener("DOMContentLoaded", onRequestPageLoad);