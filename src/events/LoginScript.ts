async function doLoginAction(event: Event): Promise<void> {
    event.preventDefault();
    const userName = $("#userName").val();
    const privateKey = $("#privateKey").val();

    console.log("Form submitted!");
    console.log("Username: " + userName);
    console.log("Private key: " + privateKey);

    const resp = await fetch("/api/login?username=" + userName);
    if (resp.status !== 200) {
        console.warn("Got " + resp.status + " instead of 200");
        if (resp.status === 400) {
            $("#loginForm .d-none").removeClass("d-none");
        }
        return;
    }

    const publicKey = await resp.text();
    console.log("Public key: " + publicKey);
}

function onLoginPageLoad(event: Event): void {
    jQuery(($) => {
        $("#loginForm").on("submit", doLoginAction);

    });
}

document.addEventListener("DOMContentLoaded", onLoginPageLoad);
