import { RippleAPI } from "ripple-lib";
import rippleKey from "ripple-keypairs";

function setError(text: string): void {
    document.getElementById("performingPayment").innerHTML = text + ", please try again";
    document.getElementById("registerError").style.color = "red";
}

async function sendPaymentRequest(requestId: string, rippleServer: string): Promise<void> {
    let transactionRequest, api, signedTransaction;
    const fetchTransactionRequest = await fetch(`/api/transactions/${requestId}`, {
		method: "GET"
    });
    try {
        transactionRequest = await fetchTransactionRequest.json();
        api = new RippleAPI({server: rippleServer});
        await api.connect();
    } catch {
        setError("Connecting to ripple failed");
        return;
    }
    const secret = sessionStorage.getItem('secret');
    const transaction = {
        Account: rippleKey.deriveAddress(rippleKey.deriveKeypair(secret).publicKey),
        TransactionType: "Payment",
        Amount: transactionRequest.totalXrp,
        Destination: rippleKey.deriveAddress(transactionRequest.bill.creditor.publickey)
    };
    try {
        const preparedTransaction = await api.prepareTransaction(transaction);
        signedTransaction = api.sign(preparedTransaction.txJSON, secret);
        await api.submit(signedTransaction.signedTransaction);
    } catch {
        setError("Submitting transaction failed");
        return;
    }

    const response = await fetch("/api/transactions/pay", {
		method: "PUT",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
            id: requestId,
            transactionHash: signedTransaction.id
		})
	});
	if (response.status !== 200) {
        setError(response.statusText.toString());
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
            const rippleServer = $("#rippleServer").html();
            sendPaymentRequest(this.id, rippleServer);
            console.log(this.id);
        });
    });
}


document.addEventListener("DOMContentLoaded", onRequestPageLoad);