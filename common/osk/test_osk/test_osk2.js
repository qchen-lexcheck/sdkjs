var DefaultScale = visualViewport.scale;
var ScalePercent = (visualViewport.scale < 1) ? ( 1 - visualViewport.scale) : (visualViewport.scale > 1) ? (visualViewport.scale) : 1;
var isAndroid = navigator.userAgent.toLocaleLowerCase().indexOf("android") > -1;
var KeyboardIsOpened = false;
var timer = -1;

visualViewport.addEventListener('resize', onResize, false);

function onResize() {
	if (timer != -1) 
		clearTimeout(timer);

	timer = setTimeout(function(){
		var coef = 1;
		var height = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
		if (isAndroid) {
			if (window.screen.height - 300 > window.visualViewport.height * window.visualViewport.scale) {
				console.log('keyboard is opened');
				document.getElementById('result').innerHTML = "keyboard is opened";
				KeyboardIsOpened = true;
			} else if (KeyboardIsOpened) {
				console.log('keyboard is closed');
				document.getElementById('result').innerHTML = "keyboard is closed";
				KeyboardIsOpened = false;
			}
		} else {
			if (DefaultScale == 1) {
				coef = visualViewport.height * visualViewport.scale / height;
			}
			else {
				coef = visualViewport.height * ( visualViewport.scale + ( (visualViewport.scale * 100) / (DefaultScale * 100) ) * ScalePercent) / height;
			}

			if (coef < 0.95) {
				console.log('keyboard is opened');
				document.getElementById('result').innerHTML = "keyboard is opened";
				KeyboardIsOpened = true;
			} else if (KeyboardIsOpened) {
				console.log('keyboard is closed');
				document.getElementById('result').innerHTML = "keyboard is closed";
				KeyboardIsOpened = false;
			}
		}	
	}, 500);
	
};