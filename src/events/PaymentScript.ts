import { RippleAPI } from "ripple-lib";
import rippleKey from "ripple-keypairs";

function setError(text: string, id: string): void {
    document.getElementById(`${id}`).innerHTML = text + ", please try again.";
    document.getElementById(`${id}`).classList.add("border-0");
    document.getElementById(`${id}`).style.background = "red";
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
        setError("Connecting to ripple failed", requestId);
        return;
    }
    const secret = sessionStorage.getItem('secret');
    const transaction = {
        Account: rippleKey.deriveAddress(rippleKey.deriveKeypair(secret).publicKey),
        TransactionType: "Payment",
        Amount: transactionRequest.totalXrpDrops + "",
        Destination: rippleKey.deriveAddress(transactionRequest.creditor.publickey)
    };
    try {
        const preparedTransaction = await api.prepareTransaction(transaction);
        signedTransaction = api.sign(preparedTransaction.txJSON, secret);
        await api.submit(signedTransaction.signedTransaction);
    } catch(e) {
        setError("Submitting transaction failed", requestId);
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
        setError(response.statusText.toString(), requestId);
		return;
    }

    document.getElementById(`${requestId}`).style.background = "green";
    document.getElementById(`${requestId}`).classList.add("border-0");
    document.getElementById(`${requestId}`).innerHTML = "Success!";
    
    await new Promise(r => setTimeout(r, 1000));
    
    document.location.href="/pay";
}

function onRequestPageLoad(): void {
    jQuery(($) => {
        $("button").click(function() {
            $(this).val("Performing payment, please wait...");
            const rippleServer = $("#rippleServer").html();
            sendPaymentRequest(this.id, rippleServer);
        });
    });
}


document.addEventListener("DOMContentLoaded", onRequestPageLoad);