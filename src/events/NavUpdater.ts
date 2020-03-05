function logOut(): void {
	sessionStorage.clear();
	location.reload()
}

function onGenericPageLoad(): void {
	jQuery(($) => {
		$("#logOutButton").on("click", logOut);

		if (sessionStorage.getItem("bearer")) {
			$(".not-logged-in").each((index, element) => {
				$(element).hide()
			});

			$(".logged-in").each((index, element) => {
				$(element).show()
			})
		} else {
			$(".not-logged-in").each((index, element) => {
				$(element).show()
			});

			$(".logged-in").each((index, element) => {
				$(element).hide()
			})
		}
	});
}

document.addEventListener("DOMContentLoaded", onGenericPageLoad);
