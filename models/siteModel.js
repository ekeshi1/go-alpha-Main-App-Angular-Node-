
var site = function (idSite, siteName, urlSite, user_email,active,campaigns,users) {
    this.idSite = idSite;
    this.siteName=siteName;
    this.urlSite = urlSite;
    this.userEmail = user_email;
    this.active = active;
    this.campaigns= campaigns;
    this.users= users;
};

module.exports= site;


