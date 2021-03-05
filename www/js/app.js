document.addEventListener('deviceready', deviceReady, false);

function deviceReady(){
    StatusBar.backgroundColorByHexString("#480709");
    // alert(NavigationBar);
    NavigationBar.show();
	screen.orientation.lock('portrait');
}