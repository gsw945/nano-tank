var nano_config = {
    host: '127.0.0.1',
    port: 3250,
    path: '/nano',
    log: true,
    reconnect: false,
    user: '玩家-' + Date.now()
};

var mytank;
var e_msg;
function initial() {
    document.querySelector('#name').value = nano_config.user;
    e_msg = document.getElementById("msg");
    document.getElementById("closebtn").disabled = true;
    init(10, "mylegend", 600, 400, main, LEvent.INIT);
}

var join_callback = function (data) {
    console.log(data);
    if(data.result === 'success') {
        var dirlist = ["up","down","left","right"];
        nano.notify('room.message', {
            name: document.getElementById("name").value,
            content: JSON.stringify({
                type: 'addTank',
                x: Math.floor(LGlobal.width*Math.random()),
                y: Math.floor(LGlobal.height*Math.random()),
                direction: dirlist[Math.floor(4*Math.random())],
                color: randomColor()
            })
        });

        var text = "<li>登陆成功</li>" + e_msg.innerHTML;
        e_msg.innerHTML = text;
    }
};

var onMessage = function (data) {
    console.log(data)
    var text = "<li>系统消息: " + data.content + "</li>" + e_msg.innerHTML;
    e_msg.innerHTML = text;
    var value = JSON.parse(data.content);
    console.log(value);
    text = null;
    switch(value["type"]) {
        case "error":
            text = "<li>" + value["error"] + "</li>" + e_msg.innerHTML;
            break;
        case "talk":
            text = "<li>" + value["msg"] + "</li>" + e_msg.innerHTML;
            break;
        case "removeuser":
            // removeUser(value["name"]);
            break;
        case "setuserlist":
            // removeAllUser();
            // var list = value["list"].split(",");
            // for(var i = 0, l = list.length; i < l; i++) {
            //     addUser(list[i]);
            // }
            break;
        case "addTank":
            addTank(
                data.name,
                parseInt(value["x"]),
                parseInt(value["y"]),
                value["direction"],
                value["color"]
            );
            break;
        case "removeTank":
            removeTank(data.name);
            break;
        case "move":
            move(data.name,parseInt(value["x"]),parseInt(value["y"]));
            break;
        case "shoot":
            shoot(data.name,value["direction"]);
            break;
        case "kill":
            kill(data.name);
            break;
    }
    if(text) {
        e_msg.innerHTML = text;
    }
};

var onNewUser = function (data) {
    console.log(data);
    var text = "<li>系统消息: " + data.content + "</li>" + e_msg.innerHTML;
    e_msg.innerHTML = text;
};
var onUserLeft = function (data) {
    console.log(data);
    var text = "<li>系统消息: " + data.content + "</li>" + e_msg.innerHTML;
    e_msg.innerHTML = text;
};

var onMembers = function (data) {
    console.log(data);
    var text = "<li>系统消息: " + "members: "+data.members + "</li>" + e_msg.innerHTML;
    e_msg.innerHTML = text;
};

function nanoEventBind() {
    nano.on("onNewUser", onNewUser);
    nano.on("onUserLeft", onUserLeft);
    nano.on("onMembers", onMembers);
    nano.on('onMessage', onMessage);

    nano.on("net-open", function(event, is_reconnect) {
        console.log(event, is_reconnect);
        e_msg.innerHTML = "<li>连接服务器成功</li>" + e_msg.innerHTML;
        document.getElementById("name").disabled = true;
        document.getElementById("openbtn").disabled = true;
        document.getElementById("closebtn").disabled = false;
    });
    nano.on("net-message", function(event) {
        console.log(event);
    });
    nano.on("net-close", function(event) {
        console.log(event);
        document.getElementById("name").disabled = true;
        document.getElementById("openbtn").disabled = false;
        document.getElementById("closebtn").disabled = true;
    });
    nano.on("net-error", function(event) {
        console.log(event);
    });

    nano.on("heartbeat-timeout", function(event) {
        console.log(event);
    });
    nano.on("heartbeat-error", function(event) {
        console.log(event);
    });
    nano.on("onKick", function(event) {
        console.log(event);
    });
}

var nanoEventBound = false;
function doOpen() {
    if(document.querySelector('#name').value == "") {
        alert('请输入用户姓名。');
        return;
    }
    if(!nanoEventBound) {
        nanoEventBind();
        nanoEventBound = true;
    }
    nano.init(nano_config, function () {
        console.log("initialized");

        var nickname = document.getElementById("name").value;
        nano.request("room.join", {
            'nickname': nickname
        }, join_callback);
    });
}

