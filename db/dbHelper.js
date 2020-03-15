const pool = require("./dbConnector");
const siteModel = require('../models/siteModel');
const campaignModel = require("../models/campaignModel");


module.exports.insertSite = async function( hash , siteUrl, siteName,userEmail,cb){
    pool.query("INSERT INTO `push_notif`.`PN_SITES`\n" +
        "(`id_site`,\n" +
        "`site_name`,\n" +
        "`site_url`,\n" +
        "`user_email`,\n" +
        "`active`)\n" +
        "VALUES\n" +
        "(?,\n" +
        "?,\n" +
        "?,\n" +
        "?,\n" +
        "?);\n",[hash,siteName,siteUrl,userEmail,1],(error,results)=>{
        console.log("finished");
        if(error)
        {
            console.log(error);
            cb({
                message : "Couldn't insert site",
                status : 0
            })
        }
        console.log(results);

cb({
    message: "Site Added",
    hash : hash,
    status: 1
})
    });

    console.log("Alkida");
}

module.exports.getAllSites = async function( userEmail, cb ) {
    console.log("came");
    console.log(userEmail);
    pool.query("select  s.id_site,\n" +
        "    s.site_name,\n" +
        "    s.user_email, \n" +
        "    (select count(*) from PN_CAMPAIGNS AS c where c.id_site = s.id_site)  as campaigns,\n" +
        " (select count(*) from PN_SUBSCRIPTIONS AS u where s.id_site = u.project_id)  as users\n" +
        "FROM\n" +
        "    push_notif.PN_SITES AS s\n" +
        "where  s.user_email = ?\n" +
        "AND s.active = 1",[userEmail],(error,results)=>{
     if(error)
     {
         console.log(error);
         cb({
             message : "Couldn't insert site",
             status : 0
         })
     }
        console.log(results);

        let arr = [];
    results.forEach((row,index)=>{
        console.log(index);
        const model = new siteModel(row.id_site, row.site_name, row.site_url, row.user_email,parseInt(row.active),parseInt(row.campaigns),parseInt(row.users));
        arr.push(model);

    })



     cb({
         message: "Site Added",
         status: 1,
         sites : arr
     })


 })

}
module.exports.getSingleSite = async function(idSite,cb){
    pool.query("select  s.id_site,\n" +
        "    s.site_name,\n" +
        "    s.user_email, \n" +
        "    (select count(*) from PN_CAMPAIGNS AS c where c.id_site = s.id_site)  as campaigns,\n" +
        "\t(select count(*) from PN_SUBSCRIPTIONS AS u where s.id_site = u.project_id)  as users\n" +
        "FROM\n" +
        "    push_notif.PN_SITES AS s\n" +
        "where  s.user_email = ? and s.id_site=? \n" +
        "AND s.active = 1",[idSite],(error,results)=>{
        if(error){
            console.log(error);
            cb({
                message : `Couldn't get site with id: ${idSite}`,
                status : 0
            })
        }

        console.log(results);
        let row=results[0];

        if(row) {
            let site = new siteModel(row.id_site, row.site_name, row.site_url, row.user_email, parseInt(row.active), parseInt(row.campaigns), parseInt(row.users))
            cb({
                message: `Got site with id: ${idSite}`,
                status: 1,
                site
            })
        }

       else  cb({
            message: `There is no site with this id: ${idSite}`,
            status: 1,
            site : null
        })

    })
}
module.exports.deleteSite = async function( idSite, cb){
 pool.query("UPDATE `push_notif`.`PN_SITES`\n" +
     "SET\n" +
     "`active` = 0\n" +
     "WHERE `id_site` = ?\n",[idSite],(error,results)=>{
     if(error)
     {
         console.log(error);
         cb({
             message : "Couldn't delete site",
             status : 0
         })
     }

     cb({
         message: "Delete successfull",
         status: 1
     })
 })

}
module.exports.getAllCampaignsForSite = async function(idSite,cb){

    pool.query("SELECT `PN_CAMPAIGNS`.`id_campaign`,\n" +
        "    `PN_CAMPAIGNS`.`campaign_name`,\n" +
        "    `PN_CAMPAIGNS`.`campaign_description`,\n" +
        "    `PN_CAMPAIGNS`.`notification_title`,\n" +
        "    `PN_CAMPAIGNS`.`notification_message`,\n" +
        "    `PN_CAMPAIGNS`.`notification_url`,\n" +
        "    `PN_CAMPAIGNS`.`notification_icon`,\n" +
        "    `PN_CAMPAIGNS`.`creation_date`,\n" +
        "    `PN_CAMPAIGNS`.`schedule_time`,\n" +
        "    `PN_CAMPAIGNS`.`is_push`,\n" +
        "    `PN_CAMPAIGNS`.`nr_sent`,\n" +
        "    `PN_CAMPAIGNS`.`nr_opened`\n" +
        "FROM  `PN_CAMPAIGNS`\n" +
        "where `PN_CAMPAIGNS`.`active`=1\n" +
        "and `PN_CAMPAIGNS`.`id_site`=?\n",[idSite],(error,results)=>{
        if(error)
        {
            console.log(error);
            cb({
                message : "Couldn't get campaigns for site",
                status : 0,
                campaigns: null
            })
        }

        console.log(results);
            let arr=[];
        results.forEach((row)=>{
            let campaign = new campaignModel
                (
                    row.id_campaign,
                    row.campaign_name,
                    row.campaign_description,
                    row.notification_title,
                    row.notification_message,
                    row.notification_url,
                    row.notification_icon,
                    row.creation_date,
                    row.schedule_time,
                    row.is_push,
                    row.nr_sent,
                    row.nr_opened
                )

            arr.push(campaign)
        })

        console.log(arr);


        cb({
            message: "Got campaigns for site",
            status: 1,
            campaigns: arr
        })
    })

}
module.exports.insertCampaign = async function( idSite, campaignName, campaignDescription, notificationTitle, notificationMessage, notificationUrl, notificationIcon, creationDate, timeScheduled, cb){

    pool.query("INSERT INTO `push_notif`.`PN_CAMPAIGNS`\n" +
        "(`id_site`,\n" +
        "`campaign_name`,\n" +
        "`campaign_description`,\n" +
        "`notification_title`,\n" +
        "`notification_message`,\n" +
        "`notification_url`,\n" +
        "`notification_icon`,\n" +
        "`creation_date`,\n" +
        "`schedule_time`,\n" +
        "`active`)"+
            "VALUES\n" +
        "(?,\n" +
        "?,\n" +
        "?,\n" +
        "?,\n" +
        "?,\n" +
        "?,\n" +
        "?,\n" +
        "?,\n" +
        "?,\n" +
        "?);\n",[idSite, campaignName, campaignDescription, notificationTitle, notificationMessage, notificationUrl, notificationIcon, creationDate, timeScheduled,1],(error,results)=>{
        console.log("finished");
        if(error)
        {
            console.log(error);
            cb({
                message : "Couldn't insert campaign",
                status : 0
            })
        }
        console.log(results);
        const campaignId = results.insertId;
        console.log(campaignId);

        cb({
            message: "Campaign Added",
            status: 1
        },campaignId)

    });

}

