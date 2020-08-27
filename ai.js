window.mpgame.aiLevel = function(kslevel, patch, isprac) {
    // generates question set based on topic/data, and depending on player logs and options chosen
    this.kslvl = kslevel; 
    this.patch = patch;
    this.topicseq = (isprac)? mpgame.aiLevel.practopicseq : mpgame.aiLevel.comptopicseq;
    this.topic = this.topicseq[0];
    this.count = 0;
};

window.mpgame.aiLevel.comptopicseq = [[0,mpdata.init.comp1], [1,mpdata.init.quizAdd], [0,mpdata.init.comp2], [2,mpdata.init.quizMul],];

window.mpgame.aiLevel.practopicseq = [[1,mpdata.init.quizAdd], [1,mpdata.init.quizAdd]];

window.mpgame.aiLevel.clonemenu = function(src) {
    if(!JSON || !JSON.parse ||!JSON.stringify) {
        console.log("js methods Not supported: JSON || JSON.parse || JSON.stringify");
        return null;
    }
    var dest = JSON.parse(JSON.stringify(src));
    return dest;
};


window.mpgame.aiLevel.prototype.getNext = function(n) {

    var pks = n.qs.ks;
    if(pks===0) {
        // no ks was chosen
        if(this.kslvl[0][0]<2) {
            // first competition / level played, use pre-defined data
            return window.mpdata.init.menu(n);
        } else {
            // assume ks3, then predict ks from previous games
            pks = 3;
            if(this.kslvl[3][0]>1) {
                var acc = this.kslvl[3][1] / this.kslvl[3][0];
                if(acc>0.9) {
                    pks = 4;
                } else if(acc<0.4) {
                    pks = 2;
                }                
            }
        }
    } 

    var ti = this.kslvl[pks][1];
    ti = ti%this.topicseq.length;
    this.topic = this.topicseq[ti];
    n.ref = this.topic[1];

    return window.mpdata.init.menu(n);
};

window.mpgame.aiLevel.prototype.getMenuPatched = function(n) {
    //if(!n.seed) return window.mpdata.init.current;
    // generate full menu using seed data
    //var s = n.seed;
    var s = { m:3, ti:1, ks:3, sub:0, count:0 };

    this.count = s.count;
    var q = window.mpdata.init.menu(s.m);
    this.copy = [];
    this.copy = mpgame.aiLevel.clonemenu(q); 

    var ksarr = this.patch.ks[s.ks];
    var section;
    switch(s.ti){
        case 0: section=ksarr.mix; break;
        case 1: section=ksarr.add; break;
        case 2: section=ksarr.mul; break;
    }
    if(section.length>s.sub) {
        // deep copy the sub-section patch, question generation will overwrite it
        this.section = mpgame.aiLevel.clonemenu(section[s.sub]);
        this.generateSection(n);
    }

    return this.copy;
}

window.mpgame.aiLevel.prototype.getPatch = function(n) {
    // patch current menu to create key stage specific questions & full number of steps 
    var q = window.mpdata.init.current;
    var pks = n.qs.ks;
    // splice question data into a deep copy of existing quiz 
    this.copy = [];
    this.copy = mpgame.aiLevel.clonemenu(q); 

        // get the patch section from js         
        var topicidx = (this.topic)? this.topic[0]:0;
        var ksarr = this.patch.ks[pks];
        var section;
        switch(topicidx){
            case 0: section=ksarr.mix; break;
            case 1: section=ksarr.add; break;
            case 2: section=ksarr.mul; break;
        }

        // check if there are patches for this topic
        if(section.length<1) return this.copy;

        // check progress within this topic
        var subtopic = this.kslvl[pks][2];
        if(!subtopic){
            subtopic = [0,0,0];  
            this.kslvl[pks][2] = subtopic; 
        } 
        var sub = subtopic[topicidx];
        sub = sub%(section.length);
        subtopic[topicidx]++;   // todo: only increment if accuracy is good / implement rolling ave ? ...

        // deep copy the sub-section patch, question generation will overwrite it
        this.section = mpgame.aiLevel.clonemenu(section[sub]);

        this.generateSection(n);

        this.count ++;
    
    return this.copy;
}


window.mpgame.aiLevel.prototype.generateSection = function(n) {
    // edit the patch depending on number of questions it should contain and count value...
    var ntarget = this.section.steps;
    var nlen = this.section.arr.length;
    var ncopy = this.copy.steps;

    // append extra questions & answers if needed
    var ngen = ntarget-nlen;
    if(ngen>0) this.appendSimilarQA(this.section, ngen);

    // remove existing menu questions, they start at index 1.
    this.copy.arr.splice(1, ncopy); 
    var end = this.copy.arr.splice(-1, 1); 
    // insert new ones 
    var arr = this.copy.arr.concat(this.section.arr, end);
    this.copy.arr = arr;
    this.copy.steps = ntarget;
}

