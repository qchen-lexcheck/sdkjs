
var DefaultScale = visualViewport.scale;
var ScalePercent = (visualViewport.scale < 1) ? ( 1 - visualViewport.scale) : (visualViewport.scale > 1) ? (visualViewport.scale) : 1;
var isAndroid = navigator.userAgent.toLocaleLowerCase().indexOf("android") > -1;
var approximateBrowserToolbarHeight = screen.availHeight - window.innerHeight;
var KeyboardHeight = 0;
var KeyboardIsOpened = false;
var timer1 = -1;
var timer2 = -1;

	
if (visualViewport)
	visualViewport.addEventListener('resize', onResize, false);
else
	window.addEventListener('resize', onResize, false);

window.addEventListener('orientationchange', function(e) {
	if (timer2 != -1)
		clearTimeout(timer2);
	timer2 = setTimeout(function(){
		approximateBrowserToolbarHeight = screen.availHeight - window.innerHeight;
		DefaultScale = visualViewport.scale;
		ScalePercent = (visualViewport.scale < 1) ? ( 1 - visualViewport.scale) : (visualViewport.scale > 1) ? (visualViewport.scale) : 1;
	}, 400);
}, false);

function onResize() {
	if (timer1 != -1) 
		clearTimeout(timer1);

	timer1 = setTimeout(function(){
		var coef = 1;
		var height = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
		if (isAndroid) {
			coef = window.innerHeight / (screen.availHeight - approximateBrowserToolbarHeight);
			KeyboardHeight = screen.availHeight - approximateBrowserToolbarHeight - window.innerHeight;
		} else {
			if (DefaultScale == 1) {
				coef = visualViewport.height * visualViewport.scale / height;
				KeyboardHeight = height - (obj.height * obj.scale);
			}
			else {
				coef = visualViewport.height * ( visualViewport.scale + ( (visualViewport.scale * 100) / (DefaultScale * 100) ) * ScalePercent) / height;
				KeyboardHeight = height - ( visualViewport.height * ( visualViewport.scale + ( (visualViewport.scale * 100) / (DefaultScale * 100) ) * ScalePercent) );
			}
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
	}, 500);
	
};