module.exports.getSingleCampaign = async function(idCampaign,cb){
    pool.query("SELECT `PN_CAMPAIGNS`.`id_campaign`,\n" +
        "    `PN_CAMPAIGNS`.`campaign_name`,\n" +
        "    `PN_CAMPAIGNS`.`campaign_description`,\n" +
        "    `PN_CAMPAIGNS`.`notification_title`,\n" +
        "    `PN_CAMPAIGNS`.`notification_message`,\n" +
        "    `PN_CAMPAIGNS`.`notification_url`,\n" +
        "    `PN_CAMPAIGNS`.`notification_icon`,\n" +
        "    `PN_CAMPAIGNS`.`creation_date`,\n" +
        "    `PN_CAMPAIGNS`.`schedule_time`,\n" +
        "    `PN_CAMPAIGNS`.`is_push`,\n" +
        "    `PN_CAMPAIGNS`.`nr_sent`,\n" +
        "    `PN_CAMPAIGNS`.`nr_opened`\n" +
        "FROM  `PN_CAMPAIGNS`\n" +
        "where `PN_CAMPAIGNS`.`active`=1\n" +
        "and `PN_CAMPAIGNS`.`id_campaign`=?\n",[idCampaign],(error,results)=>{
        if(error){
            console.log(error);
            cb({
                message : `Couldn't get campaign with id: ${idCampaign}`,
                status : 0
            })
        }

      //  console.log(results);
        let row=results[0];

        if(row) {
            let campaign = new campaignModel( row.id_campaign, row.campaign_name, row.campaign_description,  row.notification_title,
                row.notification_message,
                row.notification_url,
                row.notification_icon, row.creation_date, row.schedule_time,row.is_push,
                row.nr_sent,row.nr_opened)
            cb({
                message: `Got site with id: ${idCampaign}`,
                status: 1,
                campaign
            })
        }

        else  cb({
            message: `There is no site with this id: ${campaign}`,
            status: 1,
            campaign : null
        })

    })
}


