import {Container} from "typedi";
import {LoggerService} from "../services/LoggerService";

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

function onGeneralPageLoad(): void {
	jQuery(($) => {

		$(document).ready(function() {
			$(".nav-balance").trigger("click");
		});

		$(document).on("click", ".nav-balance", function() {
			const log = Container.get(LoggerService);
			getBalances().then((balances) => {
				if(balances.length === 2) {
					$(".balance-xrp").html(balances[0]);
					$(".balance-euro").html(balances[1]);
				}
			}).catch((e) => {
				log.error("Error while fetching balance!");
				console.log(e);
			});
		});

	});
}

document.addEventListener("DOMContentLoaded", onGeneralPageLoad);