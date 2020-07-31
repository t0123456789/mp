(function() {
   "use strict";
    
    var modal = null;
    var textelem = null;

    function mpmodal() {

        // Get the modal div
        modal = document.getElementById("myModal");
        textelem = document.getElementById("modaltext");

        // Get the button that opens the modal
        var btn = document.getElementById("help");

        // Get the <span> element that closes the modal
        var span = document.getElementsByClassName("close")[0];

        // When the user clicks the button, open the modal 
        btn.onclick = function() {
            var txt = window.mpclient.contextHelpText();
            textelem.innerText = txt;
            modal.style.display = "block";
        }

        // When the user clicks on <span> (x), close the modal
        span.onclick = function() {
            modal.style.display = "none";
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }  
    }

    mpmodal.content = {
        
        setText: function(txt) {
            textelem.innerText = txt;
        } 

    };

 
    window.mpmodal = mpmodal;
})();