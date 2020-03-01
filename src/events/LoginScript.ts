function onLoginPageLoad(event: Event): void {
    jQuery(($) => {
        $("loginForm").on("submit", (e) => {
            console.log("Form submitted!");
            console.log(e);
        });

    });
}

document.addEventListener("DOMContentLoaded", onLoginPageLoad);