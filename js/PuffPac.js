let // vars

  // control vars
  KEY_LEFT = 37,
  KEY_RIGHT = 39,
  KEY_UP = 38,
  KEY_DOWN = 40,
  // game vars
  gameInterval,
  score = 0,
  isPlaying,
  isKeyDown,
  lastX,
  lastY,
  isSameColumn,
  isSameRow,
  // screen/game size vars
  SCREEN_WIDTH = 835,
  SCREEN_HEIGHT = 469,
  CELL_SIZE = 32,
  GRID_WIDTH = SCREEN_WIDTH / CELL_SIZE,
  GRID_HEIGHT = SCREEN_HEIGHT / CELL_SIZE,
  // timestep
  t = 0,
  dt = 10,
  currentTime = new Date().getTime(),
  accumulator = 0,
  // display surface vars
  canvas = document.createElement("canvas"),
  context = canvas.getContext("2d"),
  // buttons
  leftButton,
  rightButton,
  upButton,
  downButton,
  // input vars
  leftDown,
  rightDown,
  upDown,
  downDown,
  isTouch,
  // preload image resources
  assetImages = {}

// Assets
const playerImage = (assetImages["player"] = new Image())
assetImages["player"].src = "../assets/player.png"

const ghostImage = (assetImages["ghost"] = new Image())
assetImages["ghost"].src = "../assets/ghost.png"

const levelImage = (assetImages["level"] = new Image())
assetImages["level"].src = "../assets/puffpac.png"

function init() {
  // CANVAS SET UP
  zivcontainer = document.getElementById("PuffPac")
  container = document.createElement("div")
  container.id = "container"
  container.style.width = SCREEN_WIDTH + "px"
  container.style.height = SCREEN_HEIGHT + "px"
  zivcontainer.appendChild(container)
  container.appendChild(canvas)
  canvas.width = SCREEN_WIDTH
  canvas.height = SCREEN_HEIGHT

  // EVENT LISTENERS
  document.addEventListener("keydown", onKeyPress, false)
  document.addEventListener("keyup", onKeyPress, false)
  container.addEventListener("click", onClicked, false)

  // level
  level = new Level(levelImage, context)

  charcontainer = document.createElement("div")
  charcontainer.className = "charcontainer"
  charcontainer.style.width = SCREEN_WIDTH + "px"
  charcontainer.style.height = SCREEN_HEIGHT + "px"
  container.appendChild(charcontainer)

  // player character
  player = new Player(CELL_SIZE, CELL_SIZE, playerImage)
  charcontainer.appendChild(player.domElement)

  // ghost
  ghost = new Ghost(CELL_SIZE * 11, CELL_SIZE * 5, ghostImage)
  charcontainer.appendChild(ghost.domElement)

  infobg = document.createElement("div")
  infobg.id = "infobg"
  infobg.className = "info"
  infobg.style.width = SCREEN_WIDTH + "px"
  infobg.style.height = SCREEN_HEIGHT + "px"
  container.appendChild(infobg)
  info = document.createElement("div")
  info.id = "info"
  info.className = "info"
  info.style.width = "100%"
  container.appendChild(info)

  scoreContainer = document.createElement("div")
  scoreContainer.id = "score"
  scoreContainer.style.width = SCREEN_WIDTH + "px"
  zivcontainer.appendChild(scoreContainer)

  player.init()
  ghost.init()

  if (Modernizr.touch) {
    isTouch = true
    makeControls()
  }

  showInfo("<a class='btn'>" + (isTouch ? "TOUCH" : "CLICK") + " TO START</a>")
}

function run() {
  var newTime = new Date().getTime()
  var deltaTime = newTime - currentTime
  currentTime = newTime

  if (deltaTime > 25) {
    deltaTime = 25
  }

  accumulator += deltaTime

  while (accumulator >= dt) {
    accumulator -= dt
    update()
  }
  render()
}

