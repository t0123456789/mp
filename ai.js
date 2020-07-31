
window.mpgame.aiPlayer = function(difficulty, pet, level) {
    this.pet = pet;
    this.diff = difficulty;     // randompick = 0, easy=1, med=2, hard=3
    this.acc = this.diff*0.3;       // 0->1 chance of knowing correct answer
    this.level = level;
    this.speed = 2500-(this.diff*400);          // approx. ms delay before answer     
    this.time = 0;
    this.prevAnsTime = 0;

    this.update = function(dt) {
        this.time += dt;
        if((this.time-this.prev)>this.speed) {
            // generate an answer (0->3)
            var n = 0;
            if(knowsAns()) {
                n = -2;
            } else {
                n = randomAns(4);
            }
            this.prev = this.time;
            return n;
        }

        function randomAns(range) {
            return Math.floor(Math.random() * Math.floor(range));
        };
    
        function knowsAns() {
            return (Math.random()<this.acc)? true:false;
        }
        return -1;
    }

    return {update: this.update, time: this.time, prev: this.prevAnsTime, speed: this.speed, pet: this.pet};
};




