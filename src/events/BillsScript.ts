import { Bill } from "../models/Bill";
import { XRPUtil } from "../util/XRPUtil";

function getUsername(): string {

	const cookie = "; " + document.cookie;
	const bearerStr = cookie.split("; ")[1];
	const bearer = window.atob(bearerStr.replace("bearer=",""));
	const username = bearer.split(":")[0];

	return username;
}

let bills: Bill[] = [];
const currentUserName = getUsername();

async function getBills(): Promise<Bill[]> {

	const response = await fetch("/api/bills");

	if (response.status !== 200) {
		console.error(response.status);
		return;
	}

	const billArray = await response.json();

	return await billArray;

}

function onBillsPageLoad(): void {
	jQuery(($) => {

		$(document).ready(async function() {

			bills = await getBills();
			bills.sort((a, b) => a.dateCreated > b.dateCreated ? - 1 : Number(a.dateCreated < b.dateCreated));

			await bills.forEach(function(bill) {

				const allPaid = bill.transactionRequests.every((tr) => {
					if(tr.paid == false) {
						return false;
					}
				});

				const date: Date = new Date(Number(bill.dateCreated));
				const dateFormatted: string = date.getDay()+"/"+date.getMonth()+"/"+date.getFullYear();

				let element = "<div class='card bg-dark text-light text-center col-12 bill-item mb-3 p-3 rounded-0 border-light' bill-id='"+bill.id+"'>";
					element += "<div>";
					element += "<span class='float-left bill-date' data-timestamp='"+bill.dateCreated+"'>"+dateFormatted+"</span>";
					element += "<span class='float-right'>"+XRPUtil.dropsToXRP(bill.totalXrpDrops)+" XRP</span>";
					element += "</div>";
					element += "<h5 class='card-title text-center mb-0'>"+bill.description+"</h5>";
					element += "<hr class='border-light horizontal-divider'>";

				let parts = "<div class='row'>";

				const weights = bill.weights;

				bill.transactionRequests.forEach(function(tr) {
					const debtor = tr.debtor.username;

					let weight: number;

					weights.forEach(function(w) {
						if(w.user.username === debtor) {
							weight = w.weight;
						}
					});

					parts += "<div class='col-6 col-lg-3'><div class='d-inline-block'>";

					if(debtor !== currentUserName) {
						if(tr.paid) {
							parts += debtor+" ("+weight+"x) <img src='/assets/img/check.svg' class='mb-1' style='width: 20px; height: 20px;' />";
						}else{
							parts += debtor+" ("+weight+"x) <img src='/assets/img/cross.svg' class='mb-1' style='width: 20px; height: 20px;' />";
						}
					}else{
						parts += "Me ("+weight+"x) <img src='/assets/img/check.svg' class='mb-1' style='width: 20px; height: 20px;' />";
					}

					parts += "</div></div>";
				});
				element += parts+"</div>";
				element += "</div>";

				if(allPaid == true) {
					$("#settled-bills-info").hide();
					$(".settled-bills").append(element);
				}else{
					$("#unsettled-bills-info").hide();
					$(".unsettled-bills").append(element);
				}
			});

			console.log("Bills loaded");
		});
	});
}

document.addEventListener("DOMContentLoaded", onBillsPageLoad);