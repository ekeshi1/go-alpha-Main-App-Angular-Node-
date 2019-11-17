const express= require('express');
const router = express.Router();
/*const siteModel = require('./models/siteModel')*/
const allowedGroups=['Compliance']
const bcrypt = require('bcrypt');
const saltRounds = 10;
const someOtherPlaintextPassword = 'not_bacon';
const dbHelper = require("../db/dbHelper");
const createCloudTask = require('../utils/cloudTask')


const project = 'push-notif-259017';
const queue = 'scheduler-queue3';
const location = 'europe-west6';
const serviceAccountEmail = "cloud-tasker-service@push-notif-259017.iam.gserviceaccount.com"


router.get('/getAllSites',(req,res,next)=>{

    const userEmail = req.query.userEmail;
    console.log(userEmail);
    dbHelper.getAllSites(userEmail,(response)=>{

        res.json(response);

    })


})

router.get('/getSingleSite',(req,res,next)=>{
    const idSite = req.query.idSite;
    console.log(idSite);

    dbHelper.getSingleSite(idSite,(response)=>{
        res.json(response);
    })
})

router.post('/addSite',(req,res,next)=>{
   // console.log(req);
    const siteName =  req.body.siteName;
    console.log(siteName)
    const siteUrl = req.body.siteUrl;
    //console.log(siteUrl);
    const userEmail = req.body.userEmail;
    const date  = Date.now();
    const tohash = `${siteUrl}${date}`
    console.log(tohash);
    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(tohash, salt, function(err, hash) {
            dbHelper.insertSite(hash,siteUrl,siteName,userEmail,(response)=>{

                res.json(response);

            })
        });
    });


})

/*
router.delete('/{id}',(req,res,next)=>{
})
*/

router.delete('/deleteSite',(req,res,next)=>{
    console.log("came");
    const idSite = req.query.idSite;
    console.log(idSite);
    dbHelper.deleteSite(idSite,(response)=>{
        res.json(response);
    })

})


router.get('/getCampaigns',(req,res,next)=>{
    const idSite = req.query.idSite;
    console.log(idSite);

    dbHelper.getAllCampaignsForSite(idSite,(response)=>{
        res.json(response);
    })
})

router.post('/addCampaign',(req,res,next)=>{
    let cloudFunctionUrl = "https://us-central1-push-notif-259017.cloudfunctions.net/campaign-sender-http";

    console.log(req.query.idSite);
    const idSite= req.query.idSite;
    const campaignName = req.body.campaignName;
    const campaignDescription = req.body.campaignDescription;
    const notificationTitle = req.body.notificationTitle;
    const notificationMessage = req.body.notificationMessage;
    const notificationUrl = req.body.notificationUrl;
    const notificationIcon = req.body.notificationIcon;
    const sendNow = req.body.sendNow;
    console.log(sendNow);
    const scheduleTime = req.body.scheduleTime;
    const chooseDate = req.body.creationDate;
    console.log(notificationIcon);

    const creationDate = new Date();


    //const scheduleTime = new Date()//req.body.scheduleDate;
    //TODO: translate schedule date time in secs


    let secondsToSchedule = 0;

    if(!sendNow){
        let currentUtcDate = new Date().getTime();
        let utcDate =  Date.parse(chooseDate);
        console.log("Scheduled date only "+utcDate);
        console.log("Diff"+ (currentUtcDate - utcDate)/(1000*60*60))
        let timeDiff = (currentUtcDate-utcDate)/1000

        let time = scheduleTime
        let hourString=time.split(":")[0];
        let minuteString = time.split(":")[1];
        let hours = parseInt(hourString);//360000
        console.log(hours);
        let minutes = parseInt(minuteString); //*6000
        console.log(minutes);

        secondsToSchedule=  (hours*3600 + minutes*60)-timeDiff
        console.log("Shcheduled in "+ secondsToSchedule);


    }

            //console.log(cloudFunctionUrl);
        dbHelper.insertCampaign(idSite,campaignName,campaignDescription, notificationTitle, notificationMessage, notificationUrl, notificationIcon, creationDate, scheduleTime,(response,createdCampaignId)=>{
            res.json(response);

            if(createdCampaignId){
                cloudFunctionUrl+=`?campaignId=${createdCampaignId}`
                console.log(cloudFunctionUrl);
                createCloudTask(cloudFunctionUrl,project,location,queue,serviceAccountEmail,secondsToSchedule,(err,taskName)=>{
                    if(err){
                        console.log("Campaign inserted but not scheduled");
                    }
                    console.log("Created task with name :"+taskName);
                })
            } else return;


    })





})


router.get('/getSingleCampaign',(req,res,next)=>{
    const idCampaign = req.query.idCampaign;
    console.log(idCampaign);

    dbHelper.getSingleCampaign(idCampaign,(response)=>{
        res.json(response);
    })
})





module.exports=router;
