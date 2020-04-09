import { CookieUtil } from "../util/CookieUtil";

function onGroupsPageLoad(): void {
	jQuery(($) => {

		$(document).on("click", ".group-item", function() {
			document.location.href="/groups/"+$(this).attr("data-id");
		});

		$(document).on("click", "#newGroup", async function(e) {
			e.preventDefault();
			const name = $("#groupName").val();
			const description = $("#groupDescription").val();
			if (name === "") {
				return;
			}
			const response = await fetch(`/api/groups`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					description,
					name,
					participants: [await CookieUtil.getUsername()]
				})
			});
			if (response.status !== 200) {
				console.log(response.statusText);
				$("#group-success").hide().empty();
				$("#group-error").fadeIn();
				$("#group-error").html("Group couldn't be created, try again.");
				return;
			}

			$("#group-error").hide().empty();
			$("#group-success").fadeIn().html('Group created!');

			await new Promise(r => setTimeout(r, 1000));

			document.location.href="/groups";
		});

	});
}

document.addEventListener("DOMContentLoaded", onGroupsPageLoad);