let button = document.getElementById('requestPassword');

// chrome.storage.sync.get('color', function(data) {
//   changeColor.style.backgroundColor = data.color;
//   changeColor.setAttribute('value', data.color);
// });


function clearQrCode() {
  const qrDiv = document.getElementById("qrcode");
    
    // clear the QR code div
    while (qrDiv.firstChild) {
      qrDiv.removeChild(qrDiv.firstChild);
    }
}


button.onclick = function(element) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    
    clearQrCode();

    document.getElementById("timer").innerHTML = "";
    
    // create the QR code
    fetch("http://localhost:5000/password", { method: "POST" })
        .then(res => res.text())
        .then(id => {
          new QRCode(document.getElementById("qrcode"), id);

          document.getElementById("requestPassword").style.visibility = "hidden";

          const endTime = new Date((new Date()).getTime() + 120000).getTime();

          const timer = setInterval(() => {
            const now = new Date().getTime();

            // Find the distance between now and the count down date
            const distance = endTime - now;

            // Time calculations for days, hours, minutes and seconds
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Display the result in the element with id="timer"
            document.getElementById("timer").innerHTML = "Expires in: " + minutes + "m " + seconds + "s ";

            // If the count down is finished, write some text
            if (distance < 0) {
              clearInterval(timer);
              clearQrCode();
              document.getElementById("timer").innerHTML = "EXPIRED GENERATE NEW CODE";
              document.getElementById("requestPassword").style.visibility = "visible";
            }
          }, 500);

          // wait for the pw to arrive
          fetch(`http://localhost:5000/password/${id}`)
            .then(res => res.json())
            .then(res => {
              chrome.tabs.executeScript(
                tabs[0].id,
                {code: `const pwInput = document.querySelector("input[type='password']"); pwInput.value = '${res.pw}'; pwInput.form.submit();`});
              
              clearInterval(timer);
              clearQrCode();
              document.getElementById("timer").innerHTML = encodeURI("✔ Password beamed ✔\nYou can now login");
              document.getElementById("requestPassword").style.display = "none";

            })
            .catch(e => {
              document.getElementById("requestPassword").style.visibility = "visible";
              document.getElementById("timer").innerHTML = "EXPIRED GENERATE NEW CODE";
              clearQrCode();
            });
        });
  });
};