function getBalances(): number[] {

	const balances: number[] = [];

	balances.push(8000);
	balances.push(1200);

	return balances;

} 

function onGeneralPageLoad(): void {
	jQuery(($) => {

		$(document).ready(function() {
			$(".nav-balance").trigger("click");
		});

		$(document).on("click", ".nav-balance", function() {
			const balances = getBalances();

			if(balances.length === 2) {
				$(".balance-xrp").html(String(balances[0].toFixed(2)));
				$(".balance-euro").html(String(balances[1].toFixed(2)));
			}
		});

	});
}

document.addEventListener("DOMContentLoaded", onGeneralPageLoad);