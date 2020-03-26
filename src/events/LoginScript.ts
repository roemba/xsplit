import {sign, deriveKeypair} from 'ripple-keypairs';

async function doLoginAction(event: Event): Promise<void> {
    event.preventDefault();
    const userName = $("#userName").val();
    const secretStr = $("#secret").val().toString().trim();

    let derivationResult = null;
    try {
        derivationResult = deriveKeypair(secretStr);
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
    const data = await resp.json();

    const result = sign(data.challenge, derivationResult.privateKey);

    const bearerStr = window.btoa(userName + ":" + result);
    document.cookie = `bearer=${bearerStr};path=/;max-age=${Math.round(data.expiresIn/1000)};samesite=strict`;

    resp = await fetch("/api/login/validate");
    if (resp.status !== 200) {
        if (resp.status == 401) {
            $("#invalidFields").removeClass("d-none");
        }
        console.warn("Got " + resp.status + " instead of 200");
        return;
    }
    console.log("Login success!");

    sessionStorage.setItem("secret", secretStr);
    document.location.href="/";
}

function onLoginPageLoad(): void {
    sessionStorage.clear();

    jQuery(($) => {
        $("#loginForm").on("submit", doLoginAction);

    });
}

document.addEventListener("DOMContentLoaded", onLoginPageLoad);
