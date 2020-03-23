function onBillsPageLoad(): void {
	jQuery(($) => {

		$(document).ready(function() {
			
			console.log("Bills loaded");
		});
	});
}

document.addEventListener("DOMContentLoaded", onBillsPageLoad);