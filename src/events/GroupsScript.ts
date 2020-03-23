function onGroupsPageLoad(): void {
	jQuery(($) => {

		$(document).on("click", ".group-item", function() {
			document.location.href="/groups/"+$(this).attr("data-id");
		});

	});
}

document.addEventListener("DOMContentLoaded", onGroupsPageLoad);