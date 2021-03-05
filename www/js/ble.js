var sensor = {
    service: "4fafc201-1fb5-459e-8fcc-c5c9c331914b",
    characteristic: "beb5483e-36e1-4688-b7f5-ea07361b26a8"
}

var app = {
    count : 0,
    deviceid: "", 
      
    
    goToTargetView: function (elm=document.body) {
        try {
            var buttonComputedStyles = getComputedStyle(elm);
            var actionTargetValue = buttonComputedStyles.getPropertyValue("--web-action-target").trim(); 
            var targetType = buttonComputedStyles.getPropertyValue("--web-action-type").trim();

            if (targetType=="page") {
                localStorage["deviceid"] = app.deviceid;
                document.location.href = "./" + actionTargetValue;
                
                //alert(app.deviceid)
            }
        } catch (error) {
           alert(error) 
        }
    },

    onload: function (){
        info = document.getElementById('info');
        info.className = "Info_Class_hidden"
        
    },

    onReadingsLoad: function () {
        //alert("yo man")
        document.addEventListener('deviceready', app.subscribeForIncomingData, false)
        var disconnectButton = document.getElementById("disconnect")
        disconnectButton.addEventListener('click', app.disconnect, false)

        document.addEventListener("backbutton", function () {
            alert(`I will disconnect from ${app.deviceid}`)

            ble.disconnect(app.deviceid, app.goToTargetView(), app.onError);
        }, false);
    },

    startEvents: function (){
        document.addEventListener("deviceready", function () {
            NavigationBar.show();
	        screen.orientation.lock('portrait');
        }, false)

        var container = document.getElementById("container");
        container.addEventListener("click", app.connect, false)
        
        
        // var scanButton = document.getElementById("scan");
        // console.log(scanButton)
        // scanButton.addEventListener('click', function(){
        //     alert("yoo")
        // }, false)
    },

    deleteList: function(){
        ble.stopScan(function(){}, function(e){alert("Stop Error "+e)})
        app.count=0
        const devices = document.getElementsByClassName("Info_Class");
        var container = document.getElementById('container');
        console.log(devices)
        for (const device of devices){
            console.log(device)
            setTimeout(() => {
               container.removeChild(device) 
            }, 100);
            
        }
    },

    scan: function(){
        var devices = document.getElementsByClassName("Info_Class");
        console.log(devices.length)
        if (devices.length>0){app.deleteList()}
       // alert("Scan starting...") 
        ble.scan([], 5, app.onDiscover, app.onError);
    },

    connect: function(e){
        // alert("tapped")
        var parent = e.target.parentNode;
        

        while (parent.className != 'Info_Class') {
            parent = parent.parentNode;
        }
        
        
        app.deviceid = parent.dataset.deviceid;
        //console.log(app.deviceid);

        // ble.stopScan(function(){}, function(a){alert("Stop Error "+a)})
        var onConnect = function(p){
            // alert(app.deviceid)
            //alert(JSON.stringify(p));                
            app.goToTargetView(parent)   
        }
        
        ble.connect(app.deviceid, onConnect, app.onError);
    },

    subscribeForIncomingData: function() {
        app.deviceid = localStorage["deviceid"]
        try {
            ble.startNotification(app.deviceid, sensor.service, sensor.characteristic, app.onData, function(e){alert("subscription error" + e)});
        } catch (error) {
            alert(error)
        }
        
    },

    editData: function (array) {
        var out, i, len, c;
        var char2, char3;
    
        out = "";
        len = array.length;
        i = 0;
        while(i < len) {
        c = array[i++];
        switch(c >> 4)
        { 
          case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
            // 0xxxxxxx
            out += String.fromCharCode(c);
            break;
          case 12: case 13:
            // 110x xxxx   10xx xxxx
            char2 = array[i++];
            out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
            break;
          case 14:
            // 1110 xxxx  10xx xxxx  10xx xxxx
            char2 = array[i++];
            char3 = array[i++];
            out += String.fromCharCode(((c & 0x0F) << 12) |
                           ((char2 & 0x3F) << 6) |
                           ((char3 & 0x3F) << 0));
            break;
        }
        }
    
        return out;
    },

    converData: function (Uint8Arr) {
        var length = Uint8Arr.length;
    
        let buffer = Buffer.from(Uint8Arr);
        var result = buffer.readUIntBE(0, length);
    
        return result;
    },

    onData: function(buffer) { // data received from MetaWear
        try {
            var data = new Uint8Array(buffer);
            //var string = app.editData(data);
            //var num = app.converData(data)
            // alert(data)
            var valuespan = document.getElementById("value").children[0]
            valuespan.innerHTML = data[0];
        } catch (error) {
            alert(error)
        }

    },

    disconnect: function(event) {
        var parent = event.target.parentNode;

        while (parent.className != 'Disconnect_Class') {
            parent = parent.parentNode;
        }

        alert(`I will disconnect from ${app.deviceid}`)
        ble.disconnect(app.deviceid, app.goToTargetView(parent), app.onError);
        // app.deviceId = "";
        //localStorage.removeItem("deviceid")
    },

    onDiscover: function(device){
        
        app.count++;

        //alert("device found " + device.id +" "+ app.count); 
        app.cloneInfo(app.count, device.name, device.id);
    },

    onError : function (err){
        alert("error" + err)
    },
    

    cloneInfo: function (count, name, id) {
        var top = 117.383 * (count - 1) /* + 187*/;

        var info = document.getElementById('info');
        var container = document.getElementById('container');
        var cln = info.cloneNode(true);

        cln.className = "Info_Class";
        cln.style.top = top + "px";
        cln.dataset.deviceid = id;
        container.appendChild(cln);

        var nameElem = document.getElementsByClassName("name_Class")[count].children[0];
        nameElem.innerHTML = name;
        var idElem = document.getElementsByClassName("uuid_Class")[count].children[0];
        idElem.dataset.deviceid = id;
        idElem.innerHTML = id;
    },

    initialize: function(){
        this.startEvents();
        app.onload();
    }
}



// function bleScan(count=app.count) {
//     alert("Scan starting...") 
//     ble.startScan([], function(device) {
//         count++;
//         var name = device.name;
//         var id = device.id;
//         cloneInfo(count, name, id);
//         //alert(JSON.stringify(device) + name + id +count);
//         if (count===5) {
//             ble.stopScan();
//             alert("Scan stopped") 
//         }
//     });
     
    
// }

// function failure(err){
//     alert(err)
// }

// function onDeviceReady(){
//     // Start tracking devices!
//     setTimeout(startScan, 1000)

//     // Timer that refreshes the display.
// }


// function startScan(){
//     alert('Scan in progress')
//     evothings.ble.startScan(
        
//         function(device)
//         {
//             alert('got device ' + device.name + ' ' + device.address)

//             // // Update device data.
//             // device.timeStamp = Date.now()
//             // devices[device.address] = device
//         },
//         function(error)
//         {
//             alert('BLE scan error: ' + error)
//         })
// }