function update() {
  player.update()
  ghost.update()

  if (player.xp % CELL_SIZE == 0 && player.yp % CELL_SIZE == 0) {
    var cx = (player.row = player.xp / CELL_SIZE)
    var cy = (player.column = player.yp / CELL_SIZE)

    if (upDown && player.dirY > -1 && level.cellData[cx][cy - 1] != 0)
      player.moveUp()
    else if (downDown && player.dirY < 1 && level.cellData[cx][cy + 1] != 0)
      player.moveDown()
    else if (leftDown && player.dirX > -1 && level.cellData[cx - 1][cy] != 0)
      player.moveLeft()
    else if (rightDown && player.dirX < 1 && level.cellData[cx + 1][cy] != 0)
      player.moveRight()
    else if (player.dirX == 1 && level.cellData[cx + 1][cy] == 0)
      player.stopMovement()
    else if (player.dirX == -1 && level.cellData[cx - 1][cy] == 0)
      player.stopMovement()
    else if (player.dirY == 1 && level.cellData[cx][cy + 1] == 0)
      player.stopMovement()
    else if (player.dirY == -1 && level.cellData[cx][cy - 1] == 0)
      player.stopMovement()

    if (level.cellData[cx][cy] == 1) {
      level.pips[cx][cy].munch()
      level.cellData[cx][cy] = 2
      ++score
      document.getElementById("score").innerHTML =
        "SCORE: <span>" + score + "<span>"
      if (score == level.totalPips) {
        onGameOver(true)
      }
    }

    isSameRow = player.row == ghost.row
    isSameColumn = player.column == ghost.column
  } else {
    if (upDown && player.dirY != -1 && player.dirX == 0) player.moveUp()
    else if (downDown && player.dirY != 1 && player.dirX == 0) player.moveDown()
    else if (leftDown && player.dirX != -1 && player.dirY == 0)
      player.moveLeft()
    else if (rightDown && player.dirX != 1 && player.dirY == 0)
      player.moveRight()
  }

  if (ghost.xp % CELL_SIZE == 0 && ghost.yp % CELL_SIZE == 0) {
    updateGhost()

    isSameRow = player.row == ghost.row
    isSameColumn = player.column == ghost.column
  }

  if (isSameRow || isSameColumn) {
    var dx = Math.abs(player.xp - ghost.xp)
    var dy = Math.abs(player.yp - ghost.yp)
    var dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < CELL_SIZE) {
      onGameOver(false)
    }
  }
}

function render() {
  player.render()
  ghost.render()
}

function updateGhost() {
  var playerCellX = player.row
  var playerCellY = player.column

  var playerChangedPos = playerCellX != lastX || playerCellY != lastY
  lastX = playerCellX
  lastY = playerCellY

  var lastRow = ghost.row
  var lastColumn = ghost.column

  var cx = (ghost.row = ghost.xp / CELL_SIZE)
  var cy = (ghost.column = ghost.yp / CELL_SIZE)

  if (!ghost.chasing && (ghost.dirX != 0 || ghost.dirY != 0)) {
    var nextTileFree = false

    if (ghost.dirY <= -1 && level.cellData[cx][cy - 1] != 0) nextTileFree = true
    else if (ghost.dirY >= 1 && level.cellData[cx][cy + 1] != 0)
      nextTileFree = true
    else if (ghost.dirX <= -1 && level.cellData[cx - 1][cy] != 0)
      nextTileFree = true
    else if (ghost.dirX >= 1 && level.cellData[cx + 1][cy] != 0)
      nextTileFree = true

    if (nextTileFree) return
  }

  var nodes = []

  if (level.cellData[cx + 1][cy] != 0) nodes.push([cx + 1, cy, 1, 0])
  if (level.cellData[cx - 1][cy] != 0) nodes.push([cx - 1, cy, -1, 0])
  if (level.cellData[cx][cy + 1] != 0) nodes.push([cx, cy + 1, 0, 1])
  if (level.cellData[cx][cy - 1] != 0) nodes.push([cx, cy - 1, 0, -1])

  if (nodes.length == 1) {
    ghost.dirX = nodes[0][2]
    ghost.dirY = nodes[0][3]
  } else if (!ghost.chasing) {
    var node = nodes[Math.floor(Math.random() * nodes.length)]
    ghost.dirX = node[2]
    ghost.dirY = node[3]
  } else {
    var smallest = Infinity
    var node

    var i = nodes.length
    while (--i > -1) {
      var dx = Math.abs(playerCellX - nodes[i][0])
      var dy = Math.abs(playerCellY - nodes[i][1])
      var dist = Math.sqrt(dx * dx + dy * dy)
      if (
        dist < smallest &&
        ((nodes[i][0] != lastRow && nodes[i][1] != lastColumn) ||
          playerChangedPos)
      ) {
        smallest = dist
        node = nodes[i]
      }
    }

    if (node) {
      ghost.dirX = node[2]
      ghost.dirY = node[3]
    }
  }
}

