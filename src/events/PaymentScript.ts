import { RippleAPI } from "ripple-lib";
import rippleKey from "ripple-keypairs";

function setError(text: string, id: string): void {
    document.getElementById(`${id}`).innerHTML = text + ", please try again.";
    document.getElementById(`${id}`).classList.add("border-0");
    document.getElementById(`${id}`).style.background = "red";
}

let api: RippleAPI;

async function sendPaymentRequest(requestId: string, totalXrp: string, pubKey: string, rippleServer: string): Promise<void> {
    let signedTransaction;
    if (api === undefined || !api.isConnected) {
        try {
            api = new RippleAPI({server: rippleServer});
            await api.connect();
        } catch {
            setError("Connecting to ripple failed", requestId);
            return;
        }
    }
    const secret = sessionStorage.getItem('secret');
    const transaction = {
        Account: rippleKey.deriveAddress(rippleKey.deriveKeypair(secret).publicKey),
        TransactionType: "Payment",
        Amount: totalXrp,
        Destination: rippleKey.deriveAddress(pubKey)
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

    document.getElementById(`${requestId}_${totalXrp}_${pubKey}`).style.background = "green";
    document.getElementById(`${requestId}_${totalXrp}_${pubKey}`).classList.add("border-0");
    document.getElementById(`${requestId}_${totalXrp}_${pubKey}`).innerHTML = "Success!";
    
    await new Promise(r => setTimeout(r, 1000));
    
    document.location.href="/pay";
}

function onRequestPageLoad(): void {
    jQuery(($) => {
        $("button").click(function() {
            $(this).val("Performing payment, please wait...");
            const rippleServer = $("#rippleServer").html();
            const id = this.id.split("_")[0];
            const xrp = this.id.split("_")[1];
            const pubKey = this.id.split("_")[2];
            sendPaymentRequest(id, xrp, pubKey, rippleServer);
        });
    });
}


document.addEventListener("DOMContentLoaded", onRequestPageLoad);