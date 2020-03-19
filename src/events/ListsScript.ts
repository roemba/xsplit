function onListsPageLoad(): void {
	jQuery(($) => {

		$(document).on("click", ".list-item", function() {
			document.location.href="/lists/"+$(this).attr("data-id");
		});

	});
}

document.addEventListener("DOMContentLoaded", onListsPageLoad);