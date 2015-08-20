/*
 * MBP - Mobile boilerplate helper functions
 */
(function(document){

window.MBP = window.MBP || {}; 

// Fix for iPhone viewport scale bug 
// http://www.blog.highub.com/mobile-2/a-fix-for-iphone-viewport-scale-bug/

MBP.viewportmeta = document.querySelector && document.querySelector('meta[name="viewport"]');
MBP.ua = navigator.userAgent;

MBP.scaleFix = function () {
  if (MBP.viewportmeta && /iPhone|iPad/.test(MBP.ua) && !/Opera Mini/.test(MBP.ua)) {
    MBP.viewportmeta.content = "width=device-width, minimum-scale=1.0, maximum-scale=1.0";
    document.addEventListener("gesturestart", MBP.gestureStart, false);
  }
};
MBP.gestureStart = function () {
    MBP.viewportmeta.content = "width=device-width, minimum-scale=0.25, maximum-scale=1.6";
};


// Hide URL Bar for iOS and Android by Scott Jehl
// https://gist.github.com/1183357

//【小云笔记】ch04r07 
MBP.hideUrlBar = function () {
	var win = window,
		doc = win.document;

    //检测url中是否有锚点
    //如果有：不应该运行该代码，因为元本页面根据锚点设置的定位会被覆盖；
    //如果没有：稍等片刻以确定页面没有滚动，这种自动滚动常常发生在页面刷新后，浏览器根据刷新前的定位自动滚动
    //Android设备上的1像素纵向滚动
    //iOS设备上的0像素纵向滚动来隐藏地址
	// If there's a hash, or addEventListener is undefined, stop here
	if( !location.hash || !win.addEventListener ){

		//scroll to 1
		window.scrollTo( 0, 1 );
		var scrollTop = 1,

		//reset to 0 on bodyready, if needed
		bodycheck = setInterval(function(){
			if( doc.body ){
				clearInterval( bodycheck );
				scrollTop = "scrollTop" in doc.body ? doc.body.scrollTop : 1;
				win.scrollTo( 0, scrollTop === 1 ? 0 : 1 );
			}	
		}, 15 );

		win.addEventListener( "load", function(){
			setTimeout(function(){
				//reset to hide addr bar at onload
				win.scrollTo( 0, scrollTop === 1 ? 0 : 1 );
			}, 0);
		}, false );
	}
};


// Fast Buttons - read wiki below before using
// https://github.com/shichuan/mobile-html5-boilerplate/wiki/JavaScript-Helper

//【小云笔记】ch04r06入口函数，用途是为页面添加一个事件监听器，监测页面上发生的所有touchstart和click事件
MBP.fastButton = function (element, handler) {
    this.element = element;
    this.handler = handler;
    if (element.addEventListener) {
      element.addEventListener('touchstart', this, false);
      element.addEventListener('click', this, false);
    }
};
//【小云笔记】一般情况下 大家在使用addEventListener这个方法的时候，在第二个参数上会使用一个方法，但是，还可以传入一个对象，并且对象中handleEvent为事件处理函数
MBP.fastButton.prototype.handleEvent = function(event) {
    switch (event.type) {
        case 'touchstart': this.onTouchStart(event); break;
        case 'touchmove': this.onTouchMove(event); break;
        case 'touchend': this.onClick(event); break;
        case 'click': this.onClick(event); break;
    }
};

//【小云笔记】onTouchStart方法用来监听touchmove和touchend事件，StopPropagation函数用来防止事件在监听器中传递，阻止冒泡，即只在当前方法体内寻找当前事件的监听器
MBP.fastButton.prototype.onTouchStart = function(event) {
    event.stopPropagation();
    this.element.addEventListener('touchend', this, false);
    document.body.addEventListener('touchmove', this, false);
    this.startX = event.touches[0].clientX;
    this.startY = event.touches[0].clientY;
    this.element.style.backgroundColor = "rgba(0,0,0,.7)";
};

//【小云笔记】onTouchMove方法是用来监测浏览器上是否有拖曳事件的发生，如果用户拖曳超过10个像素，将会充值页面
MBP.fastButton.prototype.onTouchMove = function(event) {
    if(Math.abs(event.touches[0].clientX - this.startX) > 10 || 
       Math.abs(event.touches[0].clientY - this.startY) > 10    ) {
        this.reset();
    }
};

//【小云笔记】下面这段代码用来防止幽灵点击，从而可以响应真正的点击事件
MBP.fastButton.prototype.onClick = function(event) {
    event.stopPropagation();
    this.reset();
    this.handler(event);
    if(event.type == 'touchend') {
        MBP.preventGhostClick(this.startX, this.startY);
    }
    this.element.style.backgroundColor = "";
};

MBP.fastButton.prototype.reset = function() {
    this.element.removeEventListener('touchend', this, false);
    document.body.removeEventListener('touchmove', this, false);
    this.element.style.backgroundColor = "";
};

MBP.preventGhostClick = function (x, y) {
    MBP.coords.push(x, y);
    window.setTimeout(function (){
        MBP.coords.splice(0, 2);
    }, 2500);
};

MBP.ghostClickHandler = function (event) {
    for(var i = 0, len = MBP.coords.length; i < len; i += 2) {
        var x = MBP.coords[i];
        var y = MBP.coords[i + 1];
        if(Math.abs(event.clientX - x) < 25 && Math.abs(event.clientY - y) < 25) {
            event.stopPropagation();
            event.preventDefault();
        }
    }
};

if (document.addEventListener) {
    document.addEventListener('click', MBP.ghostClickHandler, true);
}
                            
MBP.coords = [];


// iOS Startup Image
// https://github.com/shichuan/mobile-html5-boilerplate/issues#issue/2

MBP.splash = function () {
    var filename = navigator.platform === 'iPad' ? 'h/' : 'l/';
    document.write('<link rel="apple-touch-startup-image" href="/img/' + filename + 'splash.png" />' );
};


// Autogrow
// http://googlecode.blogspot.com/2009/07/gmail-for-mobile-html5-series.html

MBP.autogrow = function (element, lh) {

    function handler(e){
        var newHeight = this.scrollHeight,
            currentHeight = this.clientHeight;
        if (newHeight > currentHeight) {
            this.style.height = newHeight + 3 * textLineHeight + "px";
        }
    }

    var setLineHeight = (lh) ? lh : 12,
        textLineHeight = element.currentStyle ? element.currentStyle.lineHeight : 
                         getComputedStyle(element, null).lineHeight;

    textLineHeight = (textLineHeight.indexOf("px") == -1) ? setLineHeight :
                     parseInt(textLineHeight, 10);

    element.style.overflow = "hidden";
    element.addEventListener ? element.addEventListener('keyup', handler, false) :
                               element.attachEvent('onkeyup', handler);
};

})(document);

