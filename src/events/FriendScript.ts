async function removeFriend(username: string): Promise<void> {
	const resp = await fetch("/api/users/"+username, {
		method: "DELETE"
	});
	if (resp.status !== 200) {
		console.error(resp.status);
		return
	}

	console.log("User "+username+" deleted")
}

function onFriendPageLoad(): void {
    jQuery(($) => {
        $(".remove-friend").on("click", function(){
			const username = $(this).attr('data-id');
			removeFriend(username)
        });
        $(".request-friend").on("click", function(){
			const username = $(this).attr('data-id');
			document.location.href="/request/"+username
        });

    });
}

document.addEventListener("DOMContentLoaded", onFriendPageLoad);