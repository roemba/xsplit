async function sendPaymentRequest(requestId: string): Promise<void> {
    const response = await fetch("/api/transactions/pay", {
		method: "PUT",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
            id: requestId
		})
	});
	if (response.status !== 200) {
		document.getElementById("performingPayment").innerHTML = response.statusText.toString() + ", please try again";
		document.getElementById("registerError").style.color = "red";
		return;
    }

    document.getElementById("performingPayment").innerHTML = "Success!";
    
    await new Promise(r => setTimeout(r, 1000));
    
    document.location.href="/pay";
}

function onRequestPageLoad(): void {
    jQuery(($) => {
        $("button").click(function() {
            $("#performingPayment").removeClass("d-none");
            
            sendPaymentRequest(this.id);
            console.log(this.id);
        });
    });
}


document.addEventListener("DOMContentLoaded", onRequestPageLoad);