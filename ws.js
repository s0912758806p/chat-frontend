// 使用者名稱
let userName = document.getElementById('input-login')

// 存取發送資料
let sendData = {}

// 名稱
let nickname;

// 客戶端ID
let clientId;

// 頭像編號
let avatarId;

// 現在時間
let nowTime;

// 聊天室的內框
let chatroomBox = document.getElementById('chatroom-box')

// 聊天室頻道
let channel = document.getElementById('channel')

// 聊天室數量
let clientCount = document.getElementById('count');

// 輸入的訊息
let text = document.getElementById('input-text');

// 發送的按鈕
let sendButton = document.getElementById('send')

// 我的名稱
let mineNickname = document.getElementById('mine-nickname')

// 我的頭像
let mineAvatar = document.getElementById('mine-avatar')

// 使用者名稱DOM
let login = document.getElementById('login')

/**
 * 進行登錄聊天室的函式
 */
function sendLogin() {
  if(userName.value !== '') {
    //使用 WebSocket 的網址向 Server 開啟連結
    let ws = new WebSocket('ws://10.1.5.25:3000');

    clientId = userName.value
    avatarId = Math.floor(Math.random() * 20) + 1

    sendData.type = 'join'
    sendData.nickname = userName.value
    sendData.clientId = clientId
    sendData.avatarId = avatarId

    channel.innerHTML = '聊天室頻道:世界'

    mineNickname.innerHTML = `目前我的名稱: ${userName.value}`

    mineAvatar.innerHTML = `<div class="mine-avatar-box">
                              <img class="mine-avatar-img" src="/assets/img/avatar/client${avatarId}.png">
                            </div>`

    //開啟後執行的動作，指定一個 function 會在連結 WebSocket 後執行
    ws.onopen = () => {
      console.log('用戶成功連接');

      login.style.display = 'none'

      sendData.message = '進入聊天室'
      
      ws.send(JSON.stringify(sendData))
    };

    
    //關閉後執行的動作，指定一個 function 會在連結中斷後執行
    ws.onclose = () => {
      console.log('用戶關閉連接');
    };

    
    //接收 server 發送訊息
    ws.onmessage = (event) => {

      // 轉JSON
      let data = JSON.parse(event.data);

      // console.log(data, 'onmesssage')

      let msgArr = []
      
      msgArr.push({
        clientId: data.clientId,
        nickname: data.nickname,
        message: data.message,
        avatarId: data.avatarId
      })

      nickname = data.nickname;
      
      nowTime = new Date().toLocaleString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
      })

      clientCount.innerHTML = `聊天室人數:${data.clientCount}`;

      if(data.type === 'mineNicknameUpdate') {
        mineNicknameUpdate(data)
      }

      function send() {
        if(ws !== undefined) {
          if(text.value !== '') {
            sendData.type = 'message'
            sendData.nickname = userName.value
            sendData.clientId = clientId
            sendData.message = text.value
            sendData.avatarId = avatarId
            
            ws.send(JSON.stringify(sendData));
    
            text.value = '';
          }
        }
      }
      
      sendButton.addEventListener('click', send)
      text.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          send()
        }
      })

      if(data.type === 'kick') {
        duplicateNameKick(data)
      }

      // 判斷訊息類別
      msgArr.forEach(()=> {
        notification(data)

        if (data.type === 'message') {
          showMessage(data)
        }
      })
    };
  }
}

function loginEnter(e) {
  if(e.keyCode === 13) {
    sendLogin()
  }
}

//獲取自己改名
let mineNicknameUpdate = (data) => {
  userName.value = data.nickname
}

//踢出重複使用者名稱
let duplicateNameKick = (data) => {
  ws.close()

  userName.value = ''
  alert(data.message)
  
  return false
}

//客戶端接收廣播訊息
let notification = (data) => {
  let notification = document.createElement('span');

  // console.log(data)
  if(data.type === 'join') {
    notification.innerHTML = `欢迎 ${nickname} ${data.message}`
  } else if (data.type === 'notification') {
    if (nickname) {
      notification.innerHTML = `廣播: ${nickname} ${data.message}`;
    } else {
      notification.innerHTML = `廣播: ${data.message}`;
    }
  } else if (data.type === 'nicknameUpdate') {
    notification.innerHTML = `通知: ${data.message}`;
  }

  chatroomBox.appendChild(notification)
}

//客戶端接收談話訊息
let showMessage = (data) => {
  let messagePosition = ''

  // data.clientId === clientId 就是自己, 反之
  if (data.clientId === clientId) {
    messagePosition = `<div class="init-message-position self">
                        <div class="message-box box-self">
                          <div class="msg-style">${data.message}</div>
                        </div>
                        <div class="info-time">${nowTime}</div>
                      </div>`
  } else {
    messagePosition = `<div class="init-message-position">
                        <div class="avatar-box">
                          <img class="avatar-img" src="/assets/img/avatar/client${data.avatarId}.png">
                        </div>
                        <div class="no-self-info">
                          <div class="info-name">${nickname}</div>
                          <div class="no-self-msg">
                            <div class="message-box">
                              <div class="msg-style">${data.message}</div>
                            </div>
                            <div class="info-time">${nowTime}</div>
                          </div>
                        </div>
                      </div>`
  }

  chatroomBox.innerHTML += messagePosition

  chatroomBox.scrollBy(0, chatroomBox.scrollHeight)
}

