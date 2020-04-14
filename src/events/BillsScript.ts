function onBillsPageLoad(): void {
	jQuery(($) => {

		$(document).ready(async function() {

			$(document).on("click", ".set-paid-button", async function(e) {
				e.preventDefault();
				const trId = e.currentTarget.id.split("_")[1];
				const response = await fetch("/api/transactions/paid/" + trId, {
					method: "PUT",
				});
				if (response.status === 200) {
					await new Promise(r => setTimeout(r, 1000));
					document.location.href="/bills";
				} else {
					console.log(response.statusText);
				}
			});

			$(document).on("click", ".remove-bill", async function() {
				const billID = $(this).attr('data-id');

				const response = await fetch("/api/bills/"+billID, {
					method: "DELETE",
					headers: {
						"Content-Type": "application/json"
					}
				});

				if (response.status !== 200) {
					console.log(response.status);
					return;
				}

				$(".bill-item[bill-id='"+billID+"']").fadeOut(500, function() {
					$(this).remove();
				});

			});
		});
	});
}

document.addEventListener("DOMContentLoaded", onBillsPageLoad);