function doAction() {
    if(nano.getSocketState() == WebSocket.OPEN) {
        var to = document.getElementById("to").value;
        var msg = document.getElementById("message").value;
        nano.notify('room.message', {
            name: document.getElementById("name").value,
            content: JSON.stringify({
                type: 'talk', target: to, msg: msg
            })
        });
        document.getElementById("message").value = "";
    } else {
        alert('连接服务器失败。');
    }
    return false;
}

function doClose() {
    if(nano.getSocketState() == WebSocket.OPEN) {
        nano.disconnect();
    }
}

function addUser(username) {
    var list = document.getElementById("to");
    if(!isExitUser(list, username)) {
        var item = new Option(username, username);
        list.options.add(item);
    }
}

function removeUser(username) {
    var list = document.getElementById("to");
    for(var i = 0; i < list.options.length; i++) {
        if(list.options[i].value == username) {
            list.options.remove(i);
            break;
        }
    }
}

function removeAllUser() {
    var list = document.getElementById("to");
    for(var i = 1, l = list.options.length; i < l; i++) {
        list.options.remove(1);
    }
}

function isExitUser(username) {
    var list = document.getElementById("to");
    var isExit = false;
    for(var i = 0; i < list.options.length; i++) {
        if(list.options[i].value == username) {
            isExit = true;
            break;
        }
    }
    return isExit;
}

var backLayer, tanklist=new Array();
function main() {
    LGlobal.setDebug(true);
    backLayer = new LSprite();
    addChild(backLayer);
    backLayer.graphics.drawRect(1, "#000", [0, 0, 600, 400]);
    backLayer.addEventListener(LEvent.ENTER_FRAME, onframe);
    backLayer.addEventListener(LMouseEvent.MOUSE_UP,onmouseup);
    
    //LEvent.addEventListener(LGlobal.window,LKeyboardEvent.KEY_DOWN,onkeydown);
    LEvent.addEventListener(LGlobal.window,LKeyboardEvent.KEY_UP,onkeyup);
}
function onkeyup(event){
    if(event.keyCode != 32) {
        console.log(event.keyCode)
        return;
    }
    nano.notify('room.message', {
        name: document.getElementById("name").value,
        content: JSON.stringify({
            type: 'shoot', direction: getSelf().direction
        })
    });
}
function getSelf(){
    if(!!mytank) {
        return mytank;
    }
    for(var key in tanklist){
        tank = tanklist[key];
        if(tank.name == document.getElementById("name").value){
            mytank=tank;
        }
    }
    return mytank;
}
function randomColor(){
    var rand = Math.floor(Math.random() * 0xFFFFFF).toString(16);
    if(rand.length == 6){
        return '#' + rand;
    }else{
        return '#' + randomColor();
    }
}
function kill(name){
    alert(name);
    if(name == getSelf().name){
        alert("killed");
        doClose();
    }
}
function addTank(name,x,y,direction,color){
    var tank;
    var found = getTankByName(name);
    var idx = found[0];
    if(idx > -1) {
        tank = found[1];
    }
    else {
        var isSelf = document.getElementById("name").value == name;
        new Tank(name,direction,color, isSelf);
    }
    tank.x = x;
    tank.y = y;
    tank.targetX = x;
    tank.targetY = y;
    backLayer.addChild(tank);
    tanklist.push(tank);
}
function getTankByName(name) {
    var idx = -1,
        tank = null;
    for(var key in tanklist){
        idx += 1;
        var item = tanklist[key];
        if(item.name == name) {
            tank = item;
            break;
        }
    }
    if(!!tank) {
        idx = -1;
    }
    return [idx, tank];
}
function removeTank(name){
    var found = getTankByName(name);
    var idx = found[0],
        tank = found[1];
    if(!!tank) {
        backLayer.removeChild(tank);
    }
    tanklist.splice(idx, 1);
}
function onmouseup(event){
    if(nano.getSocketState() == WebSocket.OPEN) {
        nano.notify('room.message', {
            name: document.getElementById("name").value,
            content: JSON.stringify({
                type: 'move', x: event.selfX, y: event.selfY
            })
        });
    }
}
function move(name,targetX,targetY){
    var tank;
    for(var key in tanklist){
        tank = tanklist[key];
        if(tank.name == name) {
            break;
        }
    }
    if(tank == null) {
        return;
    }
    tank.targetX = targetX;
    tank.targetY = targetY;
    tank.moveX=tank.moveY=0;
}
function shoot(name,direction){
    var bullet,tank;
    for(var key in tanklist){
        tank = tanklist[key];
        if(tank.name == name)break;
    }
    if(tank == null)return;
    bullet = new Bullet(direction,tank.color);
    bullet.x = tank.x + 20;
    bullet.y = tank.y + 20;
    tank.bulletlist.push(bullet);
    backLayer.addChild(bullet);
}
function onframe(){
    // console.log(new Date().getTime());
    for(var key in tanklist){
        tanklist[key].onframe();
    }
}
