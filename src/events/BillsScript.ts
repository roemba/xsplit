import { Bill } from "../models/Bill";

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

			await bills.forEach(function(bill) {

				const allPaid = bill.transactionRequests.every((tr) => {
					if(tr.paid == false) {
						return false;
					}
				});

				let element = "<div class='card bg-dark text-light text-center col-12 bill-item mb-3 p-3 rounded-0 border-light' bill-id='"+bill.id+"'>";
					element += "<div>";
					element += "<span class='float-left bill-date' data-timestamp='"+bill.dateCreated+"'>"+bill.dateCreated+"</span>";
					element += "<span class='float-right'>"+bill.totalXrp+" XRP</span>";
					element += "</div>";
					element += "<h3 class='card-title text-center'>"+bill.description+"</h3>";
					element += "<strong>Participants:</strong>";
					bill.transactionRequests.forEach(function(tr) {
						if(tr.debtor.username !== currentUserName) {
							element += tr.debtor.username+" (Paid: "+tr.paid+"), ";
						}else{
							element += "Me, ";
						}
					});
					element += "</div>";

				if(allPaid == true) {
					$(".settled-bills").append(element);
				}else{
					$(".unsettled-bills").append(element);
				}
			});


			
			console.log("Bills loaded");
		});
	});
}

document.addEventListener("DOMContentLoaded", onBillsPageLoad);