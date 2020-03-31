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

async function getBalances(): Promise<string[]> {

	const balances = [];
	const ticker = await (await fetch("/api/users/ticker")).json();
	const info = await (await fetch("/api/users/info")).json();
	const xrp = parseFloat(info.xrpBalance);
	const rate = parseFloat(ticker.last);
	balances[0] = xrp.toFixed(2);
	balances[1] = (xrp * rate).toFixed(2);
	return balances;
} 

function logOut(): void {
	sessionStorage.clear();
	document.cookie = 'bearer=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	document.location.href="/";
}

function onGenericPageLoad(): void {
	jQuery(($) => {

		$(document).ready(function() {
			$(".nav-balance").trigger("click");
		});

		$(document).on("click", ".nav-balance", function() {
			if (sessionStorage.getItem("secret")) {
				getBalances().then((balances) => {
					if(balances.length === 2) {
						$(".balance-xrp").html(balances[0]);
						$(".balance-euro").html(balances[1]);
					}
				}).catch((e) => {
					console.log("Error while fetching balance!" + e);
				});
			}
		});

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
