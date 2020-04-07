import { Bill } from "../models/Bill";
import { XRPUtil } from "../util/XRPUtil";
import { CookieUtil } from "../util/CookieUtil";


let bills: Bill[] = [];
let currentUserName: string;

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
			$();
			bills = await getBills();
			currentUserName = await CookieUtil.getUsername();
			
			if(bills.length === 0) {
				document.getElementById("loading").innerHTML =  "No bills were found";
			} else {
				$("#loading").hide();
				bills.sort((a, b) => a.dateCreated > b.dateCreated ? - 1 : Number(a.dateCreated < b.dateCreated));
				await bills.forEach(function(bill) {
					$("#unsettled").removeAttr("style");
					$("#settled").removeAttr("style");
					const date: Date = new Date(Number(bill.dateCreated));
					const dateFormatted: string = date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();
	
					let element = "<div class='col-12'>";
						element += "<div class='card bg-dark text-light text-center bill-item mb-3 p-3 rounded-0 border-light' bill-id='"+bill.id+"'>";
						element += "<div>";
						element += "<span class='float-left bill-date' data-timestamp='"+bill.dateCreated+"'><small>"+dateFormatted+"</small></span>";
						element += "<span class='float-right'><small>From: "+bill.creditor.username+"</small></span>";
						element += "</div>";
						element += "<h5 class='text-center'>"+XRPUtil.dropsToXRP(bill.totalXrpDrops)+" XRP</h6>";
						element += "<span class='text-center d-block mt-2'>"+bill.description+"</span>";
						element += "<hr class='border-light horizontal-divider'>";
	
					let parts = "<div class='row'>";
	
					const weights = bill.weights;
	
					let allPaid = true;
					bill.transactionRequests.forEach(function(tr) {
						if(!tr.paid && allPaid) {
							allPaid =  false;
						}
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
								parts += debtor+" ("+weight+"x) <img src='/assets/img/cross.svg' class='mb-1' style='width: 20px; height: 20px;' /> <button class='btn btn-secondary submit-request set-paid-button' id='setPaid_"+tr.id+"'>Set paid</button>";
							}
						}else{
							if(tr.paid) {
								parts += "Me ("+weight+"x) <img src='/assets/img/check.svg' class='mb-1' style='width: 20px; height: 20px;' />";	
							}else{
								parts += "Me ("+weight+"x) <img src='/assets/img/cross.svg' class='mb-1' style='width: 20px; height: 20px;' />";
							}
							
						}
	
						parts += "</div></div>";
					});
					element += parts+"</div></div></div>";

					if(allPaid == true) {
						$("#settled-bills-info").hide();
						$(".settled-bills").append(element);
					}else{
						$("#unsettled-bills-info").hide();
						$(".unsettled-bills").append(element);
					}
				});
			}

			console.log("Bills loaded");
			$(document).on("click", ".set-paid-button", async function(e) {
				e.preventDefault();
				const trId = e.currentTarget.id.split("_")[1];
				const response = await fetch("/api/transactions/paid/" + trId, {
					method: "PUT",
				});
				if (response.status === 200) {
					document.location.href="/bills";
				} else {
					console.log(response.statusText);
				}
			});
		});
	});
}

document.addEventListener("DOMContentLoaded", onBillsPageLoad);