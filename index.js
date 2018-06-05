const WorldState = require('warframe-worldstate-parser');
const url = 'http://content.warframe.com/dynamic/worldState.php';
//const url = 'E:\\web_learning_projects\\node\\warframeAlert\\dummy.json'
const request = require('request')
const WindowsToaster = require('node-notifier').WindowsToaster;
const notifier = new WindowsToaster({
    withFallback: false, // Fallback to Growl or Balloons?
    customPath: void 0 // Relative/Absolute path if you want to use your fork of SnoreToast.exe
  });

console.log('index.js is running');

function getData() {
    request(url, (error, response, body) => {
        if (error) throw error  
      
        console.log('statusCode:', response && response.statusCode)  
        
        if (response.statusCode == 200) {
          let worldstateData =  body
          let ws = new WorldState(worldstateData);   
      
          test(ws)
        } else {
          console.log('statusCode:', response && response.statusCode)      
        }   
      });
}

getData()

let Olddravo
let oldAlerts = []

function test(wf) {    
    //notify todays dravo deal
    if ( Olddravo == undefined) {      
        notifyDravo(wf.dailyDeals[0])
        Olddravo = wf.dailyDeals
    } else {
        if (wf.dailyDeals[0].item !== Olddravo[0].item) { 
            notifyDravo(wf.dailyDeals[0]) 
            Olddravo = wf.dailyDeals
        }
    }

    //notify Alerts
    //skip alerting if its the first time app running
    if ( oldAlerts[0] == undefined) {
        wf.alerts.forEach(element => {
            oldAlerts.push(element.id)
        });
        console.log('oldAlerts', oldAlerts);        
    } else {
        let newAlerts = []
        wf.alerts.forEach(element => {
            if(!oldAlerts.includes(element.id)) {
                newAlerts.push(element)
            }
        });
        newAlerts.forEach(element => {
            notifyAlert(element)
        });
        oldAlerts = []
        wf.alerts.forEach(element => {
            oldAlerts.push(element.id)
        });
    }



    setTimeout(getData, 2000)
    
}

function notifyDravo(params) {
    notifier.notify(
        {
            title: `${params.item} on sale!`,
            message: `Buy ${params.item} for ${params.salePrice}p with a ${params.originalPrice - params.salePrice}p discount. ${params.sold}/${params.total} available `,
           // sound: true,
            wait: true,
        }
    )
}

function notifyAlert(params) {
    console.log('***************new alert ', params);
    
    notifier.notify(
        {
            title: params.mission.reward.asString,
            message: `${params.mission.type}(${params.mission.minEnemyLevel}-${params.mission.maxEnemyLevel}) in ${params.mission.node}`,
            icon: params.mission.reward.thumbnail,
            sound: true,
            wait: true
        }
    )
}