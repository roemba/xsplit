import {privateKeyVerify, ecdsaSign} from 'secp256k1';
import {CryptoUtils} from "../util/CryptoUtils"

async function doLoginAction(event: Event): Promise<void> {
    event.preventDefault();
    const userName = $("#userName").val();
    const privateKeyStr = $("#privateKey").val().toString().trim();

    let privateKey = null;
    //  Assume the user provides the private key in hex with no colons
    try {
        privateKey = CryptoUtils.hexToUint8Array(privateKeyStr);
        privateKeyVerify(privateKey)
    } catch (e) {
        console.error(e);
        $("#parseError").removeClass("d-none");
        return;
    }

    console.log("Form submitted!");

    let resp = await fetch("/api/login/challenge?username=" + userName);
    if (resp.status !== 200) {
        if (resp.status === 400) {
            $("#invalidFields").removeClass("d-none");
        } else {
            console.warn("Got " + resp.status + " instead of 200");
        }
        return;
    }

    const challenge = CryptoUtils.hexToUint8Array(await resp.text());

    const result = ecdsaSign(challenge, privateKey);
	const hexSig = CryptoUtils.uint8ArrayToHex(result.signature);

    const bearerStr = "Bearer " + window.btoa(userName + ":" + hexSig);
    resp = await fetch("/api/login/validate", {
        headers: {
            'Authorization': bearerStr
        }
    });
    if (resp.status !== 200) {
        if (resp.status == 401) {
            $("#invalidFields").removeClass("d-none");
        }
        console.warn("Got " + resp.status + " instead of 200");
        return
    }
    console.log("Login success!");

    sessionStorage.setItem("privateKey", privateKeyStr);
    sessionStorage.setItem("bearer", bearerStr);
    document.location.href="/"
}

function onLoginPageLoad(): void {
    jQuery(($) => {
        $("#loginForm").on("submit", doLoginAction);

    });
}

document.addEventListener("DOMContentLoaded", onLoginPageLoad);
