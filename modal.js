(function() {
   "use strict";
    
    var modal = null;
    var textelem = null;
    var textshortelem = null;
    var sprelem = null;

    function mpmodal() {

        // Get the modal div
        modal = document.getElementById("myModal");
        textelem = document.getElementById("modaltext");
        textshortelem = document.getElementById("modalshort");
        sprelem = document.getElementById("modalspr");

        // Get the button that opens the modal
        var btn = document.getElementById("help");

        // Get the <span> element that closes the modal
        var span = document.getElementsByClassName("close")[0];

        // When the user clicks the button, open the modal 
        btn.onclick = function() {
            var txt = window.mpclient.contextHelpText();
            textelem.innerHTML = txt.help;
            textshortelem.innerHTML = (txt.short)? txt.short:"";
            
            if(txt.sprite) {
                sprelem.style.backgroundImage = txt.sprite.img;
                sprelem.style.clip = txt.sprite.clip; 
            } else {
                sprelem.style.backgroundImage = "";
                sprelem.style.clip = ""; 
            }
            //textelem.innerText = txt;
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

    mpmodal.quizresult = {
        display: function(txt) {
            textelem.innerHTML = txt.help;
            textshortelem.innerHTML = (txt.short)? txt.short:"";
            
            if(txt.sprite) {
                sprelem.style.backgroundImage = txt.sprite.img;
                sprelem.style.clip = txt.sprite.clip; 
            } else {
                sprelem.style.backgroundImage = "";
                sprelem.style.clip = ""; 
            }
            modal.style.display = "block";
        },

    };

    mpmodal.card = {
        display: function(c) {
            var p = c.scard;
            textelem.innerHTML = "";

            textshortelem.innerHTML = "<em>Record of Achievement</em>";
            textshortelem.innerHTML += '<p>Level:'+p.prog.level+' Coins:'+p.prog.coins+' Stars:'+p.prog.star+'</p>';
            textshortelem.innerHTML += '<p>Pet days played:'+p.tday+' Awards:'+p.qstate.award+'</p>';
            //textshortelem.innerHTML += '<p>Average score: (%)    </p>';

            var i;
            var ncomp = "", nprac = "";
            for(i=0; i<5; ++i) {
                ncomp += p.qstate.scomp[i][0]+',';
                nprac += p.qstate.sprac[i][0]+',';
            }
            
            textelem.innerHTML += mpdata.txt.card.comp + ncomp;
            textelem.innerHTML += mpdata.txt.card.prac + nprac;

            var i;
            for(i=0; i<p.qstate.log.length; ++i) {
                var lg = p.qstate.log[i];
                textelem.innerHTML += '<br>log '+lg.level+': '+lg.name+' '+lg.score;
            }

            //textelem.innerHTML += mpdata.txt.card.unlock;
            //textelem.innerHTML += mpdata.txt.card.opt;
            //textelem.innerHTML += mpdata.txt.card.more;

            modal.style.display = "block";
        }
    }
 
    window.mpmodal = mpmodal;
})();