app = {
    currentUser: window.JOSSO_USER || ""
}

Ext.Ajax.disableCaching = false;

Ext.onReady(function() {
    var mainPanel = Ext.create('Ext.gispro.ProfilePanel', {
        title: 'Менеджер профилей',
        id: 'profilePanel'
    });
    var viewPort = new Ext.Panel({
        renderTo: 'mainContainer',
        layout: "fit",
        height: "100%",
        items: [ mainPanel ]
    });
    viewPort.doLayout();   
});

setCurrentProfileId = function(id){
    window.location = OV_PREFERENCES_URL + "&mode=view&profileId="+id;
}