window.mpgame.aiLevel.prototype.appendSimilarQA = function(sec, n) {
    // use existing questions as template to generate more 
    var nlen = sec.arr.length;
    // within range 
    var min = parseInt(sec.r[0]); 
    var max = parseInt(sec.r[1]); 
    var step1 = parseInt(sec.r[2]); 
    var step = (sec.r.length>3)? parseInt(sec.r[3]) : step1; 
    var inc1 = step1 * (this.count+1); 
    var inc = step * (this.count+1); 
    
    var b = 0;
    var i;
    for(i=0; i<n; ++i) {
        var ab = sec.arr[b];
        b = (b===(nlen-1))? 0 : b+1; 
       
        var qa = {q:"", opt:[], a:0, val:1};
        // parse question
        var ops = getOperands(ab.q);
        var ans = copyAnswers(ab, qa);
        // increment operands, assume format is 'x operator y'
        var l1 = ops.l1 + inc1;
        var l2 = ops.l2 + inc;
        inc1 += step1;
        inc += step;
        if(l1>(max)) l1 = l1%(max);
        if(l2>(max)) l2 = l2%(max);

        var a0;
        if(ops.lhs[1]==='+') {
            a0 = l1 + l2; // assume format is 'x + y'
            if(a0>max) {
                // edit operand1 to limit range...
                l1 = max - l2;
                a0 = l1 + l2;
            }
        } else {
            a0 = l1 - l2; // assume format is 'x - y'
            if(a0<min) {
                a0 = l2 - l1; // try to limit range by swapping operands...
                if(a0<min) {
                    l1 = min + l2;  // or edit operand1
                    a0 = l1 - l2;
                } else {
                    var tmp = l1;
                    l1 = l2;
                    l2 = tmp;
                }
            }
        }
        ops.l1 = l1;
        ops.l2 = l2;
        ans.val = a0;            

        // write back to question
        editQA(qa, ops, ans);
        sec.arr.push(qa);
    }
    
    function getOperands(q) {
        var lhs = q.split('=', 1);
        var op = lhs[0].split(' ');
        return { l1:parseInt(op[0]), l2:parseInt(op[2]), lhs:op };
    }

    function copyAnswers(src, dst) {
        var opt = dst.opt.concat(src.opt);
        dst.opt = opt;
        dst.a = src.a;
        dst.val = src.val;  // coin value for correct ans, vs answer number value
        return { val:opt[dst.a], idx:dst.a };
    }

    function editQA(dst, ops, ans) {
        dst.q = ''+ops.l1+' '+ops.lhs[1]+' '+ops.l2+' = ?';
        var oldans = dst.opt[ans.idx];
        dst.opt[ans.idx] = ans.val;
        // where ans is negative, negate other options
        if(ans.val<0) {
            for(i=0; i<dst.opt.length; ++i) {
                if(i!==ans.idx) {
                    var ii = parseInt(dst.opt[i]);
                    if(!(ii<0)) { dst.opt[i] = (-ii).toString(); };
                }
            }
        }
        // check if the new answer appears twice
        var i;
        var replace=-1;
        for(i=0; i<dst.opt.length; ++i) {
            if(i!==ans.idx) {
                if(parseInt(dst.opt[i])===ans.val) {
                    replace=i;
                    break;
                }
            }
        } 
        // replace it with the old value
        if(replace>-1) {
            dst.opt[replace] = oldans;
        }
        
        // shuffle the answer, using rand idx based on answer
        var ri = Math.abs(ans.val%4);
        dst.a = ri;
        var swap = dst.opt[ri];
        dst.opt[ri] = ''+ans.val;
        dst.opt[ans.idx] = swap;
    }
};

window.mpgame.aiPlayer = function(difficulty, pet, level) {
    this.pet = pet;
    this.diff = difficulty;     // randompick = 0, easy=1, med=2, hard=3
    this.accuracy = this.diff*0.22;       // 0->1 chance of knowing correct answer
    this.level = level;
    this.speed = 9000-(this.diff*2000);          // approx. ms delay before answer     
    this.time = 0;
    this.prevAnsTime = 0;

    this.update = function(dt) {
        this.time += dt;
        if((this.time-this.prev)>this.speed) {
            // generate an answer (0->3)
            var n = 0;
            if(window.mpgame.aiPlayer.prototype.knowsAns(this.diff, this.accuracy)) {
                n = -2;
            } else {
                n = window.mpgame.aiPlayer.prototype.randomAns(4);
            }
            this.prev = this.time;
            return n;
        }
        return -1;
    }

    return {update: this.update, time: this.time, prev: this.prevAnsTime, speed: this.speed, accuracy: this.accuracy, pet: this.pet};
};

window.mpgame.aiPlayer.prototype.randomAns = function(range) {
            return Math.floor(Math.random() * Math.floor(range));
        };
    
window.mpgame.aiPlayer.prototype.knowsAns = function(d,a) {
            var r = Math.random();
            if(d===3) console.log(r);
            return (r<a)? true:false;
        };

 