function onGameOver(complete) {
  stopGame()

  var str
  if (complete) {
    str =
      "<h1>YOU WIN!</h1><p>You get a free website!</p><p>ok, you don't really, but karma for winning</p><p><a class='btn'>" +
      (isTouch ? "TOUCH" : "CLICK") +
      " TO PLAY AGAIN</a></p>"
  } else {
    str =
      "<h1>GAME OVER</h1><p><a class='btn'>" +
      (isTouch ? "TOUCH" : "CLICK") +
      " TO RESTART<span></p>"
  }

  showInfo(str)
  container.addEventListener("click", onClicked, false)
  if (isTouch) container.addEventListener("touchstart", onClicked, false)
  container.style.cursor = "pointer"
}

function resetGame() {
  score = 0
  level.reset()
  player.reset()
  ghost.reset()
}

function showInfo(str) {
  if (str) {
    document.getElementById("info").innerHTML = str
    info.style.top = (SCREEN_HEIGHT - info.offsetHeight) * 0.5 + "px"
  }

  info.style.opacity = 1
  infobg.style.opacity = 0.75
}

function makeControls() {
  document.addEventListener(
    "touchmove",
    function (e) {
      e.preventDefault()
    },
    false
  )
  document.addEventListener(
    "touchstart",
    function (e) {
      e.preventDefault()
    },
    false
  )

  var w = 120
  var h = 250
  var space = 50

  buttons = document.createElement("div")
  buttons.id = "container"
  buttons.style.width = SCREEN_WIDTH + "px"
  buttons.style.height = SCREEN_HEIGHT + "px"
  zivcontainer.appendChild(buttons)

  var button

  button = new KeyButton(SCREEN_WIDTH * 0.5 - w * 0.5 - w, h - 180)
  leftButton = button.domElement
  leftButton.addEventListener("touchstart", onKeyPress, false)
  leftButton.addEventListener("touchend", onKeyPress, false)
  buttons.appendChild(leftButton)

  button = new KeyButton(SCREEN_WIDTH * 0.5 + w * 0.5, h - 180)
  rightButton = button.domElement
  rightButton.addEventListener("touchstart", onKeyPress, false)
  rightButton.addEventListener("touchend", onKeyPress, false)
  buttons.appendChild(rightButton)

  button = new KeyButton((SCREEN_WIDTH - w) * 0.5, h - 240)
  upButton = button.domElement
  upButton.addEventListener("touchstart", onKeyPress, false)
  upButton.addEventListener("touchend", onKeyPress, false)
  buttons.appendChild(upButton)

  button = new KeyButton((SCREEN_WIDTH - w) * 0.5, h - 120)
  downButton = button.domElement
  downButton.addEventListener("touchstart", onKeyPress, false)
  downButton.addEventListener("touchend", onKeyPress, false)
  buttons.appendChild(downButton)

  container.addEventListener("touchstart", onClicked, false)
}

function onClicked(e) {
  container.removeEventListener("click", onClicked, false)
  if (isTouch) container.removeEventListener("touchstart", onClicked, false)
  container.style.cursor = "default"

  startGame()
  info.style.opacity = 0
  infobg.style.opacity = 0
}

function onKeyPress(e) {
  if (!isPlaying && !isKeyDown) onClicked()
  isKeyDown = isTouch ? e.type == "touchstart" : e.type == "keydown"

  switch (isTouch ? e.target : e.keyCode) {
    case KEY_LEFT:
    case leftButton:
      leftDown = isKeyDown
      break

    case KEY_RIGHT:
    case rightButton:
      rightDown = isKeyDown
      break

    case KEY_UP:
    case upButton:
      upDown = isKeyDown
      break

    case KEY_DOWN:
    case downButton:
      downDown = isKeyDown
      break
  }
}

function startGame() {
  if (isPlaying) return
  isPlaying = true
  document.getElementById("score").innerHTML = "SCORE: " + score
  resetGame()
  gameInterval = setInterval(run, 1)
}

function stopGame() {
  isPlaying = false
  clearInterval(gameInterval)
}

