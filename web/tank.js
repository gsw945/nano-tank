function Tank(name,direction,color, isSelf) {
    base(this, LSprite, []);
    var self = this;
    self.targetX = 0;
    self.targetY = 0;
    self.moveX = 0;
    self.moveY = 0;
    self.bulletlist = new Array();
    self.direction = "";
    self.name = name?name:"未命名"+self.objectindex;
    self.color=color;
    self.isSelf=isSelf;
    switch(direction){
        case "up":
            self.changeUp();
            break;
        case "down":
            self.changeDown();
            break;
        case "left":
            self.changeLeft();
            break;
        case "right":
            self.changeRight();
            break;
    }
    self.setName();
}
Tank.prototype.onframe = function() {
    var self = this,i,j,bullet,tank;
    self.move();
    self.setDirection();
    for(i=0;i<self.bulletlist.length;i++){
        bullet = self.bulletlist[i];
        bullet.onframe();
        if(bullet.isdie){
            self.bulletlist.splice(i--,1);
            backLayer.removeChild(bullet);
        }
    }
}
Tank.prototype.setDirection = function() {
    var self = this;
    if(self.x == self.targetX && self.y == self.targetY)return;
    if(self.moveX > 0){
        if(self.direction != "right")self.changeRight();
    }else if(self.moveX < 0){
        if(self.direction != "left")self.changeLeft();
    }else if(self.moveY > 0){
        if(self.direction != "down")self.changeDown();
    }else if(self.moveY < 0){
        if(self.direction != "up")self.changeUp();
    }
}
Tank.prototype.move = function() {
    var self = this;
    if(self.x == self.targetX && self.y == self.targetY)return;
    if(self.moveX != 0){
        self.x += self.moveX;
        if(self.x == self.targetX){
            self.moveX = 0;
            self.moveY = self.y > self.targetY ? -1 : 1;
        }
    }else if(self.moveY != 0){
        self.y += self.moveY;
        if(self.y == self.targetY){
            self.moveY = 0;
            self.moveX = self.x > self.targetX ? -1 : 1;
        }
    }else{
        if(self.x == self.targetX){
            self.moveY = self.y > self.targetY ? -1 : 1;
        }else if(self.y == self.targetY){
            self.moveX = self.x > self.targetX ? -1 : 1;
        }else if(Math.random() > 0.5){
            self.moveX = self.x > self.targetX ? -1 : 1;
        }else{
            self.moveY = self.y > self.targetY ? -1 : 1;
        }
    }
}
Tank.prototype.setName = function() {
    var self = this;
    var nameText = new LTextField();
    nameText.color = self.color;
    // nameText.text = self.name;
    nameText.text = self.isSelf ? '自己' : self.name;
    nameText.x = (40 - nameText.getWidth())*0.5;
    nameText.y = self.y - 16;
    self.addChild(nameText);
}
Tank.prototype.changeUp = function() {
    var self = this;
    self.direction = "up";
    self.graphics.clear();
    self.graphics.drawArc(1,"#000",[20,20,13,0,2*Math.PI],true,self.color);
    self.graphics.drawRect(1, "#000", [0, 0, 10, 40],true,self.color);
    self.graphics.drawRect(1, "#000", [30, 0, 10, 40],true,self.color);
    self.graphics.drawRect(1, "#000", [18, 0, 4, 20],true,self.color);
}
Tank.prototype.changeDown = function() {
    var self = this;
    self.direction = "down";
    self.graphics.clear();
    self.graphics.drawArc(1,"#000",[20,20,13,0,2*Math.PI],true,self.color);
    self.graphics.drawRect(1, "#000", [0, 0, 10, 40],true,self.color);
    self.graphics.drawRect(1, "#000", [30, 0, 10, 40],true,self.color);
    self.graphics.drawRect(1, "#000", [18, 20, 4, 20],true,self.color);
}
Tank.prototype.changeLeft = function() {
    var self = this;
    self.direction = "left";
    self.graphics.clear();
    self.graphics.drawArc(1,"#000",[20,20,13,0,2*Math.PI],true,self.color);
    self.graphics.drawRect(1, "#000", [0, 0, 40, 10],true,self.color);
    self.graphics.drawRect(1, "#000", [0, 30, 40, 10],true,self.color);
    self.graphics.drawRect(1, "#000", [0, 18, 20, 4],true,self.color);
}
Tank.prototype.changeRight = function() {
    var self = this;
    self.direction = "right";
    self.graphics.clear();
    self.graphics.drawArc(1,"#000",[20,20,13,0,2*Math.PI],true,self.color);
    self.graphics.drawRect(1, "#000", [0, 0, 40, 10],true,self.color);
    self.graphics.drawRect(1, "#000", [0, 30, 40, 10],true,self.color);
    self.graphics.drawRect(1, "#000", [20, 18, 20, 4],true,self.color);
}