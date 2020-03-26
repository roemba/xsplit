const originalFetch = window.fetch;

window.fetch = async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
	const resp = await originalFetch(input, init);

	if (resp.status === 401 && document.location.pathname !== "/login") {
		sessionStorage.clear();
		alert("Your session has expired! Click OK to be redirected to the login page.");
		document.location.href="/login";
	}

	return resp;
};

function logOut(): void {
	sessionStorage.clear();
	document.cookie = 'bearer=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	document.location.href="/";
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
