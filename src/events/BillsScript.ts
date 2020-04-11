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
		});
	});
}

document.addEventListener("DOMContentLoaded", onBillsPageLoad);