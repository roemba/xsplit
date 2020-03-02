import {privateKeyVerify, ecdsaSign} from 'secp256k1';
import { Buffer } from "buffer";

async function doLoginAction(event: Event): Promise<void> {
    event.preventDefault();
    const userName = $("#userName").val();
    const privateKeyStr = $("#privateKey").val().toString().trim();

    let privateKey = null;
    //  Assume the user provides the private key in hex with no colons
    try {
        privateKey = new Uint8Array(privateKeyStr.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        privateKeyVerify(privateKey)
    } catch (e) {
        console.error(e);
        $("#parseError").removeClass("d-none");
        return;
    }

    console.log("Form submitted!");
    console.log("Username: " + userName);

    const resp = await fetch("/api/login?username=" + userName);
    if (resp.status !== 200) {
        console.warn("Got " + resp.status + " instead of 200");
        if (resp.status === 400) {
            $("#invalidFields").removeClass("d-none");
        }
        return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const publicKey = await resp.text();
    console.log("Fetched public key!");
    // If we want to sign data, we need to add a 256 bit hash function as this library only accepts 32 byte messages
    const sampleText = "Hello! I want to be signed!+++++"; // <-- exactly 32 bytes, just to test
    const enc = new TextEncoder();
    const encodedText = enc.encode(sampleText);

    const result = ecdsaSign(encodedText, privateKey);
	const hexSig = Buffer.from(result.signature).toString("hex");
    console.log(hexSig);
}

function onLoginPageLoad(): void {
    jQuery(($) => {
        $("#loginForm").on("submit", doLoginAction);

    });
}

document.addEventListener("DOMContentLoaded", onLoginPageLoad);
