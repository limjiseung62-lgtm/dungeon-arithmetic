export class TimerSystem{
 constructor(callback,now=()=>Date.now()){this.callback=callback;this.now=now;this.interval=null;this.deadline=0;this.saved=0;this.paused=false;}
 start(seconds){this.stop();this.saved=Math.max(0,seconds*1000);this.resume();}
 pause(){if(this.interval){this.saved=Math.max(0,this.deadline-this.now());clearInterval(this.interval);this.interval=null;}this.paused=true;}
 resume(){if(this.interval)return;this.paused=false;this.deadline=this.now()+this.saved;this.interval=setInterval(()=>this.callback(this.remaining),200);}
 stop(){if(this.interval)clearInterval(this.interval);this.interval=null;this.saved=0;this.paused=false;}
 get remaining(){return Math.max(0,Math.ceil((this.interval?this.deadline-this.now():this.saved)/1000));}
 get running(){return this.interval!==null;}
}
