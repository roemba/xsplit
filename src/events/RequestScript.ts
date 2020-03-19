function onRequestPageLoad(): void {
	jQuery(($) => {

		function getUsername(): string {

			const cookie = "; " + document.cookie;
			const bearerStr = cookie.split("; ")[1];
			const bearer = window.atob(bearerStr.replace("bearer=",""));
			const username = bearer.split(":")[0];

			return username;
		}

		function getUserRow(username: string): string {
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

		$(document).on("click", ".remove-user", function() {
			const userRow = $(this).closest(".user-row");

			const username = getUsername();

			if(userRow.attr('data-user') == username) {
				$("#includeCheck").prop("checked",false);
			}

			userRow.remove();
			$("#subject").trigger("change");
		});

		$(document).on("change", "#includeCheck", function() {
			
			const username: string = getUsername();

			if(this.checked) {
				$(".added-users").prepend(getUserRow(username));
				$('select').selectpicker();
			}else{
				$(".user-row[data-user='"+username+"']").remove();
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
				console.log("typeof request " + typeof request);
				$.ajax({
					type: "GET",
					url: "/api/users/search/"+request.term,
					success: function(data) {
						response(data);
					}
				});
			},
			// eslint-disable-next-line
			select: function (event: object, ui: any) {
				console.log("type of ui" + typeof ui);
				const added = $("div.user-row[data-user='"+ui.item.label+"']");

				if(added.length == 0) {
					const username = getUsername();
					
					if(ui.item.label == username) {
						$("#includeCheck").prop("checked",true);
						$(".added-users").prepend(getUserRow(ui.item.label));
					}else{
						$(".added-users").append(getUserRow(ui.item.label));
					}

					$("#user-search").val("");
					$('select').selectpicker();
					$("#amount").trigger("change");
				}
				return false;
			}
		});

		$(document).on("click", ".submit-request", function(e) {
			e.preventDefault();

			const selected: string[] = [];
			const weights: number[] = [];

			$(".user-row").each(function() {
				const username = $(this).attr('data-user');
				const weight = $(this).find("select").val();

				selected.push(username);
				weights.push(Number(weight));
			});

			const nAmount = Number($("#amount").val());
			const subject = $("#subject").val();
			
			const nSplits = weights.reduce((a, b) => a + b, 0);
			let difference: number = nAmount;

			selected.forEach((username: string, index: number) => {

				const thisAmount = Math.floor(nAmount/nSplits*weights[index]*100)/100;

				difference -= thisAmount;

				// TODO: connect to controller.

				console.log("Transaction with subject " + subject + " sent to " + username + ", Amount: " + thisAmount);
			});

			console.log("Difference in total: " + difference.toFixed(2));

		});
	});
}

document.addEventListener("DOMContentLoaded", onRequestPageLoad);