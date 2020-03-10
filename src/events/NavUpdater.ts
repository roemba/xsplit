function logOut(): void {
	sessionStorage.clear();
	document.cookie = 'bearer=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	location.reload();
}

function onGenericPageLoad(): void {
	jQuery(($) => {
		$("#logOutButton").on("click", logOut);

		if (sessionStorage.getItem("secret")) {
			$(".not-logged-in").each((index, element) => {
				$(element).hide();
			});

			$(".logged-in").each((index, element) => {
				$(element).show();
			});
		} else {
			$(".not-logged-in").each((index, element) => {
				$(element).show();
			});

			$(".logged-in").each((index, element) => {
				$(element).hide();
			});
		}
	});
}

document.addEventListener("DOMContentLoaded", onGenericPageLoad);
