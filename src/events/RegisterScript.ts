async function doRegisterAction(event: Event): Promise<void> {
    event.preventDefault();
    $("#badRegister").addClass("d-none");
    $("#goodRegister").addClass("d-none");
    $.post('/api/users', $('#registerForm').serialize(), () => {
        $("#goodRegister").removeClass("d-none");
    }).fail(() => {
        $("#badRegister").removeClass("d-none");
    })
}

function onLoginPageLoad(): void {
    jQuery(($) => {
        $("#registerForm").on("submit", doRegisterAction);
    });
}

document.addEventListener("DOMContentLoaded", onLoginPageLoad);
