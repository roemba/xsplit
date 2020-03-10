function onRequestPageLoad(): void {
	jQuery(($) => {

		$(document).on("change",".selectpicker, #meCheckbox, #amount, #subject", function() {

			const selected = [];
			$(".selectpicker").find("option:selected").each(function(key,value){
				selected.push(value.innerHTML); 
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

		$(document).on("click", ".submit-request", function(e) {
			e.preventDefault();

			const selected: string[] = [];
			$(".selectpicker").find("option:selected").each(function(key,value){
				selected.push(value.innerHTML); 
			});

			const nFriends = selected.length;
			const nAmount = $("#amount").val();

			const amountFriend = Number(nAmount)/Number(nFriends);

			selected.forEach(async friend => {
				// POST REQUEST TO TRANSACTIONREGISTER
				if(friend !== "Me") {
					console.log(friend + " must pay me €" + Number(amountFriend).toFixed(2));
					const subject = $("#subject").val();
					// Obtain my username from api
					const from = "Me";

					let resp;
					try {
						resp = await fetch("/api/transaction/", {
							method: "POST",
							headers: {
								"Content-Type": "application/json"
							},
							body: JSON.stringify({
								subject: subject,
								from: from,
								amount: amountFriend
							})
						});
					} catch (reason) {
						console.log(reason.message);
					}

					if (resp.status !== 200) {
						console.error(resp.status);
						return;
					}

					console.log("Transaction sent");
				}
			});
		});
	});
}

document.addEventListener("DOMContentLoaded", onRequestPageLoad);