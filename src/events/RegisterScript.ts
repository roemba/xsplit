import {deriveKeypair} from 'ripple-keypairs';

async function doRegisterAction(e: Event): Promise<void> {
	e.preventDefault();
	const username = $("#username").val();
	const secretStr = $("#secret").val().toString();
	const fullName = $("#fullName").val();
	const email = $("#email").val();

	let derivationResult = null;
	try {
		derivationResult = deriveKeypair(secretStr)
	} catch (e) {
		console.error(e);
		$("#parseError").removeClass("d-none");
		return;
	}

	const resp = await fetch("/api/users", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			username,
			email,
			fullName,
			publickey: derivationResult.publicKey
		})
	});
	if (resp.status !== 200) {
		console.error(resp.status);
		return
	}
	console.log("Registration complete!");
	$("#registerForm").hide();
	$("#success").removeClass("d-none");

	// Wait 5 seconds
	await new Promise(r => setTimeout(r, 5000));

	document.location.href="/login"
}

function onRegisterPageLoad(): void {
	jQuery(($) => {
		$("#registerForm").on("submit", doRegisterAction);

	});
}

document.addEventListener("DOMContentLoaded", onRegisterPageLoad);
