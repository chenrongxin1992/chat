/*
 *hichat v0.4.2
 *Wayou Mar 28,2014
 *MIT license
 *view on GitHub:https://github.com/wayou/HiChat
 *see it in action:http://hichat.herokuapp.com/
 */
window.onload = function() {
    var hichat = new HiChat();
    hichat.init();
};
var HiChat = function() {
    this.socket = null;
};
HiChat.prototype = {
    init: function() {
        var that = this;
        this.socket = io.connect();
        this.socket.on('connect', function() {
            document.getElementById('info').textContent = '---> 请输入你的大名 <---';
            document.getElementById('nickWrapper').style.display = 'block';
            /*document.getElementById('nicknameInput').focus();*/
        });
        this.socket.on('nickExisted', function() {
            document.getElementById('info').textContent = '该名字有人使用啦，请用别的吧!';
        });
        this.socket.on('loginSuccess', function() {
            document.title = 'hichat | ' + document.getElementById('nicknameInput').value;
            document.getElementById('loginWrapper').style.display = 'none';
            // document.getElementById('messageInput').focus();
        });
        this.socket.on('error', function(err) {
            if (document.getElementById('loginWrapper').style.display == 'none') {
                document.getElementById('status').textContent = '!fail to connect :(';
            } else {
                document.getElementById('info').textContent = '!fail to connect :(';
            }
        });
        this.socket.on('system', function(nickName, userCount, type) {
            //var msg = nickName + (type == 'login' ? ' joined' : ' left');
            var msg = nickName + (type == 'login' ? ' 进入了' : ' 离开了');
            that._displayNewMsg('系统提示 ', msg, 'red');
            //document.getElementById('status').textContent = userCount + (userCount > 1 ? ' users' : ' user') + ' online';
             document.getElementById('status').textContent = userCount  + ' 人在线';
        });
        this.socket.on('newMsg', function(user, msg, color) {
            that._displayNewMsg(user, msg, color);
        });
        this.socket.on('newImg', function(user, img, color) {
            that._displayImage(user, img, color);
        });
        document.getElementById('loginBtn').addEventListener('click', function() {
            var nickName = document.getElementById('nicknameInput').value;
            if (nickName.trim().length != 0) {
                that.socket.emit('login', nickName);
            } else {
                document.getElementById('nicknameInput').focus();
            };
        }, false);
        document.getElementById('nicknameInput').addEventListener('keyup', function(e) {
            if (e.keyCode == 13) {
                var nickName = document.getElementById('nicknameInput').value;
                if (nickName.trim().length != 0) {
                    that.socket.emit('login', nickName);
                };
            };
        }, false);
        document.getElementById('sendBtn').addEventListener('click', function() {
            var messageInput = document.getElementById('messageInput'),
                msg = messageInput.value;
                // color = document.getElementById('colorStyle').value;
            messageInput.value = '';
            // messageInput.focus();
            if (msg.trim().length != 0) {
                // that.socket.emit('postMsg', msg, color);
                // that._displayNewMsg('我 ', msg, color);
                that.socket.emit('postMsg', msg);
                that._displayNewMsg('我 ', msg);
                return;
            };
        }, false);
        document.getElementById('messageInput').addEventListener('keyup', function(e) {
            var messageInput = document.getElementById('messageInput'),
                msg = messageInput.value;
                // color = document.getElementById('colorStyle').value;
            if (e.keyCode == 13 && msg.trim().length != 0) {
                messageInput.value = '';
                // that.socket.emit('postMsg', msg, color);
                // that._displayNewMsg('我 ', msg, color);
                that.socket.emit('postMsg', msg);
                that._displayNewMsg('我 ', msg);
            };
        }, false);
        /*document.getElementById('clearBtn').addEventListener('click', function() {
            document.getElementById('historyMsg').innerHTML = '';
        }, false);*/
        document.getElementById('sendImage').addEventListener('change', function() {
            if (this.files.length != 0) {
                var file = this.files[0],
                    reader = new FileReader();
                    // color = document.getElementById('colorStyle').value;
                if (!reader) {
                    that._displayNewMsg('system', '!your browser doesn\'t support fileReader', 'red');
                    this.value = '';
                    return;
                };
                reader.onload = function(e) {
                    this.value = '';
                    that.socket.emit('img', e.target.result);
                    that._displayImage('我 ', e.target.result);
                    // that.socket.emit('img', e.target.result, color);
                    // that._displayImage('我 ', e.target.result, color);
                };
                reader.readAsDataURL(file);
            };
        }, false);
        this._initialEmoji();
        document.getElementById('emoji').addEventListener('click', function(e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            emojiwrapper.style.display = 'block';
            e.stopPropagation();
        }, false);
        document.body.addEventListener('click', function(e) {
            var emojiwrapper = document.getElementById('emojiWrapper');
            if (e.target != emojiwrapper) {
                emojiwrapper.style.display = 'none';
            };
        });
        document.getElementById('emojiWrapper').addEventListener('click', function(e) {
            var target = e.target;
            if (target.nodeName.toLowerCase() == 'img') {
                var messageInput = document.getElementById('messageInput');
                // messageInput.focus();
                messageInput.value = messageInput.value + '[emoji:' + target.title + ']';
            };
        }, false);
        this._initialQQface();
        document.getElementById('qqface').addEventListener('click',function(e){
            var qqfacewrapper = document.getElementById('qqfaceWrapper')
            qqfacewrapper.style.display = 'block'
            e.stopPropagation()
        },false)
        document.body.addEventListener('click',function(e){
            var qqfacewrapper = document.getElementById('qqfaceWrapper')
            if(e.target != qqfacewrapper){
                qqfacewrapper.style.display = 'none'
            }
        })
        document.getElementById('qqfaceWrapper').addEventListener('click',function(e){
            var target = e.target
            if(target.nodeName.toLowerCase() == 'img'){
                var messageInput = document.getElementById('messageInput')
                messageInput.value = messageInput.value + '[qqface:' + target.title + ']'
            }
        },false)
    },
    _initialEmoji: function() {
        var emojiContainer = document.getElementById('emojiWrapper'),
            docFragment = document.createDocumentFragment();
        for (var i = 69; i > 0; i--) {
            var emojiItem = document.createElement('img');
            emojiItem.src = '../content/emoji/' + i + '.gif';
            emojiItem.title = i;
            docFragment.appendChild(emojiItem);
        };
        emojiContainer.appendChild(docFragment);
    },
    _initialQQface: function(){
        var qqfaceContainer = document.getElementById('qqfaceWrapper'),
            doccFragment = document.createDocumentFragment()
        for (var i = 100; i > 0; i--){
            var qqfaceItem = document.createElement('img')
            qqfaceItem.src = '../content/qqface/' + i + '.gif'
            qqfaceItem.title = i
            doccFragment.appendChild(qqfaceItem)
        }
        qqfaceContainer.appendChild(doccFragment)
    },
    _displayNewMsg: function(user, msg, color) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8),
            //determine whether the msg contains emoji
            msg = this._showEmoji(msg);
            console.log('msg--->',msg)
            msg = this._showQqface(msg)
            console.log('msg--->',msg)
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan"> (' + date + '): </span>' + msg;
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },
    _displayImage: function(user, imgData, color) {
        var container = document.getElementById('historyMsg'),
            msgToDisplay = document.createElement('p'),
            date = new Date().toTimeString().substr(0, 8);
        msgToDisplay.style.color = color || '#000';
        msgToDisplay.innerHTML = user + '<span class="timespan"> (' + date + '):  </span> <br/>' + '<a href="' + imgData + '" target="_blank"><img src="' + imgData + '"/></a>';
        container.appendChild(msgToDisplay);
        container.scrollTop = container.scrollHeight;
    },
    _showEmoji: function(msg) {
        var match, result = msg,
            reg = /\[emoji:\d+\]/g,
            emojiIndex,
            totalEmojiNum = document.getElementById('emojiWrapper').children.length;
        while (match = reg.exec(msg)) {
            emojiIndex = match[0].slice(7, -1);
            if (emojiIndex > totalEmojiNum) {
                result = result.replace(match[0], '[X]');
            } else {
                result = result.replace(match[0], '<img class="emoji" src="../content/emoji/' + emojiIndex + '.gif" />');//todo:fix this in chrome it will cause a new request for the image
            };
        };
        return result;
    },
    _showQqface : function(msg){
        var match,result = msg,
            reg = /\[qqface:\d+\]/g,
            qqfaceIndex,
            totalQqfaceNum = document.getElementById('qqfaceWrapper').children.length
        while(match = reg.exec(msg)){
            qqfaceIndex = match[0].slice(8,-1)
            if(qqfaceIndex > totalQqfaceNum){
                result = result.replace(match[0],'[X]')
            }else{
                result = result.replace(match[0],'<img class="qqface" src="../content/qqface/"'+ qqfaceIndex + '.gif" />')
            }
        }
        return result;
    }
};
