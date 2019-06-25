/**
 * 子弹
 * @param {[type]} direction 方向
 * @param {[type]} color     颜色
 */
function Bullet(direction,color){
    base(this, LSprite, []);
    var self = this;
    self.isdie = false;
    self.name = name;
    switch(direction){
        case "up":
            self.mx = 0;
            self.my = -1;
            break;
        case "down":
            self.mx = 0;
            self.my = 1;
            break;
        case "left":
            self.mx = -1;
            self.my = 0;
            break;
        case "right":
            self.mx = 1;
            self.my = 0;
            break;
    }
    self.graphics.drawArc(1,"#000",[0,0,3,0,2*Math.PI],true,color);
}
Bullet.prototype.onframe = function() {
    var self = this;
    if(self.isdie)return;
    self.x += self.mx;
    self.y += self.my;
    if(self.x < 0 || self.x > LGlobal.width || self.y < 0 || self.y > LGlobal.height){
        self.isdie = true;
        return;
    }
    var tank;
    for(j=0;j<tanklist.length;j++){
        tank = tanklist[j];
        if(tank.name != self.name && LGlobal.hitTest(self,tank)){
            self.isdie = true;
            nano.notify('room.message', {
                name: document.getElementById("name").value,
                content: JSON.stringify({
                    type: 'kill', name: tank.name
                })
            });
            break;
        }
    }
}