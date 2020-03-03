import {privateKeyVerify, ecdsaSign} from 'secp256k1';
import { Buffer } from "buffer";
import { SHA256, enc} from "crypto-js";

function hexToUnit8Array(hex: string): Uint8Array {
    return new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
}

async function doLoginAction(event: Event): Promise<void> {
    event.preventDefault();
    const userName = $("#userName").val();
    const privateKeyStr = $("#privateKey").val().toString().trim();

    let privateKey = null;
    //  Assume the user provides the private key in hex with no colons
    try {
        privateKey = hexToUnit8Array(privateKeyStr);
        privateKeyVerify(privateKey)
    } catch (e) {
        console.error(e);
        $("#parseError").removeClass("d-none");
        return;
    }

    console.log("Form submitted!");
    console.log("Username: " + userName);

    // const resp = await fetch("/api/login?username=" + userName);
    // if (resp.status !== 200) {
    //     console.warn("Got " + resp.status + " instead of 200");
    //     if (resp.status === 400) {
    //         $("#invalidFields").removeClass("d-none");
    //     }
    //     return;
    // }
    //
    //
    // const publicKey = await resp.text();

    // console.log("Fetched public key!");
    const sampleText = "Hello! I want to be signed!";

    const hexStringHash = SHA256(sampleText).toString(enc.Hex);
    const unit8Hash = hexToUnit8Array(hexStringHash);

    const result = ecdsaSign(unit8Hash, privateKey);
	const hexSig = Buffer.from(result.signature).toString("hex");
    console.log(hexSig);
}

function onLoginPageLoad(): void {
    jQuery(($) => {
        $("#loginForm").on("submit", doLoginAction);

    });
}

document.addEventListener("DOMContentLoaded", onLoginPageLoad);
