let selectedUser: string = undefined;

async function addUser(userId: string, groupId: string): Promise<void> {

	const response = await fetch(`/api/groups/${groupId}/user/${userId}`, {
		method: "PUT"
	});
	if (response.status !== 200) {
		$("#user-success").hide().empty();
		$("#user-error").fadeIn();
		$("#user-error").html(response.statusText);
		return;
	}

	$("#user-error").hide().empty();
    $("#user-success").fadeIn().html('User added to group!');
    
    await new Promise(r => setTimeout(r, 1000));
    
    document.location.href="/groups/" + groupId;
}

async function settleBalances(groupId: string): Promise<void> {

	const response = await fetch(`/api/groups/${groupId}/settle`, {
		method: "PUT"
	});
	if (response.status !== 200) {
		$("#settle-success").hide().empty();
		$("#settle-error").fadeIn();
		$("#settle-error").html(response.statusText);
		return;
	}

	$("#settle-error").hide().empty();
    $("#settle-success").fadeIn().html('Created transaction requests for settlement!');
}

function onRequestPageLoad(): void {
	jQuery(($) => {

		$(document).on("focus click", "input", function() {
			$("#bill-success").hide().empty();
			$("#bill-error").hide().empty();
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
					selectedUser = ui.item.label;

                    $("#user-search").val(selectedUser);
                    $('select').selectpicker();
                    $(".submit-request").removeAttr("disabled");
				}
				return false;
			}
		});

		$(document).on("click", "#addUser", async function(e) {
			e.preventDefault();
            const groupId = $("#groupId")[0].innerHTML;
			addUser(selectedUser, groupId);
        });
        
        $(document).on("click", "#settleBalances", async function(e) {
			e.preventDefault();
            const groupId = $("#groupId")[0].innerHTML;
			settleBalances(groupId);
		});
	});
}

document.addEventListener("DOMContentLoaded", onRequestPageLoad);