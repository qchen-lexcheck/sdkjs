var isAndroid = navigator.userAgent.toLocaleLowerCase().indexOf("android") > -1;
var approximateBrowserToolbarHeight = screen.availHeight - window.innerHeight;
var KeyboardIsOpened = false;
var chgWithKeyboard = false;
var skipResize = false;
var timer = -1;

window.addEventListener('orientationchange', function(e) {
	// нужно отслеживать для android, чтобы правильно посчитать approximateBrowserToolbarHeight для новой ориентации экрана
	// из-за того окрыта ли клавиатура в момент смены ориентации мы по разному будем оценивать coef, который рассчитывается по запросу или при resize
	chgWithKeyboard = KeyboardIsOpened;
	if (timer != -1)
		clearTimeout(timer);

	skipResize = true;
	timer = setTimeout(function() {
		// пропускаем все ресайзы, которые придут при изменении ориентации, так как клавиатуру они не закрывают и не открывают
		// но на одном из резайзов нужно будет пересчитать approximateBrowserToolbarHeight
		skipResize = false;
	}, 1000);
}, false);

window.onload = function() {
	document.getElementById('check').onclick = function() {
		var coef;
		if (isAndroid) {
			coef = window.innerHeight / (screen.availHeight - approximateBrowserToolbarHeight);
			// если смена ориентации была с открытой клавиатурой, то при её закрытии coef должен увеличиться быть в пределах от 0.95 до 1.05
			if (chgWithKeyboard  && coef >= 0.95 && coef <= 1.05)
				coef = 0.9;

		} else {
			coef = visualViewport.height * (document.documentElement.clientWidth / window.innerWidth) / document.documentElement.clientHeight;
		}
		if (coef < 0.95) {
			console.log('keyboard is opened');
			document.getElementById('result').innerHTML = "keyboard is opened";
			KeyboardIsOpened = true;
			return true;
		} else {
			console.log('keyboard is closed');
			document.getElementById('result').innerHTML = "keyboard is closed";
			KeyboardIsOpened = false;
			return false;
		}
	};
};

visualViewport.onresize = function() {
	// это событие отслеживаем для ios (так как не приходит resize у window)
	// можно обойтись без него и просто рассчитывать по запросу
	if (!isAndroid && !skipResize) {
		var coef = visualViewport.height * (document.documentElement.clientWidth / window.innerWidth) / document.documentElement.clientHeight;
		if (coef < 0.95) {
			console.log('keyboard is opened');
			document.getElementById('result').innerHTML = "keyboard is opened";
			KeyboardIsOpened = true;
		} else {
			console.log('keyboard is closed');
			document.getElementById('result').innerHTML = "keyboard is closed";
			KeyboardIsOpened = false;
		}
	}	
};

window.onresize = function() {
	// это нужно для отслеживания сокрытия клавиатуры на android (чтобы при смене ориентации экрана мы знали открыта ли она сейчас)
	// нужно чтобы мы понимали, как рассматривать coef
	// без этого события будет проблема если: меняем ориентацию экрана с открытой клавиатурой, дальше её скрываем и не вызываем ни разу проверку на наличие клавиатуры опять меняем ориентацию экрана
	// по идее можно не делать проверку на android, так как в ios оно не приходит, но на всякий случай лучше добавить
	if (isAndroid) {
		if (skipResize) {
			// здесь уже можно пересчитать approximateBrowserToolbarHeight
			approximateBrowserToolbarHeight = screen.availHeight - window.innerHeight;
		} else {
			var coef = window.innerHeight / (screen.availHeight - approximateBrowserToolbarHeight);
			// если смена ориентации была с открытой клавиатурой, то при её закрытии coef должен увеличиться быть в пределах от 0.95 до 1.05
			if (chgWithKeyboard  && coef >= 0.95 && coef < 1.05)
				coef = 0.9;
			
			if (coef < 0.95) {
				console.log('keyboard is opened');
				document.getElementById('result').innerHTML = "keyboard is opened";
				KeyboardIsOpened = true;
			} else {
				console.log('keyboard is closed');
				document.getElementById('result').innerHTML = "keyboard is closed";
				KeyboardIsOpened = false;
			}
		}
	}
};