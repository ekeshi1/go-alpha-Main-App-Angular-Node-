var campaigns = function (campaignId, campaignName, campaignDescription, notificationTitle, notificationMessage, notificationUrl, notificationIcon, creationDate,scheduleTime,isPush, nrSent, nrOpened) {
    this.campaignId = campaignId;
    this.campaignName = campaignName;
    this.campaignDescription = campaignDescription;
    this.notificationTitle = notificationTitle;
    this.notificationMessage = notificationMessage;
    this.notificationUrl = notificationUrl;
    this.notificationIcon = notificationIcon;
    this.creationDate = creationDate;
    this.scheduleTime= scheduleTime;
    this.isPush= isPush;
    this.nrSent= nrSent;
    this.nrOpened= nrOpened;
};

module.exports= campaigns;