function Animation(img, w, h, domElem) {
  var img = (this.img = img)
  var domElement = (this.domElement = domElem)
  this.playing = true
  this.looping = true
  this.width = w
  this.height = h
  this.x = 0
  this.y = 0
  this.rotation = 0
  this.offsetX = 0
  this.offsetY = 0
  this.spriteSheetWidth = this.img.width
  this.numFrames = Math.floor(this.spriteSheetWidth / this.width)
  this.currentFrame = 0

  if (!this.domElement) {
    this.domElement = document.createElement("div")
    this.domElement.className = "animation"
    this.domElement.style.background = "url(" + img.src + ")"
    this.domElement.style.width = this.width + "px"
    this.domElement.style.height = this.height + "px"
  }

  this.update = function () {
    if (this.playing) {
      var nextFrame = this.currentFrame + 1

      if (nextFrame >= this.numFrames) {
        if (this.looping) {
          this.gotoAndStop(0)
        } else {
          this.playing = false
          this.gotoAndStop(this.numFrames - 1)
        }
      } else {
        this.gotoAndStop(nextFrame)
      }
    }
  }

  this.render = function () {
    var dom = this.domElement
    var offset = this.currentFrame * this.width

    dom.style.background = "url(" + img.src + ")"
    dom.style.width = this.width + "px"
    dom.style.height = this.height + "px"
    dom.style.backgroundPosition = offset + "px 0 "

    var xp = Math.round(this.x + this.offsetX)
    var yp = Math.round(this.y + this.offsetY)

    styleStr = "translate(" + xp + "px, " + yp + "px)"
    dom.style.webkitTransform = styleStr
    dom.style.MozTransform = styleStr
    dom.style.OTransform = styleStr
    dom.style.transform = styleStr

    styleStr = "rotate(" + this.rotation + "deg)"
    dom.style.webkitTransform += styleStr
    dom.style.MozTransform += styleStr
    dom.style.OTransform += styleStr
    dom.style.transform += styleStr
  }

  this.play = function () {
    this.playing = true
  }

  this.gotoAndStop = function (framenum) {
    this.currentFrame = framenum
  }

  this.stop = function () {
    this.playing = false
  }
}

function Ghost(x, y, img) {
  this.row = x / CELL_SIZE
  this.column = y / CELL_SIZE

  this.speed = 1

  var xp = (this.xp = this.startX = x)
  var yp = (this.yp = this.startY = y)

  var dirX = (this.dirX = 0)
  var dirY = (this.dirY = 0)

  this.chaseTime = 7
  this.idleTime = 3
  this.chasing = false
  var scope = this
  this.interval = setInterval(function () {
    scope.changeChase()
  }, 1000 * this.idleTime)

  this.width = 32
  this.height = 32

  var animation = (this.animation = new Animation(img, 32, 32, domElement))
  animation.offsetY = 0
  animation.offsetX = 0
  animation.looping = true
  animation.play()

  var domElement = (this.domElement = this.animation.domElement)

  this.moveRight = function () {
    this.dirX = this.speed
    this.dirY = 0
    this.animation.rotation = 0
  }

  this.moveLeft = function () {
    this.dirX = -this.speed
    this.dirY = 0
    this.animation.rotation = 180
  }

  this.moveUp = function () {
    this.dirX = 0
    this.dirY = -this.speed
    this.animation.rotation = 270
  }

  this.moveDown = function () {
    this.dirX = 0
    this.dirY = this.speed
    this.animation.rotation = 90
  }

  this.stopMovement = function () {
    this.dirX = this.dirY = 0
  }

  this.update = function () {
    this.xp += this.dirX
    this.yp += this.dirY

    this.animation.x = this.xp
    this.animation.y = this.yp
    this.animation.update()
  }

  this.render = function () {
    this.animation.render()
  }

  this.getLeft = function () {
    return this.xp
  }

  this.getRight = function () {
    return this.xp + this.width
  }

  this.getTop = function () {
    return this.yp
  }

  this.getBottom = function () {
    return this.yp + this.height
  }

  this.changeChase = function () {
    clearInterval(this.interval)
    this.chasing = !this.chasing

    var scope = this
    var time = this.chasing ? this.chaseTime : this.idleTime
    this.interval = setInterval(function () {
      scope.changeChase()
    }, 1000 * time)
  }

  this.reset = function () {
    this.xp = this.startX
    this.yp = this.startY
  }

  this.init = function () {
    this.update()
    this.render()
  }
}

function KeyButton(x, y) {
  var dom = (this.domElement = document.createElement("div"))
  dom.className = "keybutton"
  dom.style.left = x + "px"
  dom.style.top = y + "px"
}

function Level(img, c) {
  var context = c
  this.totalPips = 0

  // create a greenscreen behind level so
  // we can detect what is a wall etc
  context.fillStyle = "#00FF00"
  context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)
  context.drawImage(img, 0, 0)

  var w = 0,
    h,
    xp = CELL_SIZE / 2,
    yp,
    pip
  var cellData = (this.cellData = [])
  var pips = (this.pips = [])

  for (w; w < GRID_WIDTH; ++w) {
    cellData[w] = []
    pips[w] = []
    yp = CELL_SIZE / 2
    h = 0

    for (h; h < GRID_HEIGHT; ++h) {
      cellData[w][h] = context.getImageData(xp, yp, 1, 1).data[1] == 255 ? 1 : 0
      if (cellData[w][h] == 1) {
        //add pip
        var pip = new Pip(xp, yp, 7)
        container.appendChild(pip.domElement)
        pips[w][h] = pip
        ++this.totalPips
      }
      yp += CELL_SIZE
    }
    xp += CELL_SIZE
  }

  // revert the bg to black
  context.fillStyle = "#fff"
  context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT)
  context.drawImage(img, 0, 0)

  this.reset = function () {
    var w = pips.length
    while (--w > -1) {
      var h = pips[w].length
      while (--h > -1) {
        if (pips[w][h] != null && pips[w][h].munched) {
          pips[w][h].reset()
          cellData[w][h] = 1
        }
      }
    }
  }
}

function Pip(x, y, size) {
  this.width = this.height = size
  this.munched = false

  this.domElement = document.createElement("div")
  this.domElement.className = "pip"
  this.domElement.style.width = size + "px"
  this.domElement.style.height = size + "px"
  this.domElement.style.borderRadius = size + "px"
  this.domElement.style.left = Math.round(x - size / 2) + "px"
  this.domElement.style.top = Math.round(y - size / 2) + "px"

  this.munch = function () {
    this.munched = true
    this.domElement.style.opacity = 0
  }

  this.reset = function () {
    this.munched = false
    this.domElement.style.opacity = 1
  }
}
function Player(x, y, img) {
  this.row = x / CELL_SIZE
  this.column = y / CELL_SIZE
  this.speed = 1

  var xp = (this.xp = this.startX = x)
  var yp = (this.yp = this.startY = y)
  var dirX = (this.dirX = 0)
  var dirY = (this.dirY = 0)

  var animation = (this.animation = new Animation(
    img,
    CELL_SIZE,
    CELL_SIZE,
    domElement
  ))
  animation.offsetY = 0
  animation.offsetX = 0
  animation.looping = true
  animation.stop()

  var domElement = (this.domElement = this.animation.domElement)

  this.moveRight = function () {
    this.dirX = this.speed
    this.dirY = 0
    this.animation.rotation = 0
    if (!this.animation.playing) this.animation.play()
  }

  this.moveLeft = function () {
    this.dirX = -this.speed
    this.dirY = 0
    this.animation.rotation = 180
    if (!this.animation.playing) this.animation.play()
  }

  this.moveUp = function () {
    this.dirX = 0
    this.dirY = -this.speed
    this.animation.rotation = 90
    if (!this.animation.playing) this.animation.play()
  }

  this.moveDown = function () {
    this.dirX = 0
    this.dirY = this.speed
    this.animation.rotation = 270
    if (!this.animation.playing) this.animation.play()
  }

  this.stopMovement = function () {
    this.dirX = this.dirY = 0
    this.animation.stop()
  }

  this.update = function () {
    this.xp += this.dirX
    this.yp += this.dirY

    this.animation.x = this.xp
    this.animation.y = this.yp
    this.animation.update()
  }

  this.render = function () {
    this.animation.render()
  }

  this.reset = function () {
    this.xp = this.startX
    this.yp = this.startY
    this.stopMovement()
    this.animation.rotation = 0
    this.animation.gotoAndStop(1)
  }

  this.init = function () {
    this.update()
    this.render()
  }
}
